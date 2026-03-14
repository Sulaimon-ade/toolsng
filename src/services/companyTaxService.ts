export interface CITInput {
  revenue: number;
  expenses: number;
  companyType?: 'Small' | 'Medium' | 'Large'; // Kept for backward compatibility if needed
  regime?: 'legacy' | '2025';
}

export interface CITOutput {
  revenue: number;
  expenses: number;
  profit: number;
  companyType: string;
  citRate: number;
  citAmount: number;
  educationTax?: number; // Kept for legacy
  developmentLevy: number;
  totalBusinessTax: number;
  netProfitAfterTax: number;
  taxBasis: string;
}

export function calculateCompanyTax(input: CITInput): CITOutput {
  if (input.revenue < 0 || input.expenses < 0) {
    throw new Error("Revenue and expenses cannot be negative.");
  }
  if (input.revenue === 0) {
    throw new Error("Revenue cannot be zero for tax calculations.");
  }
  if (input.expenses > input.revenue) {
    throw new Error("Expenses cannot exceed revenue.");
  }

  const profit = input.revenue - input.expenses;
  const regime = input.regime || '2025';
  
  let citRate = 0;
  let edtRate = 0;
  let devLevyRate = 0;
  let taxBasis = '';
  let determinedCompanyType = 'Small';

  if (input.revenue <= 25000000) {
    determinedCompanyType = 'Small';
  } else if (input.revenue <= 100000000) {
    determinedCompanyType = 'Medium';
  } else {
    determinedCompanyType = 'Large';
  }

  if (regime === 'legacy') {
    taxBasis = 'Legacy Regime (Pre-2025): CIT at 0% (<₦25m), 20% (₦25m-₦100m), 30% (>₦100m). Education Tax at 3%.';
    const compType = input.companyType || determinedCompanyType;
    determinedCompanyType = compType;
    if (compType === 'Small') {
      citRate = 0;
      edtRate = 0;
    } else if (compType === 'Medium') {
      citRate = 0.20;
      edtRate = 0.03;
    } else if (compType === 'Large') {
      citRate = 0.30;
      edtRate = 0.03;
    }
  } else {
    taxBasis = 'Nigeria Tax Act 2025 (CIT + Development Levy)';
    if (determinedCompanyType === 'Small') {
      citRate = 0;
      devLevyRate = 0;
    } else if (determinedCompanyType === 'Medium') {
      citRate = 0.20;
      devLevyRate = 0.04;
    } else {
      citRate = 0.30;
      devLevyRate = 0.04;
    }
  }

  const citAmount = profit * citRate;
  const educationTax = profit * edtRate;
  const developmentLevy = profit * devLevyRate;
  const totalBusinessTax = citAmount + educationTax + developmentLevy;
  const netProfitAfterTax = profit - totalBusinessTax;

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
    taxBasis
  };
}
