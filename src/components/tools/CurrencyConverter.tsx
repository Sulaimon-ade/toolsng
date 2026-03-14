import React, { useState } from 'react';

export default function CurrencyConverter() {
  const [amountUSD, setAmountUSD] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ amountUSD: number, exchangeRate: number, amountNGN: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const amount = Number(amountUSD);
    if (isNaN(amount) || amount <= 0) {
      setError('amountUSD must be greater than 0');
      setLoading(false);
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/api/tools/currency-converter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUSD: amount })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to convert currency');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to fetch exchange rate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleConvert} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Currency Converter (USD → NGN)</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">USD Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={amountUSD}
              onChange={(e) => setAmountUSD(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </form>

      {result && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Conversion Result</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">USD Amount:</span>
              <span className="font-medium">${result.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Exchange Rate:</span>
              <span className="font-medium">₦{result.exchangeRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / USD</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-700 font-medium">NGN Value:</span>
              <span className="text-lg font-bold text-emerald-600">₦{result.amountNGN.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
