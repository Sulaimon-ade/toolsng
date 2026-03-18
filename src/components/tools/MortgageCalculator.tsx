import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }
function fmtShort(n: number) {
  if (n >= 1_000_000_000) return `₦${(n/1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`;
  return `₦${Math.round(n/1000)}K`;
}

export default function MortgageCalculator() {
  const [form, setForm] = useState({ propertyPrice: '', downPayment: '', annualInterestRate: '21', termYears: '15' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/mortgage-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyPrice: Number(form.propertyPrice), downPayment: Number(form.downPayment), annualInterestRate: Number(form.annualInterestRate), termYears: Number(form.termYears) })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed.'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Mortgage Calculator Nigeria</h2>
        <p className="text-sm text-slate-500 mb-6">Calculate monthly mortgage payments, total interest and repayment schedule for Nigerian property loans.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property Price (₦) *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
            <input type="number" name="propertyPrice" value={form.propertyPrice} onChange={handle} required min="1"
              className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 50000000" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Down Payment (₦) *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
            <input type="number" name="downPayment" value={form.downPayment} onChange={handle} required min="1"
              className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 10000000" /></div>
            {form.propertyPrice && form.downPayment && <p className="text-xs text-slate-500 mt-1">{((Number(form.downPayment)/Number(form.propertyPrice))*100).toFixed(1)}% of property price</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Interest Rate (%)</label>
            <input type="number" name="annualInterestRate" value={form.annualInterestRate} onChange={handle} min="1" step="0.5"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            <div className="flex gap-1 mt-1">
              {['18','21','24'].map(r => <button key={r} type="button" onClick={() => setForm({...form, annualInterestRate: r})}
                className={`text-xs px-2 py-0.5 rounded ${form.annualInterestRate===r ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{r}%</button>)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loan Term (Years)</label>
            <input type="number" name="termYears" value={form.termYears} onChange={handle} min="1" max="30"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
            <div className="flex gap-1 mt-1">
              {['10','15','20'].map(t => <button key={t} type="button" onClick={() => setForm({...form, termYears: t})}
                className={`text-xs px-2 py-0.5 rounded ${form.termYears===t ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{t} yrs</button>)}
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Mortgage'}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase mb-1">Monthly Payment</p>
              <p className="text-xl font-bold text-emerald-700">{fmt(result.monthlyPayment)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-xs text-red-700 font-medium uppercase mb-1">Total Interest</p>
              <p className="text-xl font-bold text-red-700">{fmt(result.totalInterest)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-600 font-medium uppercase mb-1">Total Repayment</p>
              <p className="text-xl font-bold text-slate-800">{fmt(result.totalPayment)}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Summary</h3>
            <Row l="Property Price" v={fmt(result.propertyPrice)} />
            <Row l="Down Payment" v={`${fmt(result.downPayment)} (${result.downPaymentPercent}%)`} />
            <Row l="Loan Amount" v={fmt(result.loanAmount)} />
            <Row l="Interest Rate" v={`${result.annualInterestRate}% p.a. (${(result.annualInterestRate/12).toFixed(2)}% p.m.)`} />
            <Row l="Loan Term" v={`${result.termYears} years (${result.termYears*12} months)`} />
            <Row l="Monthly Payment" v={fmt(result.monthlyPayment)} bold />
            <Row l="Total Interest Paid" v={fmt(result.totalInterest)} red />
            <Row l="Total Amount Paid" v={fmt(result.totalPayment)} bold />
          </div>

          {result.schedule && result.schedule.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-1">Principal vs Interest (First 5 Years)</h3>
              <div className="h-52 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.schedule}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} width={65} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Bar dataKey="principal" name="Principal" fill="#10b981" />
                    <Bar dataKey="interest" name="Interest" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Nigerian mortgage rates typically range 18–25% p.a. Federal Mortgage Bank of Nigeria (FMBN) and NHF loans may offer lower rates for qualifying applicants. Consult your bank for exact terms.</span>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ l, v, bold = false, red = false }: any) {
  return <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}><span className="text-slate-600">{l}</span><span className={red ? 'text-red-600' : ''}>{v}</span></div>;
}
