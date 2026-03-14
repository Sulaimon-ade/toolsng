import rules2026 from '../config/tax_rules_2026.json';

export interface TaxInput {
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  annualRentPaid: number;
  pensionContributionOverride?: number;
  nhfContributionOverride?: number;
  nhisContributionOverride?: number;
  nhisRate?: number;
}

export interface TaxBracketResult {
  range: string;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface TaxOutput {
  grossIncome: number;
  deductions: {
    pension: number;
    nhf: number;
    nhis: number;
    rentRelief: number;
    taxFreeThreshold: number;
    total: number;
  };
  taxableIncome: number;
  brackets: TaxBracketResult[];
  annualTax: number;
  monthlyPaye: number;
  effectiveTaxRate: number;
  netIncome: number;
  assumptions: string[];
  calculationSteps: string[];
  audit?: any;
}

export class TaxEngine {
  private rules: any;

  constructor(version: string = '2026.1') {
    // In a real app, load based on version. For now, hardcode 2026.
    this.rules = rules2026;
  }

  public calculate(input: TaxInput): TaxOutput {
    const assumptions: string[] = [];
    const calculationSteps: string[] = [];

    // 1. Gross Income
    const grossIncome = 
      input.basicSalary + 
      input.housingAllowance + 
      input.transportAllowance + 
      input.otherAllowances;

    calculationSteps.push(`Gross Income = Basic (${input.basicSalary}) + Housing (${input.housingAllowance}) + Transport (${input.transportAllowance}) + Other (${input.otherAllowances}) = ${grossIncome}`);

    // 2. Statutory Deductions
    // Pension
    let pension = 0;
    if (input.pensionContributionOverride !== undefined) {
      pension = input.pensionContributionOverride;
      assumptions.push(`Pension contribution provided by user: ${pension}`);
      calculationSteps.push(`Pension = ${pension} (User Override)`);
    } else {
      const pensionBase = input.basicSalary + input.housingAllowance + input.transportAllowance;
      pension = pensionBase * this.rules.deductions.pension.rate;
      assumptions.push(`Pension calculated as ${this.rules.deductions.pension.rate * 100}% of (Basic + Housing + Transport)`);
      calculationSteps.push(`Pension = ${this.rules.deductions.pension.rate * 100}% of ${pensionBase} = ${pension}`);
    }

    // NHF
    let nhf = 0;
    if (input.nhfContributionOverride !== undefined) {
      nhf = input.nhfContributionOverride;
      assumptions.push(`NHF contribution provided by user: ${nhf}`);
      calculationSteps.push(`NHF = ${nhf} (User Override)`);
    } else {
      nhf = grossIncome * this.rules.deductions.nhf.rate;
      assumptions.push(`NHF calculated as ${this.rules.deductions.nhf.rate * 100}% of Gross Income`);
      calculationSteps.push(`NHF = ${this.rules.deductions.nhf.rate * 100}% of ${grossIncome} = ${nhf}`);
    }

    // NHIS
    let nhis = 0;
    if (input.nhisContributionOverride !== undefined) {
      nhis = input.nhisContributionOverride;
      assumptions.push(`NHIS contribution provided by user: ${nhis}`);
      calculationSteps.push(`NHIS = ${nhis} (User Override)`);
    } else {
      const rate = input.nhisRate !== undefined ? input.nhisRate : this.rules.deductions.nhis.defaultRate;
      nhis = grossIncome * rate;
      assumptions.push(`NHIS calculated as ${rate * 100}% of Gross Income`);
      calculationSteps.push(`NHIS = ${rate * 100}% of ${grossIncome} = ${nhis}`);
    }

    const statutoryDeductions = pension + nhf + nhis;
    calculationSteps.push(`Total Statutory Deductions = Pension (${pension}) + NHF (${nhf}) + NHIS (${nhis}) = ${statutoryDeductions}`);

    const incomeAfterStatutory = grossIncome - statutoryDeductions;
    calculationSteps.push(`Income after Statutory Deductions = ${grossIncome} - ${statutoryDeductions} = ${incomeAfterStatutory}`);

    // Rent Relief
    const rentReliefCalc = input.annualRentPaid * this.rules.deductions.rentRelief.rate;
    const rentRelief = Math.min(rentReliefCalc, this.rules.deductions.rentRelief.maxCap);
    calculationSteps.push(`Rent Relief = Min(20% of ${input.annualRentPaid}, ${this.rules.deductions.rentRelief.maxCap}) = ${rentRelief}`);

    const totalReliefs = rentRelief + this.rules.taxFreeThreshold;
    calculationSteps.push(`Total Reliefs = Rent Relief (${rentRelief}) + Tax Free Threshold (${this.rules.taxFreeThreshold}) = ${totalReliefs}`);

    // 3. Taxable Income
    let taxableIncome = incomeAfterStatutory - totalReliefs;
    if (taxableIncome < 0) {
      calculationSteps.push(`Computed Taxable Income (${taxableIncome}) is less than 0. Flooring to 0.`);
      taxableIncome = 0;
    } else {
      calculationSteps.push(`Chargeable / Taxable Income = ${incomeAfterStatutory} - ${totalReliefs} = ${taxableIncome}`);
    }

    // 4. Tax Brackets
    let remainingTaxable = taxableIncome;
    let annualTax = 0;
    const brackets: TaxBracketResult[] = [];

    for (const bracket of this.rules.brackets) {
      if (remainingTaxable <= 0) break;
      if (bracket.rate === 0) continue; // Skip the 0% bracket as it's the threshold

      const amountInBracket = bracket.limit ? Math.min(remainingTaxable, bracket.limit) : remainingTaxable;
      const taxInBracket = amountInBracket * bracket.rate;
      
      brackets.push({
        range: bracket.limit ? `Next ₦${bracket.limit.toLocaleString()}` : 'Remaining',
        rate: bracket.rate,
        taxableAmount: amountInBracket,
        tax: taxInBracket
      });

      annualTax += taxInBracket;
      remainingTaxable -= amountInBracket;
    }

    annualTax = Math.max(0, annualTax);
    calculationSteps.push(`Annual Tax = Sum of bracket taxes = ${annualTax}`);

    const monthlyPaye = annualTax / 12;
    const netIncome = grossIncome - statutoryDeductions - annualTax;
    calculationSteps.push(`Net Annual Income = Gross (${grossIncome}) - Statutory Deductions (${statutoryDeductions}) - Annual Tax (${annualTax}) = ${netIncome}`);
    
    const effectiveTaxRate = grossIncome > 0 ? (annualTax / grossIncome) * 100 : 0;

    const audit = {
      grossIncome,
      assumedBasic: input.basicSalary,
      assumedHousing: input.housingAllowance,
      assumedTransport: input.transportAllowance,
      pension,
      nhis,
      nhf,
      totalDeductions: statutoryDeductions,
      reliefs: totalReliefs,
      taxableIncome,
      annualTax,
      monthlyPAYE: monthlyPaye,
      netAnnualIncome: netIncome
    };

    return {
      grossIncome,
      deductions: {
        pension,
        nhf,
        nhis,
        rentRelief,
        taxFreeThreshold: this.rules.taxFreeThreshold,
        total: statutoryDeductions // Only actual deductions that reduce net pay
      },
      taxableIncome,
      brackets,
      annualTax,
      monthlyPaye,
      effectiveTaxRate,
      netIncome,
      assumptions,
      calculationSteps,
      audit
    };
  }
}
