import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { costPrice, sellingPrice, quantity = 1 } = req.body;
    if (!costPrice || !sellingPrice) throw new Error('costPrice and sellingPrice required');
    const profit = sellingPrice - costPrice;
    const totalRevenue = sellingPrice * quantity;
    const totalCost = costPrice * quantity;
    const totalProfit = totalRevenue - totalCost;
    res.json({ success: true, data: { costPrice, sellingPrice, quantity, profitPerUnit: profit, totalCost, totalRevenue, totalProfit, profitMargin: Number(((profit/sellingPrice)*100).toFixed(2)), markupPercentage: Number(((profit/costPrice)*100).toFixed(2)) }});
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
