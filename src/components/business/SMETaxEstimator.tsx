import React, { useState } from 'react';
import { Info, CheckCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '../../config/api';

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SMETaxEstimator() {
  const [formData, setFormData] = useState({
    revenue: '', expenses: '', businessType: 'Small business', regime: '2026'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setResult(null);
  };

  const estimateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
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
      if (data.success) setResult(data.data);
      else setError(data.error);
    } catch (err) {
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
            <select name="regime" value={formData.regime} onChange={handleChange}
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-sm">
              <option value="2026">Finance Act 2026 (Current)</option>
              <option value="legacy">Legacy (Pre-2026)</option>
            </select>
          </div>
        </div>

        {/* Rate info banner */}
        {formData.regime === '2026' && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex gap-2 items-start">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Finance Act 2026:</strong> Small (&lt;₦25M) = 0% · Medium (₦25M–₦100M) = 20% CIT + 3% Education Tax · Large (&gt;₦100M) = 30% CIT + 3% Education Tax.
              Development Levy abolished. VAT registration mandatory above ₦25M turnover.
            </span>
          </div>
        )}

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Revenue (₦)</label>
            <input type="number" name="revenue" required value={formData.revenue} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 150000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Expenses (₦)</label>
            <input type="number" name="expenses" required value={formData.expenses} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 45000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
            <select name="businessType" value={formData.businessType} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="Freelancer">Freelancer / Self-employed</option>
              <option value="Small business">Small Business</option>
              <option value="Startup">Startup</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50">
            {loading ? 'Estimating...' : 'Estimate Tax'}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Estimation Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <SummaryRow label="Annual Revenue" value={result.profit + (Number(formData.expenses) || 0)} />
                <SummaryRow label="Annual Expenses" value={Number(formData.expenses) || 0} textClass="text-red-600" />
                <SummaryRow label="Taxable Profit" value={result.profit} bold />
                <SummaryRow label="Tax Band" value={result.estimatedTaxBand} />
                <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                  <SummaryRow label={`CIT (${(result.citRate * 100).toFixed(0)}%)`} value={result.citAmount} />
                  {result.educationTaxAmount > 0 && (
                    <SummaryRow label="Education Tax (3%)" value={result.educationTaxAmount} />
                  )}
                  <div className="flex justify-between text-xs text-slate-400 italic">
                    <span>Development Levy</span><span>Abolished (2026)</span>
                  </div>
                </div>
                <SummaryRow label="Total Tax Liability" value={result.estimatedTaxLiability} textClass="text-red-600" bold />
                <SummaryRow label="Net Profit After Tax" value={result.netProfitAfterTax} textClass="text-emerald-600" bold />
              </div>

              {/* Obligations checklist */}
              {result.obligations && result.obligations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm">Tax Obligations Checklist</h4>
                  <div className="space-y-2">
                    {result.obligations.map((o: string, i: number) => (
                      <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${o.startsWith('✅') ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                        {o.startsWith('✅')
                          ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        }
                        <span>{o.replace(/^[✅⚠️]\s*/, '')}</span>
                      </div>
                    ))}
                    <div className={`flex items-start gap-2 text-xs p-2 rounded-lg ${result.vatRequired ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                      {result.vatRequired
                        ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        : <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      }
                      <span>VAT registration {result.vatRequired ? 'mandatory (revenue ≥ ₦25M)' : 'not mandatory (revenue <₦25M)'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex gap-2 items-start border border-blue-100">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p><strong>Legal Basis:</strong> {result.taxBasis}</p>
            </div>
            <p className="mt-3 text-xs text-slate-400 italic">
              ⚠️ This is an estimate. Actual tax liability depends on allowable deductions, capital allowances, and other FIRS-approved factors.
            </p>
          </div>

          {/* Calculation Steps */}
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
