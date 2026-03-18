import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }
function fmtShort(n: number) {
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n/1_000).toFixed(0)}K`;
  return `₦${Math.round(n)}`;
}

export default function BreakEvenCalculator() {
  const [form, setForm] = useState({ fixedCosts: '', sellingPricePerUnit: '', variableCostPerUnit: '', targetProfit: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/break-even-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixedCosts: Number(form.fixedCosts), sellingPricePerUnit: Number(form.sellingPricePerUnit), variableCostPerUnit: Number(form.variableCostPerUnit), targetProfit: form.targetProfit ? Number(form.targetProfit) : 0 })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed.'); } finally { setLoading(false); }
  };

  // Build chart data
  const chartData = result ? Array.from({ length: 11 }, (_, i) => {
    const units = Math.round(result.breakEvenUnits * i * 0.2);
    return {
      units,
      Revenue: units * result.sellingPricePerUnit,
      'Total Cost': result.fixedCosts + units * result.variableCostPerUnit,
    };
  }) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Break-Even Calculator</h2>
        <p className="text-sm text-slate-500 mb-6">Find out how many units you need to sell to cover all costs and start making profit.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[['fixedCosts','Fixed Costs (₦) *','Rent, salaries, utilities, insurance'],['sellingPricePerUnit','Selling Price Per Unit (₦) *','What you charge per unit'],['variableCostPerUnit','Variable Cost Per Unit (₦) *','Cost of goods, packaging per unit'],['targetProfit','Target Profit (₦) — Optional','Your desired profit above break-even']].map(([name, label, hint]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
              <input type="number" name={name} value={(form as any)[name]} onChange={handle} required={!name.includes('target')} min="0"
                className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="0" /></div>
              <p className="text-xs text-slate-400 mt-1">{hint}</p>
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Break-Even'}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase mb-1">Break-Even Units</p>
              <p className="text-2xl font-bold text-emerald-700">{result.breakEvenUnits.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-700 font-medium uppercase mb-1">Break-Even Revenue</p>
              <p className="text-xl font-bold text-blue-700">{fmtShort(result.breakEvenRevenue)}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-xs text-amber-700 font-medium uppercase mb-1">Contribution Margin</p>
              <p className="text-xl font-bold text-amber-700">{fmt(result.contributionMargin)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-600 font-medium uppercase mb-1">CM Ratio</p>
              <p className="text-xl font-bold text-slate-800">{result.contributionMarginRatio}%</p>
            </div>
          </div>

          {result.unitsForTarget > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-purple-900">To reach your target profit of {fmt(result.targetProfit)}</p>
                <p className="text-sm text-purple-700">You need to sell {result.unitsForTarget.toLocaleString()} units generating {fmt(result.revenueForTarget)} in revenue</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Revenue vs Cost Chart</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="units" tickFormatter={v => v.toLocaleString()} tick={{ fontSize: 10 }} label={{ value: 'Units', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10 }} width={65} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  <ReferenceLine x={result.breakEvenUnits} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Break-Even', fontSize: 10, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Total Cost" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-white"><h3 className="font-semibold text-slate-900">Profit at Different Sales Volumes</h3></div>
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-xs text-slate-600 uppercase">
                <tr><th className="px-4 py-2 text-left">Units Sold</th><th className="px-4 py-2 text-right">Revenue</th><th className="px-4 py-2 text-right">Total Cost</th><th className="px-4 py-2 text-right">Profit / Loss</th></tr>
              </thead>
              <tbody>
                {result.profitAtVolumes.map((v: any, i: number) => (
                  <tr key={i} className={`border-b border-slate-100 ${v.profit >= 0 ? 'bg-white' : 'bg-red-50'}`}>
                    <td className="px-4 py-2">{v.units.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{fmt(v.revenue)}</td>
                    <td className="px-4 py-2 text-right">{fmt(v.totalCost)}</td>
                    <td className={`px-4 py-2 text-right font-medium ${v.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{v.profit >= 0 ? '+' : ''}{fmt(v.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
