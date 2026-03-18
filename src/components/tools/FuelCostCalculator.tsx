import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info } from 'lucide-react';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }

const COMMON_CARS = [
  { name: 'Toyota Corolla', km: 14 },{ name: 'Toyota Camry', km: 12 },{ name: 'Toyota Hilux', km: 10 },
  { name: 'Honda Civic', km: 15 },{ name: 'Honda CR-V', km: 11 },{ name: 'Hyundai Elantra', km: 14 },
  { name: 'Kia Sportage', km: 11 },{ name: 'Ford Ranger (V6)', km: 9 },
];

export default function FuelCostCalculator() {
  const [form, setForm] = useState({ distanceKm: '', fuelEfficiencyKmPerLitre: '', fuelPricePerLitre: '950', tripsPerMonth: '20' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/fuel-cost-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distanceKm: Number(form.distanceKm), fuelEfficiencyKmPerLitre: Number(form.fuelEfficiencyKmPerLitre), fuelPricePerLitre: Number(form.fuelPricePerLitre), tripsPerMonth: Number(form.tripsPerMonth) })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed.'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Fuel Cost Calculator Nigeria</h2>
        <p className="text-sm text-slate-500 mb-6">Calculate how much you spend on fuel per trip, per month and per year.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Distance Per Trip (km) *</label>
            <input type="number" name="distanceKm" value={form.distanceKm} onChange={handle} required min="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 30 (Lagos Island to Mainland)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fuel Efficiency (km/litre) *</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_CARS.map(c => (
                <button key={c.name} type="button" onClick={() => setForm({...form, fuelEfficiencyKmPerLitre: c.km.toString()})}
                  className={`text-xs px-2 py-1 rounded-lg border transition-colors ${form.fuelEfficiencyKmPerLitre === c.km.toString() ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}>
                  {c.name} ({c.km})
                </button>
              ))}
            </div>
            <input type="number" name="fuelEfficiencyKmPerLitre" value={form.fuelEfficiencyKmPerLitre} onChange={handle} required min="1" step="0.5"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Price (₦/litre)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
              <input type="number" name="fuelPricePerLitre" value={form.fuelPricePerLitre} onChange={handle} min="1"
                className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" /></div>
              <p className="text-xs text-slate-400 mt-1">Current pump price</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trips Per Month</label>
              <input type="number" name="tripsPerMonth" value={form.tripsPerMonth} onChange={handle} min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              <p className="text-xs text-slate-400 mt-1">One-way trips (e.g. 20 work days × 2 = 40)</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Fuel Cost'}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-600 font-medium uppercase mb-1">Per Trip</p>
              <p className="text-xl font-bold text-slate-800">{fmt(result.tripCost)}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-xs text-amber-700 font-medium uppercase mb-1">Per Month</p>
              <p className="text-xl font-bold text-amber-700">{fmt(result.monthlyCost)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-xs text-red-700 font-medium uppercase mb-1">Per Year</p>
              <p className="text-xl font-bold text-red-700">{fmt(result.yearlyCost)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-600 font-medium uppercase mb-1">Cost Per km</p>
              <p className="text-xl font-bold text-slate-800">{fmt(result.costPerKm)}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Breakdown</h3>
            <Row l="Distance per trip" v={`${result.distanceKm} km`} />
            <Row l="Fuel efficiency" v={`${result.fuelEfficiencyKmPerLitre} km/litre`} />
            <Row l="Fuel needed per trip" v={`${result.litresNeeded} litres`} />
            <Row l="Fuel price" v={`${fmt(result.fuelPricePerLitre)}/litre`} />
            <Row l="Trips per month" v={`${result.tripsPerMonth}`} />
            <Row l="Fuel cost per trip" v={fmt(result.tripCost)} bold />
            <Row l="Monthly fuel cost" v={fmt(result.monthlyCost)} bold />
            <Row l="Annual fuel cost" v={fmt(result.yearlyCost)} bold />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Fuel efficiency varies with traffic, AC usage, tyre pressure and driving habits. Lagos traffic can reduce efficiency by 20–30%.</span>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ l, v, bold = false }: any) {
  return <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}><span className="text-slate-600">{l}</span><span>{v}</span></div>;
}
