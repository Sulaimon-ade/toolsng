import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }

export default function InflationCalculator() {
  const currentYear = 2026;
  const [form, setForm] = useState({ amount: '', fromYear: '2020', toYear: String(currentYear) });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/inflation-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(form.amount), fromYear: Number(form.fromYear), toYear: Number(form.toYear) })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed.'); } finally { setLoading(false); }
  };

  const years = Array.from({ length: 12 }, (_, i) => 2015 + i);

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Inflation Calculator Nigeria</h2>
        <p className="text-sm text-slate-500 mb-6">See how much purchasing power ₦ has lost to inflation in Nigeria between any two years (2015–2026).</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦) *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
            <input type="number" name="amount" value={form.amount} onChange={handle} required min="1"
              className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 100000" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">From Year</label>
            <select name="fromYear" value={form.fromYear} onChange={handle}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
              {years.slice(0, -1).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To Year</label>
            <select name="toYear" value={form.toYear} onChange={handle}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
              {years.slice(1).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Inflation Impact'}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Headline */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <p className="text-sm text-red-700 font-medium mb-1">{result.interpretation}</p>
            <p className="text-3xl font-bold text-red-700 mt-2">{result.totalInflationRate}% total inflation</p>
            <p className="text-sm text-red-600 mt-1">Your money lost {fmt(result.purchasingPowerLoss)} in purchasing power</p>
          </div>

          {/* Chart */}
          {result.breakdown && result.breakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Annual Inflation Rate by Year</h3>
              <div className="h-48 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} width={45} />
                    <Tooltip formatter={(v: number) => `${v}%`} labelFormatter={l => `Year ${l}`} />
                    <Bar dataKey="rate" name="Inflation Rate %" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
            <Row l={`Amount in ${result.fromYear}`} v={fmt(result.originalAmount)} />
            <Row l={`Equivalent in ${result.toYear}`} v={fmt(result.adjustedAmount)} bold />
            <Row l="Total Inflation" v={`${result.totalInflationRate}%`} />
            <Row l="Purchasing Power Lost" v={fmt(result.purchasingPowerLoss)} />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Based on Nigeria's average annual CPI inflation rates from NBS data. Actual inflation varies by goods category — food inflation in Nigeria has been significantly higher than the headline rate.</span>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ l, v, bold = false }: any) {
  return <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}><span className="text-slate-600">{l}</span><span>{v}</span></div>;
}
