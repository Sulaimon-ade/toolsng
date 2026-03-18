import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }
function fmtShort(n: number) {
  if (n >= 1_000_000_000) return `₦${(n/1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`;
  return `₦${Math.round(n/1000)}K`;
}

export default function PensionCalculator() {
  const [form, setForm] = useState({ basicSalary: '', housingAllowance: '', transportAllowance: '', employeeRate: '8', employerRate: '10', currentRsaBalance: '', yearsToRetirement: '30', expectedReturnRate: '10' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/pension-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basicSalary: Number(form.basicSalary), housingAllowance: Number(form.housingAllowance)||0, transportAllowance: Number(form.transportAllowance)||0, employeeRate: Number(form.employeeRate), employerRate: Number(form.employerRate), currentRsaBalance: Number(form.currentRsaBalance)||0, yearsToRetirement: Number(form.yearsToRetirement), expectedReturnRate: Number(form.expectedReturnRate) })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed.'); } finally { setLoading(false); }
  };

  // Build chart data
  const chartData = result ? Array.from({ length: result.yearsToRetirement + 1 }, (_, yr) => {
    const r = Number(form.expectedReturnRate) / 100 / 12;
    const n = yr * 12;
    const fvEx = Number(form.currentRsaBalance) * Math.pow(1 + r, n);
    const fvC = r > 0 ? result.monthlyTotal * ((Math.pow(1 + r, n) - 1) / r) : result.monthlyTotal * n;
    return { year: `Yr ${yr}`, balance: Math.round(fvEx + fvC) };
  }) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Pension Calculator (RSA/PFA)</h2>
        <p className="text-sm text-slate-500 mb-6">Project your retirement savings under Nigeria's Contributory Pension Scheme.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[['basicSalary','Basic Salary (Annual) *'],['housingAllowance','Housing Allowance (Annual)'],['transportAllowance','Transport Allowance (Annual)'],['currentRsaBalance','Current RSA Balance (Optional)']].map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
              <input type="number" name={name} value={(form as any)[name]} onChange={handle} required={name==='basicSalary'} min="0"
                className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="0" /></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[['employeeRate','Employee Rate (%)','8'],['employerRate','Employer Rate (%)','10'],['yearsToRetirement','Years to Retire','30'],['expectedReturnRate','Expected Return (%)','10']].map(([name, label, def]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input type="number" name={name} value={(form as any)[name]} onChange={handle} min="0" step="0.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Project Retirement Savings'}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase mb-1">Projected Balance</p>
              <p className="text-xl font-bold text-emerald-700">{fmt(result.projectedBalance)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-700 font-medium uppercase mb-1">Monthly Contribution</p>
              <p className="text-xl font-bold text-blue-700">{fmt(result.monthlyTotal)}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-xs text-amber-700 font-medium uppercase mb-1">Total Growth</p>
              <p className="text-xl font-bold text-amber-700">{fmt(result.totalGrowth)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-1">RSA Balance Growth Over Time</h3>
            <p className="text-xs text-slate-500 mb-4">Projected at {form.expectedReturnRate}% annual return</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={Math.floor(result.yearsToRetirement / 5)} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10 }} width={65} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Area type="monotone" dataKey="balance" stroke="#10b981" fill="#d1fae5" name="RSA Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Monthly Contribution Breakdown</h3>
            <div className="flex justify-between"><span className="text-slate-600">Pension Base (Basic + Housing + Transport)</span><span>{fmt(result.pensionBase)}/yr</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Employee Contribution ({result.employeeRate}%)</span><span>{fmt(result.monthlyEmployee)}/mo</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Employer Contribution ({result.employerRate}%)</span><span>{fmt(result.monthlyEmployer)}/mo</span></div>
            <div className="flex justify-between font-bold border-t border-slate-200 pt-2"><span>Total Monthly</span><span className="text-emerald-600">{fmt(result.monthlyTotal)}/mo</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Annual Total</span><span>{fmt(result.annualTotal)}/yr</span></div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Minimum contribution: Employee 8% + Employer 10% of (Basic + Housing + Transport). Voluntary contributions above this are also tax-deductible. Projections assume constant contributions and returns.</span>
          </div>
        </div>
      )}
    </div>
  );
}
