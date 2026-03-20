import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { Plus, Trash2, Info } from 'lucide-react';

function fmt(n: number) { return `₦${Math.round(n).toLocaleString('en-NG')}`; }

interface Employee { id: string; name: string; basicSalary: string; housingAllowance: string; transportAllowance: string; otherAllowances: string; }

export default function PayrollCalculator() {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: '', basicSalary: '', housingAllowance: '', transportAllowance: '', otherAllowances: '' }
  ]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEmp = (id: string, field: keyof Employee, value: string) =>
    setEmployees(employees.map(e => e.id === id ? { ...e, [field]: value } : e));

  const addEmp = () => setEmployees([...employees, { id: Date.now().toString(), name: '', basicSalary: '', housingAllowance: '', transportAllowance: '', otherAllowances: '' }]);
  const removeEmp = (id: string) => { if (employees.length > 1) setEmployees(employees.filter(e => e.id !== id)); };

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/tools/payroll-calculator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: employees.map(e => ({ name: e.name || `Employee ${e.id}`, basicSalary: Number(e.basicSalary) || 0, housingAllowance: Number(e.housingAllowance) || 0, transportAllowance: Number(e.transportAllowance) || 0, otherAllowances: Number(e.otherAllowances) || 0 })) })
      });
      const data = await res.json();
      if (data.success) setResult(data.data); else setError(data.error);
    } catch { setError('Calculation failed.'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Payroll Calculator Nigeria</h2>
        <p className="text-sm text-slate-500 mb-6">Calculate net pay, PAYE, pension and total employer cost for your entire team. Finance Act 2026 compliant.</p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        <div className="space-y-4">
          {employees.map((emp, idx) => (
            <div key={emp.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-slate-700">Employee {idx + 1}</span>
                <button type="button" onClick={() => removeEmp(emp.id)} disabled={employees.length === 1}
                  className="text-red-500 hover:text-red-700 disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                  <input type="text" value={emp.name} onChange={e => updateEmp(emp.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Employee name" />
                </div>
                {[['basicSalary','Basic Salary (Annual)'],['housingAllowance','Housing (Annual)'],['transportAllowance','Transport (Annual)'],['otherAllowances','Other (Annual)']].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₦</span>
                    <input type="number" value={(emp as any)[field]} onChange={e => updateEmp(emp.id, field as keyof Employee, e.target.value)} min="0"
                      className="w-full pl-5 pr-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="0" /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <button type="button" onClick={addEmp}
            className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium text-sm">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>

        <button type="submit" disabled={loading} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Calculating...' : `Calculate Payroll for ${employees.length} Employee${employees.length > 1 ? 's' : ''}`}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Totals summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['Total Gross','totalGross','slate'],['Total PAYE','totalPaye','red'],['Total Net Pay','totalNet','emerald'],['Total Employer Cost','totalEmployerCost','blue']].map(([label, key, color]) => (
              <div key={key} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4 text-center`}>
                <p className={`text-xs text-${color}-700 font-medium uppercase mb-1`}>{label}</p>
                <p className={`text-lg font-bold text-${color}-700`}>{fmt(result.totals[key])}</p>
              </div>
            ))}
          </div>

          {/* Per employee table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">Employee Breakdown (Monthly)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-600 uppercase">
                  <tr>
                    {['Employee','Gross','PAYE','Pension','NHF','NHIS','Net Pay','Employer Cost'].map(h => (
                      <th key={h} className="px-3 py-2 text-right first:text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.employees.map((emp: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-900">{emp.name}</td>
                      <td className="px-3 py-2 text-right">{fmt(emp.monthlyGross)}</td>
                      <td className="px-3 py-2 text-right text-red-600">{fmt(emp.monthlyPaye)}</td>
                      <td className="px-3 py-2 text-right text-amber-600">{fmt(emp.monthlyPension)}</td>
                      <td className="px-3 py-2 text-right text-blue-600">{fmt(emp.monthlyNhf)}</td>
                      <td className="px-3 py-2 text-right text-purple-600">{fmt(emp.monthlyNhis)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-600">{fmt(emp.monthlyNet)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{fmt(emp.totalEmployerCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Employer Cost = Gross + Employer Pension (10%). PAYE calculated per Finance Act 2026 with CRA. Remit PAYE to SIRS by 10th of following month, Pension to PFA by 7th.</span>
          </div>
        </div>
      )}
    </div>
  );
}
