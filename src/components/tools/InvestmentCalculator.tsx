import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { API_URL } from '../../config/api';
import { Info } from 'lucide-react';

function fmt(n: number): string {
  return `₦${Math.round(n).toLocaleString('en-NG')}`;
}

function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${Math.round(n)}`;
}

const FREQ_LABELS: Record<number, string> = {
  1: 'Annually', 2: 'Semi-Annually', 4: 'Quarterly', 12: 'Monthly', 365: 'Daily'
};

// Nigerian investment benchmarks
const BENCHMARKS = [
  { label: 'Savings (5%)', value: '5' },
  { label: 'Treasury Bills (~18%)', value: '18' },
  { label: 'FGN Bonds (~20%)', value: '20' },
  { label: 'Money Market (~22%)', value: '22' },
];

export default function InvestmentCalculator() {
  const [principal, setPrincipal] = useState('');
  const [annualRate, setAnnualRate] = useState('');
  const [years, setYears] = useState('');
  const [compoundFrequency, setCompoundFrequency] = useState('12');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);

    const p = Number(principal);
    const r = Number(annualRate);
    const y = Number(years);
    const n = Number(compoundFrequency);

    if (!p || !r || !y) { setError('Please fill in all fields.'); setLoading(false); return; }

    try {
      const response = await fetch(`${API_URL}/api/tools/investment-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ principal: p, annualRate: r, years: y, compoundFrequency: n })
      });
      const data = await response.json();
      if (data.success) {
        // Build year-by-year growth data for chart
        const chartData = Array.from({ length: y + 1 }, (_, yr) => {
          const amount = p * Math.pow(1 + r / 100 / n, n * yr);
          return {
            year: `Year ${yr}`,
            'Total Value': Math.round(amount),
            'Principal': Math.round(p),
            'Interest': Math.round(amount - p),
          };
        });
        setResult({ ...data.data, chartData });
      } else {
        setError(data.error || 'Failed to calculate');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleCalculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Investment / Compound Interest Calculator</h2>
        <p className="text-sm text-slate-500 mb-6">See how your money grows over time with compound interest.</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Investment (₦)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
              <input type="number" required min="1" value={principal} onChange={e => setPrincipal(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 1000000" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Annual Interest Rate (%)</label>
            </div>
            <div className="relative">
              <input type="number" required min="0.1" step="0.1" value={annualRate} onChange={e => setAnnualRate(e.target.value)}
                className="w-full pl-4 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 18" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
            </div>
            {/* Nigerian benchmark buttons */}
            <div className="flex flex-wrap gap-1 mt-2">
              {BENCHMARKS.map(b => (
                <button key={b.value} type="button" onClick={() => setAnnualRate(b.value)}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md transition-colors">
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (years)</label>
            <input type="number" required min="1" max="50" step="1" value={years} onChange={e => setYears(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 5" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compound Frequency</label>
            <select value={compoundFrequency} onChange={e => setCompoundFrequency(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
              <option value="1">Annually</option>
              <option value="2">Semi-Annually</option>
              <option value="4">Quarterly</option>
              <option value="12">Monthly</option>
              <option value="365">Daily</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Growth'}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          {/* Headline figures */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide mb-1">Final Amount</p>
              <p className="text-xl font-bold text-emerald-700">{fmt(result.finalAmount)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-700 font-medium uppercase tracking-wide mb-1">Interest Earned</p>
              <p className="text-xl font-bold text-blue-700">{fmt(result.interestEarned)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-wide mb-1">Return</p>
              <p className="text-xl font-bold text-slate-800">{((result.interestEarned / result.principal) * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Growth chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Growth Over Time</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="Principal" stackId="1" stroke="#94a3b8" fill="#e2e8f0" name="Principal" />
                  <Area type="monotone" dataKey="Interest" stackId="1" stroke="#10b981" fill="#d1fae5" name="Interest Earned" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detail summary */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3 text-sm">
            <h3 className="font-semibold text-slate-900">Summary</h3>
            <Row label="Initial Investment" value={fmt(result.principal)} />
            <Row label="Annual Interest Rate" value={`${result.annualRate}%`} />
            <Row label="Duration" value={`${result.years} years`} />
            <Row label="Compound Frequency" value={FREQ_LABELS[result.compoundFrequency] || 'Monthly'} />
            <Row label="Total Interest Earned" value={fmt(result.interestEarned)} />
            <Row label="Final Amount" value={fmt(result.finalAmount)} bold />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-2 items-start text-xs text-blue-800">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Formula: A = P(1 + r/n)^(nt). Rates shown are pre-tax. Investment returns in Nigeria may be subject to WHT (10% on interest). Past performance does not guarantee future returns.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-bold text-base pt-2 border-t border-slate-200' : ''}`}>
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
