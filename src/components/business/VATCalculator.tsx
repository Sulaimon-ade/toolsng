import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Info } from 'lucide-react';
import { API_URL } from '../../config/api';

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function VATCalculator() {
  const [formData, setFormData] = useState({
    price: '',
    mode: 'add',
    turnover: '',
    regime: '2026'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setResult(null);
  };

  const calculateVAT = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {
        price: Number(formData.price) || 0,
        mode: formData.mode,
        turnover: formData.turnover ? Number(formData.turnover) : undefined,
        regime: formData.regime
      };
      const response = await fetch(`${API_URL}/api/business-tax/vat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) setResult(data.data);
      else setError(data.error);
    } catch (err) {
      setError('An error occurred during calculation.');
    } finally {
      setLoading(false);
    }
  };

  // Correct rate display: 7.5% for 2026, 5% for legacy
  const vatRatePercent = formData.regime === 'legacy' ? '5%' : '7.5%';

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={calculateVAT} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-semibold text-slate-900">Value Added Tax (VAT) Calculator</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Tax Regime:</label>
            <select name="regime" value={formData.regime} onChange={handleChange}
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-sm">
              <option value="2026">Finance Act 2026 — 7.5% (Current)</option>
              <option value="legacy">Legacy (Pre-2020) — 5%</option>
            </select>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex gap-2 items-start">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Nigeria VAT is 7.5%</strong> — unchanged since Finance Act 2019 (effective February 2020).
            VAT registration is mandatory above ₦25M annual turnover.
          </span>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
            <input type="number" name="price" required value={formData.price} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 50000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Calculation Mode</label>
            <select name="mode" value={formData.mode} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="add">Add VAT ({vatRatePercent}) to amount</option>
              <option value="remove">Extract VAT ({vatRatePercent}) from amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Turnover (Optional, ₦)</label>
            <input type="number" name="turnover" value={formData.turnover} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 40000000" />
            <p className="text-xs text-slate-500 mt-1">Used to check VAT registration requirement</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50">
            {loading ? 'Calculating...' : 'Calculate VAT'}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary Breakdown</h3>
              <div className="space-y-3">
                <SummaryRow label="Base Price (Excl. VAT)" value={result.basePrice} />
                <SummaryRow label={`VAT Amount (${(result.vatRate * 100).toFixed(1)}%)`} value={result.vatAmount} textClass="text-red-600" />
                <div className="pt-2 border-t border-slate-200">
                  <SummaryRow label="Total Price (Incl. VAT)" value={result.totalPrice} bold />
                </div>
              </div>
              <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex gap-2 items-start border border-blue-100">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p><strong>Legal Basis:</strong> {result.taxBasis}</p>
              </div>
              {result.note && (
                <div className="mt-3 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg flex gap-2 items-start border border-amber-100">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{result.note}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 w-full text-left">Price Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Base Price', value: result.basePrice, color: '#3b82f6' },
                        { name: 'VAT (7.5%)', value: result.vatAmount, color: '#ef4444' }
                      ].filter(item => item.value > 0)}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      {[
                        { name: 'Base Price', value: result.basePrice, color: '#3b82f6' },
                        { name: 'VAT (7.5%)', value: result.vatAmount, color: '#ef4444' }
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => fmt(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {result.calculationSteps && (
            <details className="group bg-slate-50 rounded-xl border border-slate-200">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-semibold text-slate-900 text-sm">
                <span>Step-by-Step Calculation</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="px-6 pb-6 border-t border-slate-200 pt-4">
                <ul className="list-none space-y-1 font-mono text-xs bg-slate-100 rounded-lg p-4">
                  {result.calculationSteps.map((s: string, i: number) => <li key={i} className="py-0.5">{s}</li>)}
                </ul>
                <p className="text-xs text-slate-400 italic mt-3">
                  ⚠️ Based on Nigeria Finance Act 2026. Always consult a certified tax professional for advice.
                </p>
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold = false, textClass = 'text-slate-900' }: { label: string; value: number | string; bold?: boolean; textClass?: string }) {
  const displayValue = typeof value === 'number' ? fmt(value) : value;
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-bold text-base' : 'text-sm'}`}>
      <span className="text-slate-600">{label}</span>
      <span className={textClass}>{displayValue}</span>
    </div>
  );
}
