import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }

export default function ROICalculator() {
  const [form, setForm] = useState({ initialInvestment: '', finalValue: '', durationMonths: '12' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/roi-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialInvestment: Number(form.initialInvestment), finalValue: Number(form.finalValue), durationMonths: Number(form.durationMonths) })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed.'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">ROI Calculator</h2>
        <p className="text-sm text-slate-500 mb-6">Calculate Return on Investment (ROI) and annualised return for any investment or business venture.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Investment (₦) *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
            <input type="number" name="initialInvestment" value={form.initialInvestment} onChange={handle} required min="1"
              className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 1000000" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Final Value (₦) *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
            <input type="number" name="finalValue" value={form.finalValue} onChange={handle} required min="1"
              className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 1500000" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (months)</label>
            <input type="number" name="durationMonths" value={form.durationMonths} onChange={handle} min="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            <div className="flex gap-1 mt-1">
              {[['6','6mo'],['12','1yr'],['24','2yr'],['36','3yr']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setForm({...form, durationMonths: v})}
                  className={`text-xs px-2 py-0.5 rounded ${form.durationMonths===v ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate ROI'}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Headline */}
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${result.profitable ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            {result.profitable
              ? <TrendingUp className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              : <TrendingDown className="w-8 h-8 text-red-600 flex-shrink-0" />}
            <div>
              <p className={`text-2xl font-bold ${result.profitable ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.roi > 0 ? '+' : ''}{result.roi}% ROI
              </p>
              <p className="text-sm text-slate-600">
                {result.profitable ? 'Profitable' : 'Loss'} — {result.annualisedRoi > 0 ? '+' : ''}{result.annualisedRoi}% annualised return
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Breakdown</h3>
            <Row l="Initial Investment" v={fmt(result.initialInvestment)} />
            <Row l="Final Value" v={fmt(result.finalValue)} />
            <Row l="Net Profit / Loss" v={`${result.netProfit >= 0 ? '+' : ''}${fmt(result.netProfit)}`} bold />
            <div className="border-t border-slate-200 pt-2 space-y-2">
              <Row l="ROI" v={`${result.roi > 0 ? '+' : ''}${result.roi}%`} />
              <Row l="Annualised ROI" v={`${result.annualisedRoi > 0 ? '+' : ''}${result.annualisedRoi}% p.a.`} />
              <Row l="Duration" v={`${result.durationMonths} months`} />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>ROI = (Final Value − Initial Investment) ÷ Initial Investment × 100. Annualised ROI accounts for the investment duration and allows comparison across different time periods.</span>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ l, v, bold = false }: any) {
  return <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}><span className="text-slate-600">{l}</span><span>{v}</span></div>;
}
