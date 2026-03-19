import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { loanAmount, interestRate, loanTermMonths } = req.body;
    if (!loanAmount || !interestRate || !loanTermMonths) throw new Error('loanAmount, interestRate and loanTermMonths are required');
    const r = interestRate / 100 / 12;
    const n = loanTermMonths;
    const mp = loanAmount * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
    const total = mp * n;
    res.json({ success: true, data: { loanAmount, interestRate, loanTermMonths, monthlyPayment: Number(mp.toFixed(2)), totalRepayment: Number(total.toFixed(2)), totalInterest: Number((total-loanAmount).toFixed(2)) }});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
