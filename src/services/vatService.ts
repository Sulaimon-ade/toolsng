export interface VATInput {
  price: number;
  mode: 'add' | 'remove';
  turnover?: number;
  regime?: 'legacy' | '2025';
}

export interface VATOutput {
  basePrice: number;
  vatAmount: number;
  totalPrice: number;
  taxBasis: string;
  vatRate: number;
  note?: string;
}

export function calculateVAT(input: VATInput): VATOutput {
  if (input.price < 0) {
    throw new Error("Price cannot be negative.");
  }

  const regime = input.regime || '2025';
  const vatRate = 0.075; // 7.5% for both legacy and 2025
  const taxBasis = regime === 'legacy' 
    ? 'Legacy Regime: VAT at 7.5%' 
    : 'Nigeria Tax Act 2025: VAT at 7.5%';

  let basePrice = 0;
  let vatAmount = 0;
  let totalPrice = 0;

  if (input.mode === 'add') {
    basePrice = input.price;
    vatAmount = basePrice * vatRate;
    totalPrice = basePrice + vatAmount;
  } else if (input.mode === 'remove') {
    totalPrice = input.price;
    vatAmount = (totalPrice * (vatRate * 100)) / (100 + (vatRate * 100));
    basePrice = totalPrice - vatAmount;
  }

  let note;
  if (input.turnover !== undefined && input.turnover < 50000000) {
    note = "VAT registration may not be mandatory below ₦50M annual turnover.";
  }

  return {
    basePrice,
    vatAmount,
    totalPrice,
    taxBasis,
    vatRate,
    note
  };
}
