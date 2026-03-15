import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import TaxBreakdown from './TaxBreakdown';
import { API_URL } from '../config/api';

export default function DocumentExtraction({ mode }: { mode: 'payslip' | 'bank' }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [taxResult, setTaxResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedData(null);
      setTaxResult(null);
    }
  };

  const extractData = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(`${API_URL}/api/tax/extract-document`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setExtractedData(data.data);
      } else {
        alert('Extraction failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during document extraction.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTax = async () => {
    if (!extractedData) return;
    setLoading(true);

    try {
      let payload = {};
      
      if (mode === 'bank') {
        const gross = extractedData.estimatedAnnualIncome || 0;
        payload = {
          basicSalary: gross * 0.5,
          housingAllowance: gross * 0.2,
          transportAllowance: gross * 0.1,
          otherAllowances: gross * 0.2,
          annualRentPaid: 0
        };
      } else {
        payload = {
          basicSalary: extractedData.basicSalary || 0,
          housingAllowance: extractedData.housingAllowance || 0,
          transportAllowance: extractedData.transportAllowance || 0,
          otherAllowances: extractedData.otherAllowances || 0,
          pensionContributionOverride: extractedData.pension || undefined,
          nhfContributionOverride: extractedData.nhf || undefined,
          nhisContributionOverride: extractedData.nhis || undefined,
          annualRentPaid: 0
        };
      }

      const response = await fetch(`${API_URL}/api/tax/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        setTaxResult(data.data);
      } else {
        alert('Calculation failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during tax calculation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (field: string, value: string) => {
    setExtractedData({ ...extractedData, [field]: Number(value) || 0 });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {mode === 'bank' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>Important:</strong> This calculation is an estimate based on detected income credits from your bank statement and may not reflect your actual taxable income.
          </p>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center border-dashed mb-8">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Upload {mode === 'payslip' ? 'Payslip PDF' : 'Bank Statement PDF'}
        </h3>
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          Our AI will extract the relevant income and deduction components automatically.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Select PDF File
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </label>
          {file && <span className="text-sm text-slate-600">{file.name}</span>}
        </div>

        {file && !extractedData && (
          <button
            onClick={extractData}
            disabled={loading}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Extracting Data...' : 'Extract Data'}
          </button>
        )}
      </div>

      {extractedData && !taxResult && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Extracted Data
            </h3>
            <span className="text-sm text-slate-500">
              Confidence: {((extractedData.confidenceScore || 0) * 100).toFixed(0)}%
            </span>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-6">Please verify and correct the extracted values before calculating tax.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mode === 'bank' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Annual Income (₦)</label>
                  <input
                    type="number"
                    value={extractedData.estimatedAnnualIncome || ''}
                    onChange={(e) => handleDataChange('estimatedAnnualIncome', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <>
                  <Input label="Basic Salary" value={extractedData.basicSalary} onChange={(v: string) => handleDataChange('basicSalary', v)} />
                  <Input label="Housing Allowance" value={extractedData.housingAllowance} onChange={(v: string) => handleDataChange('housingAllowance', v)} />
                  <Input label="Transport Allowance" value={extractedData.transportAllowance} onChange={(v: string) => handleDataChange('transportAllowance', v)} />
                  <Input label="Other Allowances" value={extractedData.otherAllowances} onChange={(v: string) => handleDataChange('otherAllowances', v)} />
                  <Input label="Pension" value={extractedData.pension} onChange={(v: string) => handleDataChange('pension', v)} />
                  <Input label="NHF" value={extractedData.nhf} onChange={(v: string) => handleDataChange('nhf', v)} />
                  <Input label="NHIS" value={extractedData.nhis} onChange={(v: string) => handleDataChange('nhis', v)} />
                </>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={calculateTax}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Confirm & Calculate Tax'}
              </button>
            </div>
          </div>
        </div>
      )}

      {taxResult && <TaxBreakdown data={taxResult} />}
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
      />
    </div>
  );
}
