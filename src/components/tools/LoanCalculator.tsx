import React, { useState } from 'react';

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTermMonths, setLoanTermMonths] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    loanAmount: number;
    interestRate: number;
    loanTermMonths: number;
    monthlyPayment: number;
    totalInterest: number;
    totalRepayment: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const amount = Number(loanAmount);
    const rate = Number(interestRate);
    const term = Number(loanTermMonths);

    if (isNaN(amount) || amount <= 0 || isNaN(rate) || rate <= 0 || isNaN(term) || term <= 0) {
      setError('Invalid loan parameters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tools/loan-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanAmount: amount,
          interestRate: rate,
          loanTermMonths: term
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to calculate loan repayment');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during calculation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleCalculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Loan Repayment Calculator</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. 500000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full pl-4 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. 18"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loan Term (months)</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={loanTermMonths}
              onChange={(e) => setLoanTermMonths(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 12"
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
          <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Repayment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Loan Amount:</span>
              <span className="font-medium">₦{result.loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Interest Rate:</span>
              <span className="font-medium">{result.interestRate}%</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-slate-600">Loan Term:</span>
              <span className="font-medium">{result.loanTermMonths} months</span>
            </div>
            
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-700 font-medium">Monthly Payment:</span>
              <span className="text-lg font-bold text-emerald-600">₦{result.monthlyPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Total Interest:</span>
              <span className="text-lg font-bold text-orange-600">₦{result.totalInterest.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-700 font-medium">Total Repayment:</span>
              <span className="text-lg font-bold text-slate-900">₦{result.totalRepayment.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
