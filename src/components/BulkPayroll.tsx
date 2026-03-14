import React, { useState } from 'react';
import Papa from 'papaparse';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';

export default function BulkPayroll() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (resultsData) => {
        try {
          const response = await fetch('/api/tax/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employees: resultsData.data })
          });
          
          const data = await response.json();
          if (data.success) {
            setResults(data.data);
          } else {
            alert('Processing failed: ' + data.error);
          }
        } catch (err) {
          console.error(err);
          alert('An error occurred during bulk processing.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const downloadCSV = () => {
    if (!results.length) return;
    
    const csvData = results.map(r => ({
      Employee: r.name,
      'Gross Income': r.grossIncome,
      'Total Deductions': r.deductions.total,
      'Taxable Income': r.taxableIncome,
      'Annual Tax': r.annualTax,
      'Monthly PAYE': r.monthlyPaye,
      'Net Pay': r.netIncome,
      'Effective Tax Rate (%)': r.effectiveTaxRate.toFixed(2)
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'payroll_tax_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center border-dashed mb-8">
        <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Upload Payroll CSV</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          Upload a CSV containing: name, basicSalary, housingAllowance, transportAllowance, otherAllowances, annualRent, pension, nhf, nhis.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Select CSV File
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
          {file && <span className="text-sm text-slate-600">{file.name}</span>}
        </div>

        {file && (
          <button
            onClick={processFile}
            disabled={loading}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Process Payroll'}
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Processed Results ({results.length} employees)</h3>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3 text-right">Gross Income</th>
                  <th className="px-6 py-3 text-right">Taxable Income</th>
                  <th className="px-6 py-3 text-right">Annual Tax</th>
                  <th className="px-6 py-3 text-right">Monthly PAYE</th>
                  <th className="px-6 py-3 text-right">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{r.name}</td>
                    <td className="px-6 py-4 text-right">₦{r.grossIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right">₦{r.taxableIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-red-600">₦{r.annualTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-red-600">₦{r.monthlyPaye.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-medium">₦{r.netIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
