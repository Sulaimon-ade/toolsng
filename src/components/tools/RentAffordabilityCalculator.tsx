import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info, CheckCircle, AlertCircle } from 'lucide-react';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }

export default function RentAffordabilityCalculator() {
  const [form, setForm] = useState({ monthlyIncome: '', otherMonthlyExpenses: '', affordabilityPercent: '30' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/rent-affordability-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyIncome: Number(form.monthlyIncome), otherMonthlyExpenses: Number(form.otherMonthlyExpenses) || 0, affordabilityPercent: Number(form.affordabilityPercent) })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed.'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Rent Affordability Calculator</h2>
        <p className="text-sm text-slate-500 mb-6">Find out how much rent you can afford in Nigeria, including agency fees, legal fees and caution fees.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Income (₦) *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
            <input type="number" name="monthlyIncome" value={form.monthlyIncome} onChange={handle} required min="1"
              className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 350000" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Other Monthly Expenses (₦)</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
            <input type="number" name="otherMonthlyExpenses" value={form.otherMonthlyExpenses} onChange={handle} min="0"
              className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 100000" /></div>
            <p className="text-xs text-slate-400 mt-1">Food, transport, utilities, loans etc.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rent Affordability Rule (%)</label>
            <div className="flex gap-2">
              {['25', '30', '33'].map(p => (
                <button key={p} type="button" onClick={() => setForm({...form, affordabilityPercent: p})}
                  className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${form.affordabilityPercent === p ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}>
                  {p}% of income
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">The 30% rule is the most widely recommended — spend no more than 30% of income on rent.</p>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Rent Affordability'}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Affordability status */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${result.affordable ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            {result.affordable
              ? <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />}
            <div>
              <p className={`font-semibold ${result.affordable ? 'text-emerald-800' : 'text-red-800'}`}>
                {result.affordable ? 'You can afford this rent budget' : 'This rent may stretch your budget'}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">
                Recommended max monthly rent: <strong>{fmt(result.recommendedMaxRent)}</strong> — leaving {fmt(result.remainingAfterRent)}/month for savings and other needs.
              </p>
            </div>
          </div>

          {/* Headline figures */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase mb-1">Max Monthly Rent</p>
              <p className="text-2xl font-bold text-emerald-700">{fmt(result.recommendedMaxRent)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-700 font-medium uppercase mb-1">Annual Rent Budget</p>
              <p className="text-2xl font-bold text-blue-700">{fmt(result.annualRent)}</p>
            </div>
          </div>

          {/* Move-in cost breakdown */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2 text-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Total Move-In Cost Estimate</h3>
            <Row l="Annual Rent (1 year)" v={fmt(result.annualRent)} />
            <Row l="Agency Fee (10% of annual rent)" v={fmt(result.agencyFee)} />
            <Row l="Legal Fee (5% of annual rent)" v={fmt(result.legalFee)} />
            <Row l="Caution Deposit (1 month rent)" v={fmt(result.cautionFee)} />
            <div className="border-t border-slate-200 pt-2">
              <Row l="Total Move-In Cost" v={fmt(result.totalMoveInCost)} bold />
            </div>
            <div className="border-t border-slate-200 pt-2">
              <Row l="2-Year Rent (if landlord requests)" v={fmt(result.twoYearRent)} />
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Nigerian landlords typically request 1–2 years rent upfront. Agency fees (10%) and legal fees (5%) are standard in Lagos and Abuja. Always negotiate — many landlords accept 6 months for existing tenants.</span>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ l, v, bold = false }: any) {
  return <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}><span className="text-slate-600">{l}</span><span>{v}</span></div>;
}
