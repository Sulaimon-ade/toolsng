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
  cra: number;
  deductions: {
    pension: number;
    nhf: number;
    nhis: number;
    rentRelief: number;
    cra: number;
    total: number;
  };
  taxableIncome: number;
  brackets: TaxBracketResult[];
  annualTax: number;
  monthlyPaye: number;
  effectiveTaxRate: number;
  netAnnualIncome: number;
  netMonthlyIncome: number;
  assumptions: string[];
  calculationSteps: string[];
  audit?: any;
}

export class TaxEngine {
  private rules: any;

  constructor(version: string = '2026.1') {
    this.rules = rules2026;
  }

  private fmt(n: number): string {
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  public calculate(input: TaxInput): TaxOutput {
    const assumptions: string[] = [];
    const steps: string[] = [];

    // ── STEP 1: Gross Income ──────────────────────────────────────────────────
    const grossIncome =
      input.basicSalary +
      input.housingAllowance +
      input.transportAllowance +
      input.otherAllowances;

    steps.push(
      `STEP 1 — Gross Annual Income = Basic (${this.fmt(input.basicSalary)}) + Housing (${this.fmt(input.housingAllowance)}) + Transport (${this.fmt(input.transportAllowance)}) + Other (${this.fmt(input.otherAllowances)}) = ${this.fmt(grossIncome)}`
    );

    // ── STEP 2: Statutory Deductions ─────────────────────────────────────────

    // Pension — 8% of (Basic + Housing + Transport)
    let pension = 0;
    if (input.pensionContributionOverride !== undefined) {
      pension = input.pensionContributionOverride;
      assumptions.push(`Pension: user override of ${this.fmt(pension)}`);
      steps.push(`STEP 2a — Pension = ${this.fmt(pension)} (User Override)`);
    } else {
      const pensionBase = input.basicSalary + input.housingAllowance + input.transportAllowance;
      pension = pensionBase * this.rules.deductions.pension.rate;
      assumptions.push(`Pension: 8% of (Basic + Housing + Transport)`);
      steps.push(`STEP 2a — Pension = 8% × ${this.fmt(pensionBase)} = ${this.fmt(pension)}`);
    }

    // NHF — 2.5% of Basic Salary ONLY (not gross)
    let nhf = 0;
    if (input.nhfContributionOverride !== undefined) {
      nhf = input.nhfContributionOverride;
      assumptions.push(`NHF: user override of ${this.fmt(nhf)}`);
      steps.push(`STEP 2b — NHF = ${this.fmt(nhf)} (User Override)`);
    } else {
      nhf = input.basicSalary * this.rules.deductions.nhf.rate;
      assumptions.push(`NHF: 2.5% of Basic Salary only (per NHF Act)`);
      steps.push(`STEP 2b — NHF = 2.5% × Basic (${this.fmt(input.basicSalary)}) = ${this.fmt(nhf)}`);
    }

    // NHIS — 5% of Gross (employee share, optional)
    let nhis = 0;
    if (input.nhisContributionOverride !== undefined) {
      nhis = input.nhisContributionOverride;
      assumptions.push(`NHIS: user override of ${this.fmt(nhis)}`);
      steps.push(`STEP 2c — NHIS = ${this.fmt(nhis)} (User Override)`);
    } else {
      const rate = input.nhisRate !== undefined ? input.nhisRate : this.rules.deductions.nhis.defaultRate;
      nhis = grossIncome * rate;
      assumptions.push(`NHIS: ${rate * 100}% of Gross Income (employee share)`);
      steps.push(`STEP 2c — NHIS = ${rate * 100}% × ${this.fmt(grossIncome)} = ${this.fmt(nhis)}`);
    }

    // Rent Relief — up to ₦500,000
    const rentReliefRaw = input.annualRentPaid * this.rules.deductions.rentRelief.rate;
    const rentRelief = Math.min(rentReliefRaw, this.rules.deductions.rentRelief.maxCap);
    steps.push(
      `STEP 2d — Rent Relief = Min(${this.fmt(input.annualRentPaid)}, cap ₦500,000) = ${this.fmt(rentRelief)}`
    );

    const statutoryDeductions = pension + nhf + nhis;
    steps.push(
      `STEP 2e — Total Statutory Deductions = Pension + NHF + NHIS = ${this.fmt(pension)} + ${this.fmt(nhf)} + ${this.fmt(nhis)} = ${this.fmt(statutoryDeductions)}`
    );

    // ── STEP 3: CRA (Consolidated Relief Allowance) ───────────────────────────
    // CRA = Higher of (₦200,000 or 1% of Gross) + 20% of Gross
    const craBase = Math.max(
      this.rules.cra.minimumFlat,
      grossIncome * this.rules.cra.percentOfGross
    );
    const cra = craBase + grossIncome * this.rules.cra.additionalPercentOfGross;
    steps.push(
      `STEP 3 — CRA = Max(₦200,000, 1% of ${this.fmt(grossIncome)}) + 20% of ${this.fmt(grossIncome)}`
    );
    steps.push(
      `         = Max(₦200,000, ${this.fmt(grossIncome * 0.01)}) + ${this.fmt(grossIncome * 0.20)}`
    );
    steps.push(`         = ${this.fmt(craBase)} + ${this.fmt(grossIncome * 0.20)} = ${this.fmt(cra)}`);

    // ── STEP 4: Taxable Income ────────────────────────────────────────────────
    // Taxable Income = Gross - Statutory Deductions - CRA - Rent Relief
    const totalReliefsAndDeductions = statutoryDeductions + cra + rentRelief;
    let taxableIncome = grossIncome - totalReliefsAndDeductions;
    if (taxableIncome < 0) {
      steps.push(`STEP 4 — Taxable Income = ${this.fmt(grossIncome)} - ${this.fmt(totalReliefsAndDeductions)} = negative → floored to ₦0`);
      taxableIncome = 0;
    } else {
      steps.push(
        `STEP 4 — Taxable Income = ${this.fmt(grossIncome)} - Stat.Deductions (${this.fmt(statutoryDeductions)}) - CRA (${this.fmt(cra)}) - Rent Relief (${this.fmt(rentRelief)}) = ${this.fmt(taxableIncome)}`
      );
    }

    // ── STEP 5: Apply Tax Brackets ────────────────────────────────────────────
    // The ₦800,000 first band is taxed at 0% — it is NOT deducted upfront.
    // We run the full taxableIncome through every bracket including the 0% one.
    let remaining = taxableIncome;
    let annualTax = 0;
    const brackets: TaxBracketResult[] = [];

    steps.push(`STEP 5 — Apply 2026 PAYE Brackets to Taxable Income of ${this.fmt(taxableIncome)}:`);

    for (const bracket of this.rules.brackets) {
      if (remaining <= 0) break;

      const amountInBracket = bracket.limit
        ? Math.min(remaining, bracket.limit)
        : remaining;

      const taxInBracket = amountInBracket * bracket.rate;
      annualTax += taxInBracket;
      remaining -= amountInBracket;

      brackets.push({
        range: bracket.label,
        rate: bracket.rate,
        taxableAmount: amountInBracket,
        tax: taxInBracket
      });

      steps.push(
        `         ${bracket.label}: ${this.fmt(amountInBracket)} × ${bracket.rate * 100}% = ${this.fmt(taxInBracket)}`
      );
    }

    annualTax = Math.max(0, annualTax);
    steps.push(`         Total Annual PAYE Tax = ${this.fmt(annualTax)}`);

    // ── STEP 6: Net Income ────────────────────────────────────────────────────
    const monthlyPaye = annualTax / 12;
    const netAnnualIncome = grossIncome - statutoryDeductions - annualTax;
    const netMonthlyIncome = netAnnualIncome / 12;
    const effectiveTaxRate = grossIncome > 0 ? (annualTax / grossIncome) * 100 : 0;

    steps.push(
      `STEP 6 — Net Annual Income = ${this.fmt(grossIncome)} - ${this.fmt(statutoryDeductions)} - ${this.fmt(annualTax)} = ${this.fmt(netAnnualIncome)}`
    );
    steps.push(`         Monthly PAYE = ${this.fmt(annualTax)} / 12 = ${this.fmt(monthlyPaye)}`);
    steps.push(`         Net Monthly Income = ${this.fmt(netAnnualIncome)} / 12 = ${this.fmt(netMonthlyIncome)}`);
    steps.push(`         Effective Tax Rate = ${effectiveTaxRate.toFixed(2)}%`);

    const audit = {
      grossIncome,
      basicSalary: input.basicSalary,
      housingAllowance: input.housingAllowance,
      transportAllowance: input.transportAllowance,
      otherAllowances: input.otherAllowances,
      pension,
      nhf,
      nhis,
      rentRelief,
      cra,
      statutoryDeductions,
      taxableIncome,
      annualTax,
      monthlyPAYE: monthlyPaye,
      netAnnualIncome,
      netMonthlyIncome,
      effectiveTaxRate
    };

    return {
      grossIncome,
      cra,
      deductions: {
        pension,
        nhf,
        nhis,
        rentRelief,
        cra,
        total: statutoryDeductions
      },
      taxableIncome,
      brackets,
      annualTax,
      monthlyPaye,
      effectiveTaxRate,
      netAnnualIncome,
      netMonthlyIncome,
      assumptions,
      calculationSteps: steps,
      audit
    };
  }
}
