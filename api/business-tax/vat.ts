import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { price, mode = 'add', turnover, regime = '2026' } = req.body;
    if (!price || price <= 0) throw new Error('Price is required');
    const vatRate = regime === 'legacy' ? 0.05 : 0.075;
    let basePrice = 0, vatAmount = 0, totalPrice = 0;
    if (mode === 'add') {
      basePrice = price; vatAmount = price * vatRate; totalPrice = price + vatAmount;
    } else {
      totalPrice = price; vatAmount = price * vatRate / (1 + vatRate); basePrice = price - vatAmount;
    }
    let note;
    if (turnover !== undefined) {
      if (turnover < 25_000_000) note = 'VAT registration not mandatory below ₦25M (Finance Act 2026)';
      else note = 'VAT registration mandatory above ₦25M';
    }
    const taxBasis = regime === 'legacy' ? 'Legacy: VAT at 5% (pre-2020)' : 'Finance Act 2026: VAT at 7.5%';
    res.json({ success: true, data: { basePrice, vatAmount, totalPrice, vatRate, taxBasis, note,
      calculationSteps: mode === 'add'
        ? [`Base Price = ₦${basePrice.toLocaleString()}`, `VAT (${vatRate * 100}%) = ₦${vatAmount.toLocaleString()}`, `Total = ₦${totalPrice.toLocaleString()}`]
        : [`Total (incl. VAT) = ₦${totalPrice.toLocaleString()}`, `VAT = ₦${vatAmount.toFixed(2)}`, `Base Price = ₦${basePrice.toFixed(2)}`]
    }});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
