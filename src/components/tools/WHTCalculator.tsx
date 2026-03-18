import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { API_URL } from '../../config/api';
import { WHT_RATE_TABLE_2026 } from '../../services/whtService';

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const SERVICE_TYPES = [
  'Dividends',
  'Interest',
  'Royalties',
  'Rent',
  'Professional Services',
  'Consultancy',
  'Management fees',
  'Technical Services',
  'Construction',
  'Commission',
  'Director Fees',
];

const RATES_2026: Record<string, string> = {
  'Dividends': '10%', 'Interest': '10%', 'Royalties': '10%', 'Rent': '10%',
  'Professional Services': '5%', 'Consultancy': '5%', 'Management fees': '5%',
  'Technical Services': '5%', 'Construction': '2%/5%', 'Commission': '5%', 'Director Fees': '10%',
};
const RATES_LEGACY: Record<string, string> = {
  'Dividends': '10%', 'Interest': '10%', 'Royalties': '10%', 'Rent': '10%',
  'Professional Services': '10%', 'Consultancy': '10%', 'Management fees': '10%',
  'Technical Services': '10%', 'Construction': '5%', 'Commission': '10%', 'Director Fees': '10%',
};

export default function WHTCalculator() {
  const [formData, setFormData] = useState({
    paymentAmount: '',
    serviceType: 'Rent',
    recipientType: 'Corporate',
    regime: '2026',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setResult(null);
  };

  const calculateWHT = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {
        paymentAmount: Number(formData.paymentAmount) || 0,
        serviceType: formData.serviceType,
        recipientType: formData.recipientType,
        regime: formData.regime,
      };
      const response = await fetch(`${API_URL}/api/business-tax/wht`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const rateTable = formData.regime === '2026' ? RATES_2026 : RATES_LEGACY;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={calculateWHT} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-semibold text-slate-900">Withholding Tax (WHT) Calculator</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Tax Regime:</label>
            <select name="regime" value={formData.regime} onChange={handleChange}
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-sm">
              <option value="2026">Finance Act 2026 (Current)</option>
              <option value="legacy">Legacy (Pre-2026)</option>
            </select>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount (₦)</label>
            <input type="number" name="paymentAmount" required value={formData.paymentAmount} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 5000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service / Payment Type</label>
            <select name="serviceType" value={formData.serviceType} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
              {SERVICE_TYPES.map(s => (
                <option key={s} value={s}>{s} ({rateTable[s]})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Type</label>
            <select name="recipientType" value={formData.recipientType} onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="Corporate">Corporate (Company)</option>
              <option value="Individual">Individual (Person)</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50">
            {loading ? 'Calculating...' : 'Calculate WHT'}
          </button>
        </div>
      </form>

      {/* WHT Rate Reference Table */}
      <details className="group bg-slate-50 rounded-xl border border-slate-200 mb-6">
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-semibold text-slate-900 text-sm">
          <span>📋 Finance Act 2026 — Full WHT Rate Reference Table</span>
          <span className="transition group-open:rotate-180">
            <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
          </span>
        </summary>
        <div className="px-6 pb-6 border-t border-slate-200 pt-4 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-4 py-2">Payment Type</th>
                <th className="px-4 py-2 text-center">2026 Rate</th>
                <th className="px-4 py-2 text-center">Legacy Rate</th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_TYPES.map((s, i) => (
                <tr key={s} className={`border-b border-slate-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <td className="px-4 py-2 font-medium text-slate-900">{s}</td>
                  <td className="px-4 py-2 text-center font-semibold text-emerald-700">{RATES_2026[s]}</td>
                  <td className="px-4 py-2 text-center text-slate-500">{RATES_LEGACY[s]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-400 mt-3 italic">Construction: 2% for corporate recipients, 5% for individuals under Finance Act 2026.</p>
        </div>
      </details>

      {result && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-lg mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">WHT Summary</h3>
            <div className="space-y-3">
              <SummaryRow label="Original Payment" value={result.originalPayment} />
              <SummaryRow label={`WHT Deducted (${(result.whtRate * 100).toFixed(0)}%)`} value={result.withholdingTax} textClass="text-red-600" />
              <div className="pt-2 border-t border-slate-200">
                <SummaryRow label="Net Payment to Vendor" value={result.netPayment} textClass="text-emerald-600" bold />
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex gap-2 items-start border border-blue-100">
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
