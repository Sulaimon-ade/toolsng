import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info, Zap } from 'lucide-react';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }

const GENERATOR_PRESETS = [
  { label: '1 KVA', kva: 1, litres: 0.5 },
  { label: '2.5 KVA', kva: 2.5, litres: 1.1 },
  { label: '5 KVA', kva: 5, litres: 2.0 },
  { label: '7.5 KVA', kva: 7.5, litres: 2.8 },
  { label: '10 KVA', kva: 10, litres: 3.5 },
];

export default function GeneratorCostCalculator() {
  const [form, setForm] = useState({ generatorKva: '', fuelConsumptionPerHour: '', fuelPricePerLitre: '950', hoursPerDay: '8', gridRatePerKwh: '209', gridHoursPerDay: '6', maintenanceCostPerMonth: '5000' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyPreset = (p: typeof GENERATOR_PRESETS[0]) => setForm({ ...form, generatorKva: p.kva.toString(), fuelConsumptionPerHour: p.litres.toString() });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/generator-cost-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generatorKva: Number(form.generatorKva), fuelConsumptionPerHour: Number(form.fuelConsumptionPerHour), fuelPricePerLitre: Number(form.fuelPricePerLitre), hoursPerDay: Number(form.hoursPerDay), gridRatePerKwh: Number(form.gridRatePerKwh), gridHoursPerDay: Number(form.gridHoursPerDay), maintenanceCostPerMonth: Number(form.maintenanceCostPerMonth) })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed.'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Generator Running Cost Calculator</h2>
        <p className="text-sm text-slate-500 mb-6">Calculate how much your generator costs to run vs grid electricity. Includes fuel and maintenance.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">Quick Select Generator Size</label>
          <div className="flex flex-wrap gap-2">
            {GENERATOR_PRESETS.map(p => (
              <button key={p.label} type="button" onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${form.generatorKva === p.kva.toString() ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-1">🔴 Generator</h3>
            {[['generatorKva','Generator Size (KVA) *'],['fuelConsumptionPerHour','Fuel Consumption (litres/hour) *'],['fuelPricePerLitre','Fuel Price (₦/litre)'],['hoursPerDay','Hours Run Per Day'],['maintenanceCostPerMonth','Maintenance Cost (₦/month)']].map(([name, label]) => (
              <div key={name}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type="number" name={name} value={(form as any)[name]} onChange={handle} required={name.includes('KVA') || name.includes('Consumption')} min="0" step="any"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-1">🟢 Grid (NEPA/PHCN)</h3>
            {[['gridRatePerKwh','NERC Tariff Rate (₦/kWh)'],['gridHoursPerDay','Grid Supply Hours Per Day']].map(([name, label]) => (
              <div key={name}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type="number" name={name} value={(form as any)[name]} onChange={handle} min="0" step="any"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
            ))}
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
              <p className="font-medium">NERC 2024 Tariff Bands:</p>
              <p>Band A (20+ hrs): ₦209/kWh</p>
              <p>Band B (16–20 hrs): ₦63/kWh</p>
              <p>Band C (12–16 hrs): ₦52/kWh</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Generator Cost'}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Comparison headline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
              <Zap className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-red-700 font-medium uppercase mb-1">Generator Monthly Cost</p>
              <p className="text-2xl font-bold text-red-700">{fmt(result.genMonthlyCost)}</p>
              <p className="text-xs text-red-500 mt-1">{fmt(result.genCostPerKwh)}/kWh effective</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
              <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-emerald-700 font-medium uppercase mb-1">Grid Monthly Cost</p>
              <p className="text-2xl font-bold text-emerald-700">{fmt(result.gridMonthlyCost)}</p>
              <p className="text-xs text-emerald-500 mt-1">If grid supply was available all day</p>
            </div>
          </div>

          {result.monthlySavingsIfFullGrid > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="font-semibold text-amber-800">You could save {fmt(result.monthlySavingsIfFullGrid)}/month ({fmt(result.monthlySavingsIfFullGrid * 12)}/year) with reliable grid supply</p>
            </div>
          )}

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Generator Cost Breakdown</h3>
            <Row l="Generator size" v={`${result.generatorKva} KVA`} />
            <Row l="Fuel consumption" v={`${result.fuelConsumptionPerHour} litres/hour`} />
            <Row l="Hours per day" v={`${result.hoursPerDay} hrs`} />
            <Row l="Daily fuel consumed" v={`${result.genDailyFuel} litres`} />
            <Row l="Daily fuel cost" v={fmt(result.genDailyFuelCost)} />
            <Row l="Daily maintenance" v={fmt(result.maintenanceCostPerMonth / 30)} />
            <Row l="Total daily cost" v={fmt(result.genDailyCost)} bold />
            <Row l="Monthly cost" v={fmt(result.genMonthlyCost)} bold />
            <Row l="Yearly cost" v={fmt(result.genYearlyCost)} bold />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Generator cost per kWh is typically 5–10× higher than grid. Inverter/solar systems have high upfront cost but lower running costs. Consider a cost comparison over 3–5 years.</span>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ l, v, bold = false }: any) {
  return <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}><span className="text-slate-600">{l}</span><span>{v}</span></div>;
}
