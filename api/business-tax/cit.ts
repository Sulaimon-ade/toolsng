import type { VercelRequest, VercelResponse } from '@vercel/node';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { revenue, expenses, companyType, regime = '2026' } = req.body;
    if (!revenue || revenue === 0) throw new Error('Revenue is required');
    if (expenses > revenue) throw new Error('Expenses cannot exceed revenue');
    const profit = revenue - expenses;
    let citRate = 0, edtRate = 0, determinedType = 'Small';
    if (revenue <= 25_000_000) determinedType = 'Small';
    else if (revenue <= 100_000_000) determinedType = 'Medium';
    else determinedType = 'Large';
    if (regime === 'legacy') {
      const t = companyType || determinedType;
      determinedType = t;
      if (t === 'Medium') { citRate = 0.20; edtRate = 0.03; }
      else if (t === 'Large') { citRate = 0.30; edtRate = 0.03; }
    } else {
      if (determinedType === 'Medium') { citRate = 0.20; edtRate = 0.03; }
      else if (determinedType === 'Large') { citRate = 0.30; edtRate = 0.03; }
    }
    const citAmount = profit * citRate;
    const educationTax = profit * edtRate;
    const totalBusinessTax = citAmount + educationTax;
    const taxBasis = regime === 'legacy'
      ? 'Legacy Regime (Pre-2026): CIT at 0%/20%/30%, Education Tax 3%'
      : 'Nigeria Finance Act 2026: CIT at 0%/20%/30%, Education Tax 3%, Development Levy abolished';
    res.json({ success: true, data: {
      revenue, expenses, profit, companyType: determinedType, citRate, citAmount,
      educationTax, developmentLevy: 0, totalBusinessTax,
      netProfitAfterTax: profit - totalBusinessTax, taxBasis,
      calculationSteps: [
        `Taxable Profit = ₦${revenue.toLocaleString()} - ₦${expenses.toLocaleString()} = ₦${profit.toLocaleString()}`,
        `Company Type: ${determinedType}`,
        `CIT (${citRate * 100}%) = ₦${citAmount.toLocaleString()}`,
        `Education Tax (${edtRate * 100}%) = ₦${educationTax.toLocaleString()}`,
        `Total Tax = ₦${totalBusinessTax.toLocaleString()}`,
      ]
    }});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
