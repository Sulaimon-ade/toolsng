import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Info } from 'lucide-react';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }
function fmtUSD(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}` ; }

const CATEGORIES = [
  { label: 'Electronics & Gadgets', dutyRate: 20, levy: 5 },
  { label: 'Vehicles (new)', dutyRate: 35, levy: 15 },
  { label: 'Vehicles (used)', dutyRate: 35, levy: 15 },
  { label: 'Clothing & Textiles', dutyRate: 35, levy: 10 },
  { label: 'Food & Beverages', dutyRate: 20, levy: 5 },
  { label: 'Machinery & Equipment', dutyRate: 5, levy: 0 },
  { label: 'Building Materials', dutyRate: 10, levy: 0 },
  { label: 'Pharmaceuticals', dutyRate: 5, levy: 0 },
  { label: 'Furniture', dutyRate: 35, levy: 10 },
  { label: 'Cosmetics & Toiletries', dutyRate: 20, levy: 5 },
  { label: 'Books & Educational Materials', dutyRate: 0, levy: 0 },
  { label: 'Raw Materials', dutyRate: 5, levy: 0 },
  { label: 'Custom Rate', dutyRate: 0, levy: 0 },
];

export default function ImportDutyCalculator() {
  const [form, setForm] = useState({
    cifValueUSD: '', exchangeRate: '1600', categoryIndex: '0',
    customDutyRate: '', customLevyRate: '', shippingUSD: '', insuranceUSD: '',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCat = CATEGORIES[Number(form.categoryIndex)];
  const isCustom = selectedCat.label === 'Custom Rate';

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const dutyRate = isCustom ? Number(form.customDutyRate) : selectedCat.dutyRate;
      const levyRate = isCustom ? Number(form.customLevyRate) : selectedCat.levy;
      const cifUSD = Number(form.cifValueUSD) + Number(form.shippingUSD || 0) + Number(form.insuranceUSD || 0);
      const exchangeRate = Number(form.exchangeRate);
      const cifNGN = cifUSD * exchangeRate;
      const importDuty = cifNGN * (dutyRate / 100);
      const levyAmount = cifNGN * (levyRate / 100);
      const vat = (cifNGN + importDuty + levyAmount) * 0.075;
      const totalDuties = importDuty + levyAmount + vat;
      const totalLandedCost = cifNGN + totalDuties;

      setResult({
        cifUSD, cifNGN, exchangeRate, dutyRate, levyRate,
        importDuty, levyAmount, vat, totalDuties, totalLandedCost,
        category: selectedCat.label,
        effectiveDutyRate: Number(((totalDuties / cifNGN) * 100).toFixed(1)),
      });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Import Duty Calculator Nigeria</h2>
        <p className="text-sm text-slate-500 mb-6">Calculate customs duty, levies and VAT on goods imported into Nigeria through the Nigerian Customs Service.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Goods Category</label>
            <select name="categoryIndex" value={form.categoryIndex} onChange={handle}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
              {CATEGORIES.map((c, i) => (
                <option key={i} value={i}>{c.label} {!isCustom && i === Number(form.categoryIndex) ? `(Duty: ${c.dutyRate}%, Levy: ${c.levy}%)` : ''}</option>
              ))}
            </select>
            {!isCustom && (
              <p className="text-xs text-slate-500 mt-1">Duty Rate: <strong>{selectedCat.dutyRate}%</strong> · Levy: <strong>{selectedCat.levy}%</strong></p>
            )}
          </div>

          {isCustom && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom Duty Rate (%)</label>
                <input type="number" name="customDutyRate" value={form.customDutyRate} onChange={handle} min="0" max="100" step="0.5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Levy Rate (%)</label>
                <input type="number" name="customLevyRate" value={form.customLevyRate} onChange={handle} min="0" max="100" step="0.5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 5" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Goods Value (USD) *</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input type="number" name="cifValueUSD" value={form.cifValueUSD} onChange={handle} required min="1"
                className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 5000" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">USD/NGN Exchange Rate</label>
              <input type="number" name="exchangeRate" value={form.exchangeRate} onChange={handle} min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
              <div className="flex gap-1 mt-1">
                {['1550','1600','1650'].map(r => (
                  <button key={r} type="button" onClick={() => setForm({...form, exchangeRate: r})}
                    className={`text-xs px-2 py-0.5 rounded ${form.exchangeRate === r ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>₦{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Shipping Cost (USD)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input type="number" name="shippingUSD" value={form.shippingUSD} onChange={handle} min="0"
                className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="0" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Insurance (USD)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input type="number" name="insuranceUSD" value={form.insuranceUSD} onChange={handle} min="0"
                className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="0" /></div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : 'Calculate Import Duty'}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-600 font-medium uppercase mb-1">CIF Value (NGN)</p>
              <p className="text-lg font-bold text-slate-800">{fmt(result.cifNGN)}</p>
              <p className="text-xs text-slate-400">{fmtUSD(result.cifUSD)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-xs text-red-700 font-medium uppercase mb-1">Total Duties & VAT</p>
              <p className="text-lg font-bold text-red-700">{fmt(result.totalDuties)}</p>
              <p className="text-xs text-red-400">{result.effectiveDutyRate}% effective rate</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center col-span-2 md:col-span-1">
              <p className="text-xs text-emerald-700 font-medium uppercase mb-1">Total Landed Cost</p>
              <p className="text-lg font-bold text-emerald-700">{fmt(result.totalLandedCost)}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Full Breakdown</h3>
            <Row l={`Goods Value (${fmtUSD(result.cifUSD)} × ₦${result.exchangeRate})`} v={fmt(result.cifNGN)} />
            <Row l={`Import Duty (${result.dutyRate}% of CIF)`} v={fmt(result.importDuty)} red />
            <Row l={`Levy (${result.levyRate}% of CIF)`} v={fmt(result.levyAmount)} red />
            <Row l="VAT (7.5% of CIF + Duty + Levy)" v={fmt(result.vat)} red />
            <div className="border-t border-slate-200 pt-2">
              <Row l="Total Duties + VAT" v={fmt(result.totalDuties)} bold />
              <Row l="Total Landed Cost in Nigeria" v={fmt(result.totalLandedCost)} bold />
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Duty rates are indicative based on Nigeria Customs Tariff (ECOWAS CET). Actual rates may vary. Additional charges may apply: SURCHARGE, CISS, ETLS. Always confirm with a licensed clearing agent.</span>
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
