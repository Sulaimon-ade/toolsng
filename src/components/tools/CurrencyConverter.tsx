import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info, ArrowRight } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', label: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
];

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ amountUSD: number; exchangeRate: number; amountNGN: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCurrency = CURRENCIES.find(c => c.code === fromCurrency) || CURRENCIES[0];

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      setLoading(false);
      return;
    }

    try {
      // Convert to USD first if not already USD, then to NGN
      const response = await fetch(`${API_URL}/api/tools/currency-converter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUSD: numAmount, fromCurrency })
      });
      const data = await response.json();
      if (data.success) setResult(data.data);
      else setError(data.error || 'Failed to convert currency.');
    } catch (err) {
      setError('Unable to fetch exchange rate. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleConvert} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Currency → Naira Converter</h2>
        <p className="text-sm text-slate-500 mb-6">Live exchange rates powered by exchangerate-api.com</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        {/* Currency selector tabs */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">From Currency</label>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map(c => (
              <button key={c.code} type="button" onClick={() => { setFromCurrency(c.code); setResult(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border
                  ${fromCurrency === c.code
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}>
                <span>{c.flag}</span>
                <span>{c.code}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount ({selectedCurrency.label})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
              {selectedCurrency.symbol}
            </span>
            <input type="number" required min="0.01" step="0.01" value={amount}
              onChange={(e) => { setAmount(e.target.value); setResult(null); }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 100" />
          </div>
        </div>

        {/* Visual conversion indicator */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
          <span className="font-medium text-slate-700">{selectedCurrency.flag} {fromCurrency}</span>
          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-emerald-700">🇳🇬 NGN</span>
          <span className="text-slate-400 ml-auto text-xs">Live rate</span>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors disabled:opacity-50">
          {loading ? 'Fetching rate...' : `Convert ${fromCurrency} → NGN`}
        </button>
      </form>

      {result && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 text-center">Conversion Result</h3>

          {/* Headline result */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <p className="text-sm text-emerald-700 mb-1">
              {selectedCurrency.symbol}{fmt(result.amountUSD)} {fromCurrency} =
            </p>
            <p className="text-3xl font-bold text-emerald-700">₦{fmt(result.amountNGN)}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Exchange Rate</span>
              <span className="font-medium">1 {fromCurrency} = ₦{fmt(result.exchangeRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Inverse Rate</span>
              <span className="font-medium">₦1 = {fromCurrency} {(1 / result.exchangeRate).toFixed(6)}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-2 items-start text-xs text-amber-800">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Rate shown is the <strong>official/mid-market rate</strong>. Bureau de change and bank rates will differ.
              For large transfers, always confirm with your bank or BDC.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
