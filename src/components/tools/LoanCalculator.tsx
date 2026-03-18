import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info } from 'lucide-react';

function fmt(n: number): string {
  return `₦${Math.round(n).toLocaleString('en-NG')}`;
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [rateType, setRateType] = useState<'annual' | 'monthly'>('annual');
  const [loanTermMonths, setLoanTermMonths] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);

    const amount = Number(loanAmount);
    const rate = Number(interestRate);
    const term = Number(loanTermMonths);

    if (!amount || !rate || !term) {
      setError('Please fill in all fields with valid numbers.');
      setLoading(false);
      return;
    }

    // Convert to annual rate for the API
    const annualRate = rateType === 'monthly' ? rate * 12 : rate;

    try {
      const response = await fetch(`${API_URL}/api/tools/loan-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanAmount: amount, interestRate: annualRate, loanTermMonths: term })
      });
      const data = await response.json();
      if (data.success) {
        setResult({ ...data.data, displayRate: rate, rateType });
      } else {
        setError(data.error || 'Failed to calculate loan repayment');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Common Nigerian bank rates for reference
  const commonRates = rateType === 'monthly'
    ? [{ label: 'Low (1.5%/mo)', value: '1.5' }, { label: 'Typical (2%/mo)', value: '2' }, { label: 'High (3%/mo)', value: '3' }]
    : [{ label: 'Low (18%)', value: '18' }, { label: 'Typical (24%)', value: '24' }, { label: 'High (30%)', value: '30' }];

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleCalculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Loan Repayment Calculator</h2>
        <p className="text-sm text-slate-500 mb-6">Calculate monthly repayments using the standard amortisation formula.</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₦</span>
              <input type="number" required min="1" value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 5000000" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">Interest Rate</label>
              <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs">
                <button type="button" onClick={() => setRateType('annual')}
                  className={`px-3 py-1 rounded-md transition-colors font-medium ${rateType === 'annual' ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}>
                  Annual (% p.a.)
                </button>
                <button type="button" onClick={() => setRateType('monthly')}
                  className={`px-3 py-1 rounded-md transition-colors font-medium ${rateType === 'monthly' ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}>
                  Monthly (% p.m.)
                </button>
              </div>
            </div>
            <div className="relative">
              <input type="number" required min="0.1" step="0.1" value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full pl-4 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder={rateType === 'monthly' ? 'e.g. 2' : 'e.g. 24'} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
            </div>
            {/* Quick rate buttons */}
            <div className="flex gap-2 mt-2">
              {commonRates.map(r => (
                <button key={r.value} type="button" onClick={() => setInterestRate(r.value)}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md transition-colors">
                  {r.label}
                </button>
              ))}
            </div>
            {interestRate && (
              <p className="text-xs text-slate-500 mt-1">
                {rateType === 'monthly'
                  ? `= ${(Number(interestRate) * 12).toFixed(1)}% per annum`
                  : `= ${(Number(interestRate) / 12).toFixed(2)}% per month`}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loan Term</label>
            <div className="flex gap-2">
              <input type="number" required min="1" step="1" value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 24" />
              <span className="flex items-center text-slate-500 text-sm whitespace-nowrap">months</span>
            </div>
            {loanTermMonths && Number(loanTermMonths) >= 12 && (
              <p className="text-xs text-slate-500 mt-1">= {(Number(loanTermMonths) / 12).toFixed(1)} years</p>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Repayment'}
        </button>
      </form>

      {result && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 text-center">Repayment Summary</h3>

          {/* Headline figures */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide mb-1">Monthly Payment</p>
              <p className="text-xl font-bold text-emerald-700">{fmt(result.monthlyPayment)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-xs text-red-700 font-medium uppercase tracking-wide mb-1">Total Interest</p>
              <p className="text-xl font-bold text-red-700">{fmt(result.totalInterest)}</p>
            </div>
          </div>

          {/* Detail rows */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <Row label="Loan Amount" value={fmt(result.loanAmount)} />
            <Row label={`Interest Rate`} value={`${result.displayRate}% ${result.rateType === 'monthly' ? 'p.m.' : 'p.a.'} (${result.interestRate}% p.a.)`} />
            <Row label="Loan Term" value={`${result.loanTermMonths} months`} />
            <Row label="Total Repayment" value={fmt(result.totalRepayment)} bold />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-2 items-start text-xs text-blue-800">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Calculated using the standard amortisation formula. Actual repayments may vary by lender due to fees, insurance, and other charges.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-bold text-base pt-2 border-t border-slate-200' : 'text-sm'}`}>
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
