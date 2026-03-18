import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }

export default function NetSalaryCalculator() {
  const [form, setForm] = useState({ basicSalary: '', housingAllowance: '', transportAllowance: '', otherAllowances: '', pensionRate: '8', nhisRate: '5', nhfEnabled: true });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? (e.target as any).checked : e.target.value });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/net-salary-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basicSalary: Number(form.basicSalary), housingAllowance: Number(form.housingAllowance) || 0, transportAllowance: Number(form.transportAllowance) || 0, otherAllowances: Number(form.otherAllowances) || 0, pensionRate: Number(form.pensionRate), nhisRate: Number(form.nhisRate), nhfEnabled: form.nhfEnabled })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed. Please try again.'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Net Salary Calculator</h2>
        <p className="text-sm text-slate-500 mb-6">Full take-home pay breakdown including PAYE, Pension, NHF and NHIS per Finance Act 2026.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[['basicSalary','Basic Salary (Annual) *'],['housingAllowance','Housing Allowance (Annual)'],['transportAllowance','Transport Allowance (Annual)'],['otherAllowances','Other Allowances (Annual)']].map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
              <input type="number" name={name} value={(form as any)[name]} onChange={handle} required={name === 'basicSalary'} min="0"
                className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="0" /></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pension Rate (%)</label>
            <input type="number" name="pensionRate" value={form.pensionRate} onChange={handle} min="0" max="20" step="0.5"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            <p className="text-xs text-slate-400 mt-1">Default: 8% (employee)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NHIS Rate (%)</label>
            <input type="number" name="nhisRate" value={form.nhisRate} onChange={handle} min="0" max="20" step="0.5"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            <p className="text-xs text-slate-400 mt-1">Default: 5% of gross</p>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <input type="checkbox" name="nhfEnabled" id="nhf" checked={form.nhfEnabled} onChange={handle} className="w-4 h-4 text-emerald-600" />
            <label htmlFor="nhf" className="text-sm font-medium text-slate-700">Include NHF (2.5% of basic)</label>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Net Salary'}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase mb-1">Monthly Net Pay</p>
              <p className="text-2xl font-bold text-emerald-700">{fmt(result.monthlyNet)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-xs text-red-700 font-medium uppercase mb-1">Monthly PAYE</p>
              <p className="text-2xl font-bold text-red-700">{fmt(result.monthlyPaye)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-600 font-medium uppercase mb-1">Effective Tax Rate</p>
              <p className="text-2xl font-bold text-slate-800">{result.effectiveTaxRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2 text-sm">
              <h3 className="font-semibold text-slate-900 mb-3">Monthly Breakdown</h3>
              <Row label="Gross Monthly" value={fmt(result.monthlyGross)} bold />
              <Row label="PAYE Tax" value={`-${fmt(result.monthlyPaye)}`} red />
              <Row label="Pension (employee)" value={`-${fmt(result.monthlyPension)}`} red />
              <Row label="NHF (2.5%)" value={`-${fmt(result.monthlyNhf)}`} red />
              <Row label="NHIS" value={`-${fmt(result.monthlyNhis)}`} red />
              <div className="border-t border-slate-200 pt-2">
                <Row label="Net Monthly Take-Home" value={fmt(result.monthlyNet)} bold green />
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col">
              <h3 className="font-semibold text-slate-900 mb-3">Salary Distribution</h3>
              <div className="flex-1 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: 'Net Pay', value: Math.round(result.monthlyNet), color: '#10b981' },
                      { name: 'PAYE', value: Math.round(result.monthlyPaye), color: '#ef4444' },
                      { name: 'Pension', value: Math.round(result.monthlyPension), color: '#f59e0b' },
                      { name: 'NHF', value: Math.round(result.monthlyNhf), color: '#3b82f6' },
                      { name: 'NHIS', value: Math.round(result.monthlyNhis), color: '#8b5cf6' },
                    ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                      {[{ color: '#10b981' },{ color: '#ef4444' },{ color: '#f59e0b' },{ color: '#3b82f6' },{ color: '#8b5cf6' }].map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Calculated using Nigeria Finance Act 2026. CRA = Max(₦200k, 1% of gross) + 20% of gross. Always consult a tax professional for advice.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold = false, red = false, green = false }: any) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold text-base' : ''}`}>
      <span className="text-slate-600">{label}</span>
      <span className={red ? 'text-red-600' : green ? 'text-emerald-600' : 'text-slate-900'}>{value}</span>
    </div>
  );
}
