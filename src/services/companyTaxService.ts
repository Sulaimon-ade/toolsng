export interface CITInput {
  revenue: number;
  expenses: number;
  companyType?: 'Small' | 'Medium' | 'Large'; // used in legacy mode only
  regime?: 'legacy' | '2026';
}

export interface CITOutput {
  revenue: number;
  expenses: number;
  profit: number;
  companyType: string;
  citRate: number;
  citAmount: number;
  educationTax: number;
  developmentLevy: number;
  totalBusinessTax: number;
  netProfitAfterTax: number;
  taxBasis: string;
  calculationSteps: string[];
}

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateCompanyTax(input: CITInput): CITOutput {
  if (input.revenue < 0 || input.expenses < 0) {
    throw new Error('Revenue and expenses cannot be negative.');
  }
  if (input.revenue === 0) {
    throw new Error('Revenue cannot be zero for tax calculations.');
  }
  if (input.expenses > input.revenue) {
    throw new Error('Expenses cannot exceed revenue.');
  }

  const profit = input.revenue - input.expenses;
  const regime = input.regime || '2026';
  const steps: string[] = [];

  let citRate = 0;
  let edtRate = 0;
  let devLevyRate = 0;
  let taxBasis = '';
  let determinedCompanyType = 'Small';

  // Determine company type by revenue (applies to both regimes)
  if (input.revenue <= 25_000_000) {
    determinedCompanyType = 'Small';
  } else if (input.revenue <= 100_000_000) {
    determinedCompanyType = 'Medium';
  } else {
    determinedCompanyType = 'Large';
  }

  steps.push(`STEP 1 — Taxable Profit = Revenue − Expenses = ${fmt(input.revenue)} − ${fmt(input.expenses)} = ${fmt(profit)}`);
  steps.push(`STEP 2 — Company Type determined by revenue: ${determinedCompanyType} (Revenue: ${fmt(input.revenue)})`);

  if (regime === 'legacy') {
    // ── Pre-2026 legacy rates ──────────────────────────────────────────────
    taxBasis = 'Legacy Regime (Pre-2026): CIT at 0% (<₦25m), 20% (₦25m–₦100m), 30% (>₦100m). Education Tax at 3% of profit.';
    const compType = input.companyType || determinedCompanyType;
    determinedCompanyType = compType;

    if (compType === 'Small') {
      citRate = 0; edtRate = 0;
      steps.push('STEP 3 — Small company (<₦25m): CIT = 0%, Education Tax = 0%');
    } else if (compType === 'Medium') {
      citRate = 0.20; edtRate = 0.03;
      steps.push('STEP 3 — Medium company (₦25m–₦100m): CIT = 20%, Education Tax = 3%');
    } else {
      citRate = 0.30; edtRate = 0.03;
      steps.push('STEP 3 — Large company (>₦100m): CIT = 30%, Education Tax = 3%');
    }
  } else {
    // ── Finance Act 2026 rates (effective 1 January 2026) ─────────────────
    // Key changes from 2026:
    // - Large company CIT raised from 25% → 30%
    // - Medium company CIT stays at 20%
    // - Small company still exempt (0%)
    // - Development Levy (4%) ABOLISHED
    // - Education Tax stays at 3% of assessable profit
    taxBasis = 'Nigeria Finance Act 2026 (effective 1 Jan 2026): CIT at 0% (<₦25m), 20% (₦25m–₦100m), 30% (>₦100m). Education Tax 3%. Development Levy abolished.';

    if (determinedCompanyType === 'Small') {
      citRate = 0; edtRate = 0; devLevyRate = 0;
      steps.push('STEP 3 — Small company (<₦25m): CIT = 0%, Education Tax = 0%, Development Levy = 0% (abolished)');
    } else if (determinedCompanyType === 'Medium') {
      citRate = 0.20; edtRate = 0.03; devLevyRate = 0;
      steps.push('STEP 3 — Medium company (₦25m–₦100m): CIT = 20%, Education Tax = 3%, Development Levy = 0% (abolished)');
    } else {
      citRate = 0.30; edtRate = 0.03; devLevyRate = 0;
      steps.push('STEP 3 — Large company (>₦100m): CIT = 30%, Education Tax = 3%, Development Levy = 0% (abolished)');
    }
  }

  const citAmount = profit * citRate;
  const educationTax = profit * edtRate;
  const developmentLevy = profit * devLevyRate; // always 0 in 2026 regime
  const totalBusinessTax = citAmount + educationTax + developmentLevy;
  const netProfitAfterTax = profit - totalBusinessTax;

  steps.push(`STEP 4 — CIT = ${fmt(profit)} × ${citRate * 100}% = ${fmt(citAmount)}`);
  if (edtRate > 0) steps.push(`STEP 5 — Education Tax = ${fmt(profit)} × ${edtRate * 100}% = ${fmt(educationTax)}`);
  steps.push(`STEP 6 — Total Business Tax = ${fmt(citAmount)} + ${fmt(educationTax)} = ${fmt(totalBusinessTax)}`);
  steps.push(`STEP 7 — Net Profit After Tax = ${fmt(profit)} − ${fmt(totalBusinessTax)} = ${fmt(netProfitAfterTax)}`);

  return {
    revenue: input.revenue,
    expenses: input.expenses,
    profit,
    companyType: determinedCompanyType,
    citRate,
    citAmount,
    educationTax,
    developmentLevy,
    totalBusinessTax,
    netProfitAfterTax,
    taxBasis,
    calculationSteps: steps
  };
}
