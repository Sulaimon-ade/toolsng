import React, { useState } from 'react';

export default function ProfitMarginCalculator() {
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    costPrice: number;
    sellingPrice: number;
    quantity: number;
    profitPerUnit: number;
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    markupPercentage: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const cp = Number(costPrice);
    const sp = Number(sellingPrice);
    const q = Number(quantity);

    if (isNaN(cp) || cp <= 0 || isNaN(sp) || sp <= 0 || isNaN(q) || q <= 0 || !Number.isInteger(q)) {
      setError('Invalid profit margin parameters');
      setLoading(false);
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/api/tools/profit-margin-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          costPrice: cp,
          sellingPrice: sp,
          quantity: q
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to calculate profit margin');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during calculation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProfitColor = (value: number) => {
    if (value > 0) return 'text-emerald-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-900';
  };

  const formatCurrency = (value: number) => {
    const isNegative = value < 0;
    const formatted = Math.abs(value).toLocaleString();
    return isNegative ? `-₦${formatted}` : `₦${formatted}`;
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleCalculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Profit Margin Calculator</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price per Unit (₦)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. 5000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price per Unit (₦)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. 7500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 10"
            />
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
          <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Profit Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Cost Price per Unit:</span>
              <span className="font-medium">₦{result.costPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Selling Price per Unit:</span>
              <span className="font-medium">₦{result.sellingPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-slate-600">Quantity:</span>
              <span className="font-medium">{result.quantity.toLocaleString()}</span>
            </div>
            
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-700 font-medium">Profit Per Unit:</span>
              <span className={`text-lg font-bold ${getProfitColor(result.profitPerUnit)}`}>
                {formatCurrency(result.profitPerUnit)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Total Cost:</span>
              <span className="font-medium">₦{result.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Total Revenue:</span>
              <span className="font-medium">₦{result.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-700 font-medium">Total Profit:</span>
              <span className={`text-lg font-bold ${getProfitColor(result.totalProfit)}`}>
                {formatCurrency(result.totalProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Profit Margin:</span>
              <span className={`text-lg font-bold ${getProfitColor(result.profitMargin)}`}>
                {result.profitMargin.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Markup:</span>
              <span className={`text-lg font-bold ${getProfitColor(result.markupPercentage)}`}>
                {result.markupPercentage.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
