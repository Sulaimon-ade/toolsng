import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { revenue, expenses, regime = '2026' } = req.body;
    if (!revenue || revenue === 0) throw new Error('Revenue is required');
    const profit = revenue - expenses;
    let band = 'Small', citRate = 0, edtRate = 0;
    if (revenue <= 25_000_000) band = 'Small Company (Exempt)';
    else if (revenue <= 100_000_000) { band = 'Medium Company'; citRate = 0.20; edtRate = 0.03; }
    else { band = 'Large Company'; citRate = 0.30; edtRate = 0.03; }
    const citAmount = profit * citRate;
    const educationTaxAmount = profit * edtRate;
    const estimatedTaxLiability = citAmount + educationTaxAmount;
    res.json({ success: true, data: {
      profit, estimatedTaxBand: band, citRate, educationTaxRate: edtRate,
      applicableTaxRate: citRate + edtRate, citAmount, educationTaxAmount,
      estimatedTaxLiability, netProfitAfterTax: profit - estimatedTaxLiability,
      vatRequired: revenue >= 25_000_000,
      taxBasis: 'Nigeria Finance Act 2026: Small <₦25M (0%), Medium ₦25M-₦100M (20%+3%), Large >₦100M (30%+3%). Dev Levy abolished.',
      calculationSteps: [`Profit = ₦${profit.toLocaleString()}`, `Band: ${band}`, `CIT = ₦${citAmount.toLocaleString()}`, `Education Tax = ₦${educationTaxAmount.toLocaleString()}`, `Total Tax = ₦${estimatedTaxLiability.toLocaleString()}`]
    }});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
