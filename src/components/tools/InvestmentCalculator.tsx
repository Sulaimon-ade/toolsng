import React, { useState } from 'react';

export default function InvestmentCalculator() {
  const [principal, setPrincipal] = useState('');
  const [annualRate, setAnnualRate] = useState('');
  const [years, setYears] = useState('');
  const [compoundFrequency, setCompoundFrequency] = useState('12');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    principal: number;
    annualRate: number;
    years: number;
    compoundFrequency: number;
    finalAmount: number;
    interestEarned: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const p = Number(principal);
    const r = Number(annualRate);
    const y = Number(years);
    const n = Number(compoundFrequency);

    const validFrequencies = [1, 2, 4, 12, 365];

    if (isNaN(p) || p <= 0 || isNaN(r) || r <= 0 || isNaN(y) || y <= 0 || isNaN(n) || !validFrequencies.includes(n)) {
      setError('Invalid investment parameters');
      setLoading(false);
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/api/tools/investment-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: p,
          annualRate: r,
          years: y,
          compoundFrequency: n
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to calculate investment growth');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during calculation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyLabel = (freq: number) => {
    switch (freq) {
      case 1: return 'Annually';
      case 2: return 'Semi-Annually';
      case 4: return 'Quarterly';
      case 12: return 'Monthly';
      case 365: return 'Daily';
      default: return 'Unknown';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleCalculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Investment / Compound Interest Calculator</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Investment (₦)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. 100000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Interest Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                className="w-full pl-4 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. 12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Investment Duration (years)</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compound Frequency</label>
            <select
              value={compoundFrequency}
              onChange={(e) => setCompoundFrequency(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="1">Annually</option>
              <option value="2">Semi-Annually</option>
              <option value="4">Quarterly</option>
              <option value="12">Monthly</option>
              <option value="365">Daily</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>

      {result && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Investment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Initial Investment:</span>
              <span className="font-medium">₦{result.principal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Annual Interest Rate:</span>
              <span className="font-medium">{result.annualRate}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Duration:</span>
              <span className="font-medium">{result.years} years</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-slate-600">Compound Frequency:</span>
              <span className="font-medium">{getFrequencyLabel(result.compoundFrequency)}</span>
            </div>
            
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-700 font-medium">Final Amount:</span>
              <span className="text-lg font-bold text-emerald-600">₦{result.finalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Interest Earned:</span>
              <span className="text-lg font-bold text-orange-600">₦{result.interestEarned.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
