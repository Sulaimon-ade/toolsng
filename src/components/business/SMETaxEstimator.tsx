import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function SMETaxEstimator() {
  const [formData, setFormData] = useState({
    revenue: '',
    expenses: '',
    businessType: 'Small business',
    regime: '2025'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const estimateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const payload = {
        revenue: Number(formData.revenue) || 0,
        expenses: Number(formData.expenses) || 0,
        businessType: formData.businessType,
        regime: formData.regime
      };

      const response = await fetch(`${API_URL}/api/business-tax/sme`, {
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
      setError('An error occurred during estimation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={estimateTax} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-semibold text-slate-900">SME Tax Estimator</h2>
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
              placeholder="e.g. 15000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Expenses (₦)</label>
            <input
              type="number"
              name="expenses"
              required
              value={formData.expenses}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 8000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="Freelancer">Freelancer</option>
              <option value="Small business">Small business</option>
              <option value="Startup">Startup</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Estimating...' : 'Estimate Tax'}
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-md mx-auto text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Estimation Results</h3>
          <div className="space-y-4">
            <SummaryRow label="Estimated Profit" value={result.profit} />
            <SummaryRow label="Estimated Tax Band" value={result.estimatedTaxBand} />
            <SummaryRow label="Applicable Tax Rate" value={`${(result.applicableTaxRate * 100).toFixed(1)}%`} />
            <div className="pt-4 border-t border-slate-200">
              <SummaryRow label="Estimated Tax Liability" value={result.estimatedTaxLiability} textClass="text-red-600" bold />
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex gap-2 items-start border border-blue-100 text-left">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p><strong>Tax Basis / Legal Assumption:</strong> {result.taxBasis}</p>
          </div>
          
          <p className="mt-6 text-xs text-slate-500 italic">
            Note: This is a rough estimate. Actual tax liability depends on allowable deductions, capital allowances, and other factors.
          </p>
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
