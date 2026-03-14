import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Info } from 'lucide-react';

export default function CITCalculator() {
  const [formData, setFormData] = useState({
    revenue: '',
    expenses: '',
    companyType: 'Small',
    regime: '2025'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const payload = {
        revenue: Number(formData.revenue) || 0,
        expenses: Number(formData.expenses) || 0,
        companyType: formData.companyType,
        regime: formData.regime
      };

      const response = await fetch('/api/business-tax/cit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
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
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-sm"
            >
              <option value="2025">Nigeria Tax Act 2025</option>
              <option value="legacy">Legacy (Pre-2025)</option>
            </select>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Revenue (₦)</label>
            <input
              type="number"
              name="revenue"
              required
              value={formData.revenue}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 50000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Expenses (₦)</label>
            <input
              type="number"
              name="expenses"
              required
              value={formData.expenses}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 20000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Type (Legacy)</label>
            <select
              name="companyType"
              value={formData.companyType}
              onChange={handleChange}
              disabled={formData.regime === '2025'}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="Small">Small (&lt; ₦25m)</option>
              <option value="Medium">Medium (₦25m - ₦100m)</option>
              <option value="Large">Large (&gt; ₦100m)</option>
            </select>
            {formData.regime === '2025' && (
              <p className="text-xs text-slate-500 mt-1">Company type is determined automatically by revenue in the 2025 regime.</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate CIT'}
          </button>
        </div>
      </form>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary Breakdown</h3>
            <div className="space-y-3">
              <SummaryRow label="Revenue" value={result.revenue} bold />
              <SummaryRow label="Expenses" value={result.expenses} textClass="text-red-600" />
              <SummaryRow label="Profit" value={result.profit} bold />
              <SummaryRow label="Company Type" value={result.companyType} />
              <div className="pl-4 border-l-2 border-slate-200 space-y-2 my-2">
                <SummaryRow label={`Company Income Tax (${(result.citRate * 100).toFixed(0)}%)`} value={result.citAmount} />
                {result.educationTax > 0 && <SummaryRow label="Education Tax (3%)" value={result.educationTax} />}
                {result.developmentLevy > 0 && <SummaryRow label="Development Levy (4%)" value={result.developmentLevy} />}
              </div>
              <SummaryRow label="Total Business Tax" value={result.totalBusinessTax} textClass="text-red-600" bold />
              <SummaryRow label="Net Profit After Tax" value={result.netProfitAfterTax} textClass="text-emerald-600" bold />
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex gap-2 items-start border border-blue-100">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p><strong>Tax Basis / Legal Assumption:</strong> {result.taxBasis}</p>
            </div>
          </div>

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
                      { name: 'Development Levy', value: result.developmentLevy, color: '#8b5cf6' }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {([
                      { name: 'Net Profit', value: result.netProfitAfterTax, color: '#10b981' },
                      { name: 'CIT', value: result.citAmount, color: '#ef4444' },
                      { name: 'Education Tax', value: result.educationTax, color: '#f59e0b' },
                      { name: 'Development Levy', value: result.developmentLevy, color: '#8b5cf6' }
                    ].filter(item => item.value > 0)).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold = false, textClass = "text-slate-900" }: { label: string, value: number | string, bold?: boolean, textClass?: string }) {
  const displayValue = typeof value === 'number' ? `₦${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : value;
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-bold text-base' : 'text-sm'}`}>
      <span className="text-slate-600">{label}</span>
      <span className={textClass}>{displayValue}</span>
    </div>
  );
}
