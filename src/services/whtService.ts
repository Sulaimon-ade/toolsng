// WHT rates per Nigeria Finance Act 2026 (effective 1 January 2026)
// Source: FIRS WHT Schedule

export type ServiceType =
  | 'Dividends'
  | 'Interest'
  | 'Royalties'
  | 'Rent'
  | 'Professional Services'
  | 'Consultancy'
  | 'Management fees'
  | 'Technical Services'
  | 'Construction'
  | 'Commission'
  | 'Director Fees';

export interface WHTInput {
  paymentAmount: number;
  serviceType: ServiceType;
  recipientType?: 'Corporate' | 'Individual';
  regime?: 'legacy' | '2026';
}

export interface WHTOutput {
  originalPayment: number;
  withholdingTax: number;
  netPayment: number;
  whtRate: number;
  taxBasis: string;
  note: string;
  calculationSteps: string[];
}

// 2026 rates: [corporate, individual]
const RATES_2026: Record<ServiceType, [number, number]> = {
  'Dividends':            [0.10, 0.10],
  'Interest':             [0.10, 0.10],
  'Royalties':            [0.10, 0.10],
  'Rent':                 [0.10, 0.10],
  'Professional Services':[0.05, 0.05],
  'Consultancy':          [0.05, 0.05],
  'Management fees':      [0.05, 0.05],
  'Technical Services':   [0.05, 0.05],
  'Construction':         [0.02, 0.05],
  'Commission':           [0.05, 0.05],
  'Director Fees':        [0.10, 0.10],
};

// Legacy rates (pre-2026)
const RATES_LEGACY: Record<ServiceType, [number, number]> = {
  'Dividends':            [0.10, 0.10],
  'Interest':             [0.10, 0.10],
  'Royalties':            [0.10, 0.10],
  'Rent':                 [0.10, 0.10],
  'Professional Services':[0.10, 0.10],
  'Consultancy':          [0.10, 0.10],
  'Management fees':      [0.10, 0.10],
  'Technical Services':   [0.10, 0.10],
  'Construction':         [0.05, 0.05],
  'Commission':           [0.10, 0.10],
  'Director Fees':        [0.10, 0.10],
};

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateWHT(input: WHTInput): WHTOutput {
  if (input.paymentAmount < 0) throw new Error('Payment amount cannot be negative.');
  if (input.paymentAmount === 0) throw new Error('Payment amount cannot be zero.');

  const regime = input.regime || '2026';
  const recipientType = input.recipientType || 'Corporate';
  const rateTable = regime === 'legacy' ? RATES_LEGACY : RATES_2026;
  const rates = rateTable[input.serviceType];
  const rate = recipientType === 'Corporate' ? rates[0] : rates[1];

  const withholdingTax = input.paymentAmount * rate;
  const netPayment = input.paymentAmount - withholdingTax;

  const taxBasis = regime === 'legacy'
    ? 'Legacy Regime (Pre-2026): Standard WHT rates before Finance Act 2026 amendments.'
    : 'Nigeria Finance Act 2026 (effective 1 Jan 2026): Updated WHT rates. Construction reduced to 2% for corporates.';

  const steps = [
    `Payment Amount: ${fmt(input.paymentAmount)}`,
    `Service Type: ${input.serviceType}`,
    `Recipient Type: ${recipientType}`,
    `WHT Rate (${regime === '2026' ? 'Finance Act 2026' : 'Legacy'}): ${rate * 100}%`,
    `WHT Deducted = ${fmt(input.paymentAmount)} × ${rate * 100}% = ${fmt(withholdingTax)}`,
    `Net Payment to Vendor = ${fmt(input.paymentAmount)} − ${fmt(withholdingTax)} = ${fmt(netPayment)}`,
  ];

  return {
    originalPayment: input.paymentAmount,
    withholdingTax,
    netPayment,
    whtRate: rate,
    taxBasis,
    note: 'WHT deducted at source must be remitted to FIRS by the 21st of the following month.',
    calculationSteps: steps,
  };
}

export const WHT_RATE_TABLE_2026: Record<ServiceType, string> = {
  'Dividends':            '10%',
  'Interest':             '10%',
  'Royalties':            '10%',
  'Rent':                 '10%',
  'Professional Services':'5%',
  'Consultancy':          '5%',
  'Management fees':      '5%',
  'Technical Services':   '5%',
  'Construction':         '2% (corporate) / 5% (individual)',
  'Commission':           '5%',
  'Director Fees':        '10%',
};
