import React, { useState } from 'react';
import { Info } from 'lucide-react';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }

const STATES: Record<string, {
  cgt: number; stampDuty: number; consentFee: number;
  registrationFee: number; governorConsent: number; notes: string;
}> = {
  'Lagos': { cgt: 10, stampDuty: 1.5, consentFee: 3, registrationFee: 1, governorConsent: 3, notes: 'CGT at 10% on gains. Governor\'s Consent required for all transactions above ₦500k.' },
  'Abuja (FCT)': { cgt: 10, stampDuty: 1.5, consentFee: 3, registrationFee: 1, governorConsent: 3, notes: 'FCT follows federal rates. AGIS handles land administration.' },
  'Rivers': { cgt: 10, stampDuty: 1.5, consentFee: 3, registrationFee: 1, governorConsent: 3, notes: 'Rivers State Land Use Charge applies. Survey fees additional.' },
  'Ogun': { cgt: 10, stampDuty: 1.5, consentFee: 3, registrationFee: 0.5, governorConsent: 2, notes: 'Lower registration fee than Lagos.' },
  'Oyo': { cgt: 10, stampDuty: 1.5, consentFee: 2, registrationFee: 0.5, governorConsent: 2, notes: 'Oyo State Land Bureau handles registrations.' },
  'Other States': { cgt: 10, stampDuty: 1.5, consentFee: 2, registrationFee: 1, governorConsent: 2, notes: 'Rates are approximate. Confirm exact rates with the state\'s Land Bureau.' },
};

export default function PropertyTransferTax() {
  const [form, setForm] = useState({ propertyValue: '', state: 'Lagos', purchasePrice: '', isNewProperty: 'false' });
  const [result, setResult] = useState<any>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const rates = STATES[form.state];
    const value = Number(form.propertyValue);
    const purchasePrice = Number(form.purchasePrice) || 0;
    const isNew = form.isNewProperty === 'true';

    const gain = Math.max(0, value - purchasePrice);
    const cgt = isNew ? 0 : gain * (rates.cgt / 100);
    const stampDuty = value * (rates.stampDuty / 100);
    const consentFee = value * (rates.consentFee / 100);
    const registrationFee = value * (rates.registrationFee / 100);
    const governorConsent = value * (rates.governorConsent / 100);
    const legalFee = value * 0.05;
    const agentFee = value * 0.05;
    const surveyFee = 150000; // approximate

    const totalGovernmentFees = cgt + stampDuty + consentFee + registrationFee + governorConsent;
    const totalTransactionCost = totalGovernmentFees + legalFee + agentFee + surveyFee;

    setResult({
      propertyValue: value, state: form.state, gain,
      cgt, stampDuty, consentFee, registrationFee, governorConsent,
      legalFee, agentFee, surveyFee,
      totalGovernmentFees, totalTransactionCost,
      effectiveRate: Number(((totalGovernmentFees / value) * 100).toFixed(1)),
      rates, isNew,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Property Transfer Tax Calculator Nigeria</h2>
        <p className="text-sm text-slate-500 mb-6">Calculate all taxes and fees when buying or selling property in Nigeria — CGT, stamp duty, consent fees and registration fees by state.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <select name="state" value={form.state} onChange={handle}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                {Object.keys(STATES).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
              <select name="isNewProperty" value={form.isNewProperty} onChange={handle}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="false">Existing Property (resale)</option>
                <option value="true">New Property (first sale)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property Sale Value (₦) *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
            <input type="number" name="propertyValue" value={form.propertyValue} onChange={handle} required min="1"
              className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 50000000" /></div>
          </div>

          {form.isNewProperty === 'false' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Original Purchase Price (₦) — for CGT</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
              <input type="number" name="purchasePrice" value={form.purchasePrice} onChange={handle} min="0"
                className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 30000000" /></div>
              <p className="text-xs text-slate-400 mt-1">CGT is charged on the gain (sale price minus original purchase price)</p>
            </div>
          )}
        </div>

        <button type="submit" className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg">
          Calculate Property Transfer Costs
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-xs text-red-700 font-medium uppercase mb-1">Govt Fees</p>
              <p className="text-lg font-bold text-red-700">{fmt(result.totalGovernmentFees)}</p>
              <p className="text-xs text-red-400">{result.effectiveRate}% of value</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-xs text-amber-700 font-medium uppercase mb-1">Other Costs</p>
              <p className="text-lg font-bold text-amber-700">{fmt(result.legalFee + result.agentFee + result.surveyFee)}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-medium uppercase mb-1">Total Cost</p>
              <p className="text-lg font-bold text-emerald-700">{fmt(result.totalTransactionCost)}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Government Fees — {result.state}</h3>
            {!result.isNew && <Row l={`Capital Gains Tax (${result.rates.cgt}% on gain of ${fmt(result.gain)})`} v={fmt(result.cgt)} red />}
            {result.isNew && <Row l="Capital Gains Tax" v="N/A (new property)" />}
            <Row l={`Stamp Duty (${result.rates.stampDuty}%)`} v={fmt(result.stampDuty)} red />
            <Row l={`Consent Fee (${result.rates.consentFee}%)`} v={fmt(result.consentFee)} red />
            <Row l={`Registration Fee (${result.rates.registrationFee}%)`} v={fmt(result.registrationFee)} red />
            <Row l={`Governor's Consent (${result.rates.governorConsent}%)`} v={fmt(result.governorConsent)} red />
            <div className="border-t border-slate-200 pt-2">
              <Row l="Total Government Fees" v={fmt(result.totalGovernmentFees)} bold />
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Professional Fees (Estimates)</h3>
            <Row l="Legal / Solicitor Fee (5%)" v={fmt(result.legalFee)} />
            <Row l="Estate Agent Fee (5%)" v={fmt(result.agentFee)} />
            <Row l="Survey & Valuation Fee (approx.)" v={fmt(result.surveyFee)} />
            <div className="border-t border-slate-200 pt-2">
              <Row l="Grand Total (Govt + Professional)" v={fmt(result.totalTransactionCost)} bold />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{result.rates.notes} Professional fees are estimates — always confirm with your solicitor.</span>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ l, v, bold = false, red = false }: any) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}>
      <span className="text-slate-600">{l}</span>
      <span className={red ? 'text-red-600' : ''}>{v}</span>
    </div>
  );
}
