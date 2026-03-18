// VAT rates per Nigeria Finance Act
// Nigeria VAT has been 7.5% since Finance Act 2019 (effective Feb 2020)
// Finance Act 2026 retains VAT at 7.5% — there is NO 10% VAT in Nigeria

export type VATMode = 'add' | 'remove';

export interface VATInput {
  price: number;
  mode: VATMode;
  turnover?: number;
  regime?: 'legacy' | '2026';
}

export interface VATOutput {
  basePrice: number;
  vatAmount: number;
  totalPrice: number;
  vatRate: number;
  taxBasis: string;
  note?: string;
  calculationSteps: string[];
}

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateVAT(input: VATInput): VATOutput {
  if (input.price < 0) throw new Error('Price cannot be negative.');
  if (input.price === 0) throw new Error('Price cannot be zero.');

  const regime = input.regime || '2026';
  const steps: string[] = [];

  // VAT rate:
  // - Pre-2020 (legacy): 5%
  // - Finance Act 2019 onwards (including 2026): 7.5%
  // There is NO 10% VAT in Nigeria
  const vatRate = regime === 'legacy' ? 0.05 : 0.075;
  const taxBasis = regime === 'legacy'
    ? 'Legacy Regime (Pre-2020): VAT at 5% (before Finance Act 2019)'
    : 'Nigeria Finance Act 2026: VAT at 7.5% (unchanged since Finance Act 2019, effective Feb 2020)';

  let basePrice = 0;
  let vatAmount = 0;
  let totalPrice = 0;

  if (input.mode === 'add') {
    // VAT-exclusive: add VAT on top
    basePrice = input.price;
    vatAmount = basePrice * vatRate;
    totalPrice = basePrice + vatAmount;
    steps.push(`Mode: Add VAT to amount (VAT-exclusive price)`);
    steps.push(`Base Price (Excl. VAT) = ${fmt(basePrice)}`);
    steps.push(`VAT = ${fmt(basePrice)} × ${vatRate * 100}% = ${fmt(vatAmount)}`);
    steps.push(`Total Price (Incl. VAT) = ${fmt(basePrice)} + ${fmt(vatAmount)} = ${fmt(totalPrice)}`);
  } else {
    // VAT-inclusive: extract VAT from total
    totalPrice = input.price;
    vatAmount = totalPrice * vatRate / (1 + vatRate);
    basePrice = totalPrice - vatAmount;
    steps.push(`Mode: Extract VAT from amount (VAT-inclusive price)`);
    steps.push(`Total Price (Incl. VAT) = ${fmt(totalPrice)}`);
    steps.push(`VAT = ${fmt(totalPrice)} × ${vatRate * 100}% / (1 + ${vatRate * 100}%) = ${fmt(vatAmount)}`);
    steps.push(`Base Price (Excl. VAT) = ${fmt(totalPrice)} − ${fmt(vatAmount)} = ${fmt(basePrice)}`);
  }

  let note: string | undefined;
  if (input.turnover !== undefined) {
    if (input.turnover < 25_000_000) {
      note = 'VAT registration is NOT mandatory below ₦25M annual turnover (Finance Act 2026 threshold). Small businesses may be exempt.';
    } else if (input.turnover < 50_000_000) {
      note = 'Annual turnover is between ₦25M–₦50M. VAT registration threshold is ₦25M under Finance Act 2026 — you may be required to register.';
    } else {
      note = 'Annual turnover exceeds ₦50M. VAT registration and filing is mandatory.';
    }
  }

  return { basePrice, vatAmount, totalPrice, vatRate, taxBasis, note, calculationSteps: steps };
}
