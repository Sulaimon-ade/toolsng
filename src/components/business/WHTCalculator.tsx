import React, { useState } from 'react';
import { Info } from 'lucide-react';

export default function WHTCalculator() {
  const [formData, setFormData] = useState({
    paymentAmount: '',
    serviceType: 'Professional Services',
    regime: '2025'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateWHT = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const payload = {
        paymentAmount: Number(formData.paymentAmount) || 0,
        serviceType: formData.serviceType,
        regime: formData.regime
      };

      const response = await fetch('/api/business-tax/wht', {
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

  const getRateDisplay = (serviceType: string) => {
    if (formData.regime === 'legacy') {
      switch (serviceType) {
        case 'Professional Services': return '10%';
        case 'Rent': return '10%';
        case 'Construction': return '5%';
        case 'Consultancy': return '10%';
        case 'Management fees': return '10%';
        default: return '';
      }
    } else {
      switch (serviceType) {
        case 'Professional Services': return '10%';
        case 'Rent': return '10%';
        case 'Construction': return '5%';
        case 'Consultancy': return '10%';
        case 'Management fees': return '10%';
        default: return '';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={calculateWHT} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-semibold text-slate-900">Withholding Tax (WHT) Calculator</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount (₦)</label>
            <input
              type="number"
              name="paymentAmount"
              required
              value={formData.paymentAmount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 500000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="Professional Services">Professional Services ({getRateDisplay('Professional Services')})</option>
              <option value="Rent">Rent ({getRateDisplay('Rent')})</option>
              <option value="Construction">Construction contracts ({getRateDisplay('Construction')})</option>
              <option value="Consultancy">Consultancy ({getRateDisplay('Consultancy')})</option>
              <option value="Management fees">Management fees ({getRateDisplay('Management fees')})</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate WHT'}
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">WHT Summary</h3>
          <div className="space-y-3">
            <SummaryRow label="Original Payment" value={result.originalPayment} />
            <SummaryRow label={`Withholding Tax Deducted (${(result.whtRate * 100).toFixed(1)}%)`} value={result.withholdingTax} textClass="text-red-600" />
            <div className="pt-2 border-t border-slate-200">
              <SummaryRow label="Net Payment to Vendor" value={result.netPayment} textClass="text-emerald-600" bold />
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex gap-2 items-start border border-blue-100">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p><strong>Tax Basis / Legal Assumption:</strong> {result.taxBasis}</p>
          </div>
          {result.note && (
            <div className="mt-3 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg flex gap-2 items-start border border-amber-100">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{result.note}</p>
            </div>
          )}
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
