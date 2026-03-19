import type { VercelRequest, VercelResponse } from '@vercel/node';
const RATES_2026: Record<string, number> = {
  'Dividends': 0.10, 'Interest': 0.10, 'Royalties': 0.10, 'Rent': 0.10,
  'Professional Services': 0.05, 'Consultancy': 0.05, 'Management fees': 0.05,
  'Technical Services': 0.05, 'Construction': 0.02, 'Commission': 0.05, 'Director Fees': 0.10,
};
const RATES_LEGACY: Record<string, number> = {
  'Dividends': 0.10, 'Interest': 0.10, 'Royalties': 0.10, 'Rent': 0.10,
  'Professional Services': 0.10, 'Consultancy': 0.10, 'Management fees': 0.10,
  'Technical Services': 0.10, 'Construction': 0.05, 'Commission': 0.10, 'Director Fees': 0.10,
};
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { paymentAmount, serviceType, recipientType = 'Corporate', regime = '2026' } = req.body;
    if (!paymentAmount || paymentAmount <= 0) throw new Error('paymentAmount is required');
    const rates = regime === 'legacy' ? RATES_LEGACY : RATES_2026;
    const rate = rates[serviceType] ?? 0.05;
    const wht = paymentAmount * rate;
    res.json({ success: true, data: {
      originalPayment: paymentAmount, withholdingTax: wht,
      netPayment: paymentAmount - wht, whtRate: rate,
      taxBasis: regime === 'legacy' ? 'Legacy WHT rates' : 'Finance Act 2026 WHT rates',
      note: 'WHT must be remitted to FIRS by 21st of the following month.',
      calculationSteps: [`Payment: ₦${paymentAmount.toLocaleString()}`, `WHT (${rate * 100}%) = ₦${wht.toLocaleString()}`, `Net = ₦${(paymentAmount - wht).toLocaleString()}`]
    }});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
