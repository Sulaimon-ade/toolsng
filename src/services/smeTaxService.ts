export interface SMEInput {
  revenue: number;
  expenses: number;
  businessType: 'Freelancer' | 'Small business' | 'Startup';
  regime?: 'legacy' | '2025';
}

export interface SMEOutput {
  profit: number;
  estimatedTaxBand: string;
  applicableTaxRate: number;
  estimatedTaxLiability: number;
  taxBasis: string;
}

export function estimateSMETax(input: SMEInput): SMEOutput {
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
  const regime = input.regime || 'legacy';
  
  let estimatedTaxBand = '';
  let applicableTaxRate = 0;
  let taxBasis = '';

  if (regime === 'legacy') {
    taxBasis = 'Legacy Regime: Small < ₦25m (0%), Medium ₦25m-₦100m (20% + 3% EDT), Large > ₦100m (30% + 3% EDT)';
    if (input.revenue <= 25000000) {
      estimatedTaxBand = 'Small Company (Exempt)';
      applicableTaxRate = 0;
    } else if (input.revenue > 25000000 && input.revenue <= 100000000) {
      estimatedTaxBand = 'Medium Company';
      applicableTaxRate = 0.23; // 20% CIT + 3% EDT
    } else {
      estimatedTaxBand = 'Large Company';
      applicableTaxRate = 0.33; // 30% CIT + 3% EDT
    }
  } else {
    taxBasis = 'Nigeria Tax Act 2025: Small <= ₦25m (0%), Medium <= ₦100m (24%), Large > ₦100m (34%)';
    if (input.revenue <= 25000000) {
      estimatedTaxBand = 'Small Company (Exempt)';
      applicableTaxRate = 0;
    } else if (input.revenue <= 100000000) {
      estimatedTaxBand = 'Medium Company';
      applicableTaxRate = 0.24; // 20% CIT + 4% Dev Levy
    } else {
      estimatedTaxBand = 'Large Company';
      applicableTaxRate = 0.34; // 30% CIT + 4% Dev Levy
    }
  }

  const estimatedTaxLiability = profit * applicableTaxRate;

  return {
    profit,
    estimatedTaxBand,
    applicableTaxRate,
    estimatedTaxLiability,
    taxBasis
  };
}
