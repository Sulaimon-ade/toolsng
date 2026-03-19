import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { principal, annualRate, years, compoundFrequency } = req.body;
    if (!principal || !annualRate || !years || !compoundFrequency) throw new Error('All fields required');
    const fa = principal * Math.pow(1 + annualRate/100/compoundFrequency, compoundFrequency*years);
    res.json({ success: true, data: { principal, annualRate, years, compoundFrequency, finalAmount: Math.round(fa), interestEarned: Math.round(fa-principal) }});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
