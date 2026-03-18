import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Info } from 'lucide-react';
import { API_URL } from '../../config/api';

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CITCalculator() {
  const [formData, setFormData] = useState({ revenue: '', expenses: '', companyType: 'Large', regime: '2026' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {
        revenue: Number(formData.revenue) || 0,
        expenses: Number(formData.expenses) || 0,
        companyType: formData.companyType,
        regime: formData.regime
      };
      const response = await fetch(`${API_URL}/api/business-tax/cit`, {
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

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={calculateTax} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-semibold text-slate-900">Company Income Tax Calculator</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Tax Regime:</label>
            <select
              name="regime"
              value={formData.regime}
              onChange={handleChange}
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-sm"
            >
              <option value="2026">Finance Act 2026 (Current)</option>
              <option value="legacy">Legacy (Pre-2026)</option>
            </select>
          </div>
        </div>

        {/* 2026 rate info banner */}
        {formData.regime === '2026' && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex gap-2 items-start">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Finance Act 2026 rates:</strong> Small (&lt;₦25m) = 0% · Medium (₦25m–₦100m) = 20% · Large (&gt;₦100m) = 30%.
              Development Levy abolished. Education Tax = 3%.
            </span>
          </div>
        )}

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Revenue (₦)</label>
            <input type="number" name="revenue" required value={formData.revenue} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 500000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Expenses (₦)</label>
            <input type="number" name="expenses" required value={formData.expenses} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 70000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company Type {formData.regime === '2026' ? '(Auto-detected)' : '(Legacy)'}
            </label>
            <select name="companyType" value={formData.companyType} onChange={handleChange}
              disabled={formData.regime === '2026'}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-slate-100 disabled:text-slate-400">
              <option value="Small">Small (&lt; ₦25m)</option>
              <option value="Medium">Medium (₦25m–₦100m)</option>
              <option value="Large">Large (&gt; ₦100m)</option>
            </select>
            {formData.regime === '2026' && (
              <p className="text-xs text-slate-500 mt-1">Determined automatically from revenue.</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50">
            {loading ? 'Calculating...' : 'Calculate CIT'}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Summary */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary Breakdown</h3>
              <div className="space-y-3">
                <SummaryRow label="Annual Revenue" value={result.revenue} bold />
                <SummaryRow label="Total Expenses" value={result.expenses} textClass="text-red-600" />
                <SummaryRow label="Taxable Profit" value={result.profit} bold />
                <SummaryRow label="Company Type" value={result.companyType} />
                <div className="pl-4 border-l-2 border-slate-200 space-y-2 my-2">
                  <SummaryRow label={`CIT (${(result.citRate * 100).toFixed(0)}%)`} value={result.citAmount} />
                  {result.educationTax > 0 && <SummaryRow label="Education Tax (3%)" value={result.educationTax} />}
                  {result.developmentLevy > 0
                    ? <SummaryRow label="Development Levy (4%)" value={result.developmentLevy} />
                    : <div className="flex justify-between text-xs text-slate-400 italic"><span>Development Levy</span><span>Abolished (2026)</span></div>
                  }
                </div>
                <SummaryRow label="Total Business Tax" value={result.totalBusinessTax} textClass="text-red-600" bold />
                <SummaryRow label="Net Profit After Tax" value={result.netProfitAfterTax} textClass="text-emerald-600" bold />
              </div>
              <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex gap-2 items-start border border-blue-100">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p><strong>Legal Basis:</strong> {result.taxBasis}</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 w-full text-left">Profit Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Net Profit', value: result.netProfitAfterTax, color: '#10b981' },
                        { name: 'CIT', value: result.citAmount, color: '#ef4444' },
                        { name: 'Education Tax', value: result.educationTax, color: '#f59e0b' },
                      ].filter(item => item.value > 0)}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      {[
                        { name: 'Net Profit', value: result.netProfitAfterTax, color: '#10b981' },
                        { name: 'CIT', value: result.citAmount, color: '#ef4444' },
                        { name: 'Education Tax', value: result.educationTax, color: '#f59e0b' },
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

          {/* Calculation Steps */}
          {result.calculationSteps && (
            <details className="group bg-slate-50 rounded-xl border border-slate-200">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-semibold text-slate-900">
                <span>Step-by-Step Calculation</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
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
