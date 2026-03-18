// SME Tax Estimator — Finance Act 2026
// Uses same CIT rates as companyTaxService for consistency:
// Small (<₦25M): 0% CIT, 0% Education Tax
// Medium (₦25M–₦100M): 20% CIT + 3% Education Tax = 23% effective
// Large (>₦100M): 30% CIT + 3% Education Tax = 33% effective
// Development Levy: ABOLISHED in Finance Act 2026

export interface SMEInput {
  revenue: number;
  expenses: number;
  businessType: 'Freelancer' | 'Small business' | 'Startup';
  regime?: 'legacy' | '2026';
}

export interface SMEOutput {
  profit: number;
  estimatedTaxBand: string;
  citRate: number;
  educationTaxRate: number;
  applicableTaxRate: number;
  citAmount: number;
  educationTaxAmount: number;
  estimatedTaxLiability: number;
  netProfitAfterTax: number;
  vatRequired: boolean;
  taxBasis: string;
  obligations: string[];
  calculationSteps: string[];
}

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function estimateSMETax(input: SMEInput): SMEOutput {
  if (input.revenue < 0 || input.expenses < 0) throw new Error('Revenue and expenses cannot be negative.');
  if (input.revenue === 0) throw new Error('Revenue cannot be zero.');
  if (input.expenses > input.revenue) throw new Error('Expenses cannot exceed revenue.');

  const profit = input.revenue - input.expenses;
  const regime = input.regime || '2026';
  const steps: string[] = [];

  let estimatedTaxBand = '';
  let citRate = 0;
  let educationTaxRate = 0;
  let taxBasis = '';
  const obligations: string[] = [];

  steps.push(`STEP 1 — Taxable Profit = ${fmt(input.revenue)} − ${fmt(input.expenses)} = ${fmt(profit)}`);

  if (regime === 'legacy') {
    taxBasis = 'Legacy Regime (Pre-2026): Small <₦25M (0%), Medium ₦25M–₦100M (20% CIT + 3% EDT), Large >₦100M (30% CIT + 3% EDT)';
    if (input.revenue <= 25_000_000) {
      estimatedTaxBand = 'Small Company (Exempt)';
      citRate = 0; educationTaxRate = 0;
      steps.push('STEP 2 — Small company (Revenue <₦25M): CIT = 0%, Education Tax = 0%');
    } else if (input.revenue <= 100_000_000) {
      estimatedTaxBand = 'Medium Company';
      citRate = 0.20; educationTaxRate = 0.03;
      steps.push('STEP 2 — Medium company (₦25M–₦100M): CIT = 20%, Education Tax = 3%');
    } else {
      estimatedTaxBand = 'Large Company';
      citRate = 0.30; educationTaxRate = 0.03;
      steps.push('STEP 2 — Large company (>₦100M): CIT = 30%, Education Tax = 3%');
    }
  } else {
    // Finance Act 2026 — Development Levy abolished
    taxBasis = 'Nigeria Finance Act 2026 (effective 1 Jan 2026): Small <₦25M (0%), Medium ₦25M–₦100M (20% CIT + 3% EDT = 23%), Large >₦100M (30% CIT + 3% EDT = 33%). Development Levy abolished.';
    if (input.revenue <= 25_000_000) {
      estimatedTaxBand = 'Small Company (Exempt)';
      citRate = 0; educationTaxRate = 0;
      steps.push('STEP 2 — Small company (Revenue <₦25M): CIT = 0%, Education Tax = 0% (exempt)');
      obligations.push('✅ CIT exempt (revenue below ₦25M threshold)');
      obligations.push(input.revenue >= 25_000_000 ? '⚠️ VAT registration required (revenue ≥ ₦25M)' : '✅ VAT registration not mandatory (revenue <₦25M)');
    } else if (input.revenue <= 100_000_000) {
      estimatedTaxBand = 'Medium Company';
      citRate = 0.20; educationTaxRate = 0.03;
      steps.push('STEP 2 — Medium company (₦25M–₦100M): CIT = 20%, Education Tax = 3%');
      obligations.push('⚠️ CIT at 20% applies');
      obligations.push('⚠️ VAT registration mandatory (revenue ≥ ₦25M)');
      obligations.push('⚠️ Education Tax at 3% of assessable profit');
    } else {
      estimatedTaxBand = 'Large Company';
      citRate = 0.30; educationTaxRate = 0.03;
      steps.push('STEP 2 — Large company (>₦100M): CIT = 30%, Education Tax = 3%');
      obligations.push('⚠️ CIT at 30% applies');
      obligations.push('⚠️ VAT registration mandatory');
      obligations.push('⚠️ Education Tax at 3% of assessable profit');
      obligations.push('⚠️ Transfer pricing rules may apply');
    }
  }

  const citAmount = profit * citRate;
  const educationTaxAmount = profit * educationTaxRate;
  const applicableTaxRate = citRate + educationTaxRate;
  const estimatedTaxLiability = citAmount + educationTaxAmount;
  const netProfitAfterTax = profit - estimatedTaxLiability;
  const vatRequired = input.revenue >= 25_000_000;

  if (citRate > 0) {
    steps.push(`STEP 3 — CIT = ${fmt(profit)} × ${citRate * 100}% = ${fmt(citAmount)}`);
    steps.push(`STEP 4 — Education Tax = ${fmt(profit)} × ${educationTaxRate * 100}% = ${fmt(educationTaxAmount)}`);
    steps.push(`STEP 5 — Total Tax = ${fmt(citAmount)} + ${fmt(educationTaxAmount)} = ${fmt(estimatedTaxLiability)}`);
    steps.push(`STEP 6 — Net Profit After Tax = ${fmt(profit)} − ${fmt(estimatedTaxLiability)} = ${fmt(netProfitAfterTax)}`);
  } else {
    steps.push('STEP 3 — No CIT or Education Tax applicable (exempt)');
    steps.push(`Net Profit = ${fmt(profit)} (no tax deducted)`);
  }

  return {
    profit,
    estimatedTaxBand,
    citRate,
    educationTaxRate,
    applicableTaxRate,
    citAmount,
    educationTaxAmount,
    estimatedTaxLiability,
    netProfitAfterTax,
    vatRequired,
    taxBasis,
    obligations,
    calculationSteps: steps,
  };
}
