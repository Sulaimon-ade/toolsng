import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TaxEngine } from '../../src/engine/TaxEngine';

const engine = new TaxEngine();

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const employees: any[] = req.body.employees;
    const results = employees.map(emp => ({
      name: emp.name || 'Unknown',
      ...engine.calculate({
        basicSalary: Number(emp.basicSalary) || 0,
        housingAllowance: Number(emp.housingAllowance) || 0,
        transportAllowance: Number(emp.transportAllowance) || 0,
        otherAllowances: Number(emp.otherAllowances) || 0,
        annualRentPaid: Number(emp.annualRent) || 0,
        pensionContributionOverride: emp.pension ? Number(emp.pension) : undefined,
        nhfContributionOverride: emp.nhf ? Number(emp.nhf) : undefined,
        nhisContributionOverride: emp.nhis ? Number(emp.nhis) : undefined,
      })
    }));
    res.json({ success: true, data: results });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
}
