import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TaxBreakdownProps {
  data: any;
}

function fmt(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TaxBreakdown({ data }: TaxBreakdownProps) {
  if (!data) return null;

  const chartData = [
    { name: 'Net Income', value: data.netAnnualIncome, color: '#10b981' },
    { name: 'Annual Tax', value: data.annualTax, color: '#ef4444' },
    { name: 'Pension', value: data.deductions.pension, color: '#f59e0b' },
    { name: 'NHF', value: data.deductions.nhf, color: '#3b82f6' },
    { name: 'NHIS', value: data.deductions.nhis, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  return (
    <div className="mt-8 space-y-8">
      {/* Monthly snapshot banner */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide mb-1">Monthly Net Pay</p>
          <p className="text-2xl font-bold text-emerald-700">{fmt(data.netMonthlyIncome)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-xs text-red-700 font-medium uppercase tracking-wide mb-1">Monthly PAYE</p>
          <p className="text-2xl font-bold text-red-700">{fmt(data.monthlyPaye)}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-600 font-medium uppercase tracking-wide mb-1">Effective Tax Rate</p>
          <p className="text-2xl font-bold text-slate-800">{data.effectiveTaxRate.toFixed(2)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Annual Summary</h3>
          <div className="space-y-3">
            <SummaryRow label="Gross Annual Income" value={data.grossIncome} bold />
            <div className="pl-4 border-l-2 border-slate-200 space-y-2 my-2">
              <SummaryRow label="Pension (8% of Basic+Housing+Transport)" value={data.deductions.pension} />
              <SummaryRow label="NHF (2.5% of Basic Salary)" value={data.deductions.nhf} />
              <SummaryRow label="NHIS (5% of Gross)" value={data.deductions.nhis} />
            </div>
            <SummaryRow label="Total Statutory Deductions" value={data.deductions.total} textClass="text-red-600" />
            <div className="pl-4 border-l-2 border-emerald-200 space-y-2 my-2">
              <SummaryRow label="CRA (Consolidated Relief Allowance)" value={data.cra} textClass="text-emerald-700" />
              <SummaryRow label="Rent Relief" value={data.deductions.rentRelief} textClass="text-emerald-700" />
            </div>
            <SummaryRow label="Chargeable / Taxable Income" value={data.taxableIncome} bold />
            <SummaryRow label="Annual PAYE Tax" value={data.annualTax} textClass="text-red-600" bold />
            <SummaryRow label="Monthly PAYE" value={data.monthlyPaye} textClass="text-red-600" />
            <SummaryRow label="Net Annual Income" value={data.netAnnualIncome} textClass="text-emerald-600" bold />
            <SummaryRow label="Net Monthly Income" value={data.netMonthlyIncome} textClass="text-emerald-600" bold />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 w-full text-left">Income Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => fmt(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tax Brackets Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">2026 PAYE Brackets Applied</h3>
          <p className="text-xs text-slate-500 mt-1">Nigeria Finance Act 2026 — effective 1 January 2026</p>
        </div>
        <div className="overflow-x-auto">
          {data.brackets && data.brackets.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th className="px-6 py-3">Income Bracket</th>
                  <th className="px-6 py-3">Rate</th>
                  <th className="px-6 py-3 text-right">Taxable Amount</th>
                  <th className="px-6 py-3 text-right">Tax Computed</th>
                </tr>
              </thead>
              <tbody>
                {data.brackets.map((b: any, i: number) => (
                  <tr key={i} className={`border-b border-slate-200 last:border-0 ${b.rate === 0 ? 'bg-emerald-50' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-900">{b.range}</td>
                    <td className="px-6 py-4">{b.rate === 0 ? <span className="text-emerald-600 font-semibold">0% (Tax Free)</span> : `${b.rate * 100}%`}</td>
                    <td className="px-6 py-4 text-right">{fmt(b.taxableAmount)}</td>
                    <td className="px-6 py-4 text-right">{b.rate === 0 ? <span className="text-emerald-600">₦0.00</span> : fmt(b.tax)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold text-slate-900">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right">Total Annual PAYE Tax</td>
                  <td className="px-6 py-3 text-right text-red-600">{fmt(data.annualTax)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="p-6 text-center text-slate-500">
              No tax due — chargeable income is ₦0.
            </div>
          )}
        </div>
      </div>

      {/* Calculation Steps */}
      <details className="group bg-slate-50 rounded-xl border border-slate-200">
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-semibold text-slate-900">
          <span>Step-by-Step Calculation & Assumptions</span>
          <span className="transition group-open:rotate-180">
            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </span>
        </summary>
        <div className="px-6 pb-6 text-sm text-slate-600 space-y-4 border-t border-slate-200 pt-4">
          {data.assumptions.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Assumptions Used:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {data.assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Calculation Steps:</h4>
            <ul className="list-none pl-0 space-y-1 font-mono text-xs bg-slate-100 rounded-lg p-4">
              {data.calculationSteps.map((s: string, i: number) => <li key={i} className="py-0.5">{s}</li>)}
            </ul>
          </div>
          <p className="text-xs text-slate-400 italic">
            ⚠️ Based on Nigeria Finance Act 2026 (effective 1 January 2026). Always consult a certified tax professional for advice.
          </p>
        </div>
      </details>
    </div>
  );
}

function SummaryRow({ label, value, bold = false, textClass = 'text-slate-900' }: { label: string; value: number | string; bold?: boolean; textClass?: string }) {
  const displayValue = typeof value === 'number' ? fmt(value) : value;
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-bold text-base' : 'text-sm'}`}>
      <span className="text-slate-600">{label}</span>
      <span className={textClass}>{displayValue}</span>
    </div>
  );
}
