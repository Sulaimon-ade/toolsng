export interface WHTInput {
  paymentAmount: number;
  serviceType: 'Professional Services' | 'Rent' | 'Construction' | 'Consultancy' | 'Management fees';
  recipientType?: 'Corporate' | 'Individual';
  regime?: 'legacy' | '2025';
}

export interface WHTOutput {
  originalPayment: number;
  withholdingTax: number;
  netPayment: number;
  taxBasis: string;
  whtRate: number;
  note?: string;
}

export function calculateWHT(input: WHTInput): WHTOutput {
  if (input.paymentAmount < 0) {
    throw new Error("Payment amount cannot be negative.");
  }

  const regime = input.regime || '2025';
  let rate = 0;
  let taxBasis = '';

  if (regime === 'legacy') {
    taxBasis = 'Legacy Regime: Standard WHT rates (5% - 10%)';
    switch (input.serviceType) {
      case 'Professional Services':
      case 'Rent':
      case 'Consultancy':
      case 'Management fees':
        rate = 0.10;
        break;
      case 'Construction':
        rate = 0.05;
        break;
      default:
        rate = 0;
    }
  } else {
    taxBasis = 'Nigeria Tax Act 2025: Simplified WHT rates';
    switch (input.serviceType) {
      case 'Professional Services':
      case 'Consultancy':
      case 'Management fees':
      case 'Rent':
        rate = 0.10;
        break;
      case 'Construction':
        rate = 0.05;
        break;
      default:
        rate = 0;
    }
  }

  const withholdingTax = input.paymentAmount * rate;
  const netPayment = input.paymentAmount - withholdingTax;

  return {
    originalPayment: input.paymentAmount,
    withholdingTax,
    netPayment,
    taxBasis,
    whtRate: rate,
    note: "Actual WHT may vary depending on residency and transaction classification."
  };
}
