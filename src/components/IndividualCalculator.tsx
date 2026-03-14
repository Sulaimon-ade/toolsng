import React, { useState } from 'react';
import TaxBreakdown from './TaxBreakdown';

export default function IndividualCalculator() {
  const [mode, setMode] = useState<'simple' | 'detailed'>('simple');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    annualGross: '',
    basicSalary: '',
    housingAllowance: '',
    transportAllowance: '',
    otherAllowances: '',
    annualRentPaid: '',
    pensionOverride: '',
    nhfOverride: '',
    nhisOverride: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let payload = {};
      
      if (mode === 'simple') {
        const gross = Number(formData.annualGross) || 0;
        // In simple mode, we assume basic is 50%, housing 20%, transport 10%, others 20%
        payload = {
          basicSalary: gross * 0.5,
          housingAllowance: gross * 0.2,
          transportAllowance: gross * 0.1,
          otherAllowances: gross * 0.2,
          annualRentPaid: 0
        };
      } else {
        payload = {
          basicSalary: Number(formData.basicSalary) || 0,
          housingAllowance: Number(formData.housingAllowance) || 0,
          transportAllowance: Number(formData.transportAllowance) || 0,
          otherAllowances: Number(formData.otherAllowances) || 0,
          annualRentPaid: Number(formData.annualRentPaid) || 0,
          pensionContributionOverride: formData.pensionOverride ? Number(formData.pensionOverride) : undefined,
          nhfContributionOverride: formData.nhfOverride ? Number(formData.nhfOverride) : undefined,
          nhisContributionOverride: formData.nhisOverride ? Number(formData.nhisOverride) : undefined,
        };
      }

      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert('Calculation failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during calculation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setMode('simple')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'simple' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Simple Mode
          </button>
          <button
            onClick={() => setMode('detailed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'detailed' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Detailed Mode
          </button>
        </div>
      </div>

      <form onSubmit={calculateTax} className="max-w-2xl mx-auto">
        {mode === 'simple' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Annual Gross Salary (₦)</label>
              <input
                type="number"
                name="annualGross"
                required
                value={formData.annualGross}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. 5000000"
              />
            </div>
            <p className="text-xs text-slate-500 italic">
              Note: This is an estimate based on an assumed salary structure (50% Basic, 20% Housing, 10% Transport, 20% Other).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 border-b pb-2">Income Components (Annual)</h3>
              <Input label="Basic Salary" name="basicSalary" value={formData.basicSalary} onChange={handleChange} required />
              <Input label="Housing Allowance" name="housingAllowance" value={formData.housingAllowance} onChange={handleChange} />
              <Input label="Transport Allowance" name="transportAllowance" value={formData.transportAllowance} onChange={handleChange} />
              <Input label="Other Allowances" name="otherAllowances" value={formData.otherAllowances} onChange={handleChange} />
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 border-b pb-2">Deductions & Reliefs (Annual)</h3>
              <Input label="Annual Rent Paid" name="annualRentPaid" value={formData.annualRentPaid} onChange={handleChange} />
              <Input label="Pension Override (Optional)" name="pensionOverride" value={formData.pensionOverride} onChange={handleChange} />
              <Input label="NHF Override (Optional)" name="nhfOverride" value={formData.nhfOverride} onChange={handleChange} />
              <Input label="NHIS Override (Optional)" name="nhisOverride" value={formData.nhisOverride} onChange={handleChange} />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Tax'}
          </button>
        </div>
      </form>

      {result && <TaxBreakdown data={result} />}
    </div>
  );
}

function Input({ label, name, value, onChange, required = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        placeholder="0"
      />
    </div>
  );
}
