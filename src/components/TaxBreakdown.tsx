import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TaxBreakdownProps {
  data: any;
}

export default function TaxBreakdown({ data }: TaxBreakdownProps) {
  if (!data) return null;

  const chartData = [
    { name: 'Net Income', value: data.netIncome, color: '#10b981' },
    { name: 'Annual Tax', value: data.annualTax, color: '#ef4444' },
    { name: 'Pension', value: data.deductions.pension, color: '#f59e0b' },
    { name: 'NHF', value: data.deductions.nhf, color: '#3b82f6' },
    { name: 'NHIS', value: data.deductions.nhis, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary</h3>
          <div className="space-y-3">
            <SummaryRow label="Gross Income" value={data.grossIncome} bold />
            <div className="pl-4 border-l-2 border-slate-200 space-y-2 my-2">
              <SummaryRow label="Pension (8%)" value={data.deductions.pension} />
              <SummaryRow label="NHF (2.5%)" value={data.deductions.nhf} />
              <SummaryRow label="NHIS (5%)" value={data.deductions.nhis} />
            </div>
            <SummaryRow label="Total Statutory Deductions" value={data.deductions.total} textClass="text-red-600" />
            <SummaryRow label="Income after Statutory Deductions" value={data.grossIncome - data.deductions.total} />
            <div className="pl-4 border-l-2 border-slate-200 space-y-2 my-2">
              <SummaryRow label="Tax Free Threshold" value={data.deductions.taxFreeThreshold} />
              <SummaryRow label="Rent Relief" value={data.deductions.rentRelief} />
            </div>
            <SummaryRow label="Total Reliefs" value={data.deductions.taxFreeThreshold + data.deductions.rentRelief} textClass="text-emerald-600" />
            <SummaryRow label="Chargeable / Taxable Income" value={data.taxableIncome} bold />
            <SummaryRow label="Annual Tax" value={data.annualTax} textClass="text-red-600" bold />
            <SummaryRow label="Monthly PAYE" value={data.monthlyPaye} textClass="text-red-600" />
            <SummaryRow label="Net Annual Income" value={data.netIncome} textClass="text-emerald-600" bold />
            <SummaryRow label="Effective Tax Rate" value={`${data.effectiveTaxRate.toFixed(2)}%`} />
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
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">Tax Brackets Applied</h3>
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
                  <tr key={i} className="border-b border-slate-200 last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-900">{b.range}</td>
                    <td className="px-6 py-4">{b.rate * 100}%</td>
                    <td className="px-6 py-4 text-right">₦{b.taxableAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right">₦{b.tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold text-slate-900">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right">Total Annual Tax</td>
                  <td className="px-6 py-3 text-right text-red-600">₦{data.annualTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="p-6 text-center text-slate-500">
              No tax due because chargeable income is ₦0.
            </div>
          )}
        </div>
      </div>

      <details className="group bg-slate-50 rounded-xl border border-slate-200">
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-semibold text-slate-900">
          <span>Calculation Details & Assumptions</span>
          <span className="transition group-open:rotate-180">
            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
          </span>
        </summary>
        <div className="px-6 pb-6 text-sm text-slate-600 space-y-4 border-t border-slate-200 pt-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Assumptions Used:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {data.assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Step-by-Step Calculation:</h4>
            <ul className="list-decimal pl-5 space-y-1 font-mono text-xs">
              {data.calculationSteps.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          {data.audit && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Audit Data:</h4>
              <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono text-slate-800">
                {JSON.stringify(data.audit, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

function SummaryRow({ label, value, bold = false, textClass = "text-slate-900" }: { label: string, value: number | string, bold?: boolean, textClass?: string }) {
  const displayValue = typeof value === 'number' ? `₦${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : value;
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-bold text-base' : 'text-sm'}`}>
      <span className="text-slate-600">{label}</span>
      <span className={textClass}>{displayValue}</span>
    </div>
  );
}
