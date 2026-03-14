import React, { useState } from 'react';
import { Calculator, FileSpreadsheet, FileText, Building2, Briefcase, Percent, Receipt, TrendingUp, History, Wrench, DollarSign, Landmark, LineChart, PieChart, FileCheck, Zap } from 'lucide-react';
import IndividualCalculator from './components/IndividualCalculator';
import BulkPayroll from './components/BulkPayroll';
import DocumentExtraction from './components/DocumentExtraction';
import CITCalculator from './components/business/CITCalculator';
import VATCalculator from './components/business/VATCalculator';
import WHTCalculator from './components/business/WHTCalculator';
import SMETaxEstimator from './components/business/SMETaxEstimator';
import TaxChangelog from './components/business/TaxChangelog';
import CurrencyConverter from './components/tools/CurrencyConverter';
import LoanCalculator from './components/tools/LoanCalculator';
import InvestmentCalculator from './components/tools/InvestmentCalculator';
import ProfitMarginCalculator from './components/tools/ProfitMarginCalculator';
import InvoiceGenerator from './components/tools/InvoiceGenerator';
import ElectricityCostCalculator from './components/tools/ElectricityCostCalculator';
import Footer from './components/layout/footer';

export default function App() {
  const [mainCategory, setMainCategory] = useState<'personal' | 'business' | 'tools'>('personal');
  const [activePersonalTab, setActivePersonalTab] = useState<'individual' | 'bulk' | 'payslip' | 'bank'>('individual');
  const [activeBusinessTab, setActiveBusinessTab] = useState<'cit' | 'vat' | 'wht' | 'sme' | 'changelog'>('cit');
  const [activeToolsTab, setActiveToolsTab] = useState<'currency' | 'loan' | 'investment' | 'profit' | 'invoice' | 'electricity'>('currency');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <nav className="bg-emerald-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <img
                src="/public/toolsng-logo.png"
                alt="ToolsNG Logo"
                className="h-8 w-auto"
                />
              <span className="font-bold text-xl tracking-tight">NaijaTax Pro 2026</span>
            </div>
            <div className="text-emerald-200 text-sm font-medium">
              Nigeria Tax Act 2025 Compliant
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Tax Calculator Engine</h1>
          <p className="mt-2 text-slate-600">
            Accurate, transparent, and auditable tax calculations based on the new Nigeria Tax Act 2025.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-slate-200 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setMainCategory('personal')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${mainCategory === 'personal' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Personal Tax
            </button>
            <button
              onClick={() => setMainCategory('business')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${mainCategory === 'business' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Business Tax
            </button>
            <button
              onClick={() => setMainCategory('tools')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${mainCategory === 'tools' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Tools
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {mainCategory === 'personal' ? (
            <>
              <div className="flex overflow-x-auto border-b border-slate-200">
                <TabButton 
                  active={activePersonalTab === 'individual'} 
                  onClick={() => setActivePersonalTab('individual')}
                  icon={<Calculator className="w-4 h-4" />}
                  label="Individual Calculator"
                />
                <TabButton 
                  active={activePersonalTab === 'bulk'} 
                  onClick={() => setActivePersonalTab('bulk')}
                  icon={<FileSpreadsheet className="w-4 h-4" />}
                  label="Bulk Payroll (CSV)"
                />
                <TabButton 
                  active={activePersonalTab === 'payslip'} 
                  onClick={() => setActivePersonalTab('payslip')}
                  icon={<FileText className="w-4 h-4" />}
                  label="Payslip Extraction"
                />
                <TabButton 
                  active={activePersonalTab === 'bank'} 
                  onClick={() => setActivePersonalTab('bank')}
                  icon={<Building2 className="w-4 h-4" />}
                  label="Bank Statement Estimate"
                />
              </div>

              <div className="p-6">
                {activePersonalTab === 'individual' && <IndividualCalculator />}
                {activePersonalTab === 'bulk' && <BulkPayroll />}
                {activePersonalTab === 'payslip' && <DocumentExtraction mode="payslip" />}
                {activePersonalTab === 'bank' && <DocumentExtraction mode="bank" />}
              </div>
            </>
          ) : mainCategory === 'business' ? (
            <>
              <div className="flex overflow-x-auto border-b border-slate-200">
                <TabButton 
                  active={activeBusinessTab === 'cit'} 
                  onClick={() => setActiveBusinessTab('cit')}
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Company Income Tax"
                />
                <TabButton 
                  active={activeBusinessTab === 'vat'} 
                  onClick={() => setActiveBusinessTab('vat')}
                  icon={<Percent className="w-4 h-4" />}
                  label="VAT Calculator"
                />
                <TabButton 
                  active={activeBusinessTab === 'wht'} 
                  onClick={() => setActiveBusinessTab('wht')}
                  icon={<Receipt className="w-4 h-4" />}
                  label="Withholding Tax"
                />
                <TabButton 
                  active={activeBusinessTab === 'sme'} 
                  onClick={() => setActiveBusinessTab('sme')}
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="SME Tax Estimator"
                />
                <TabButton 
                  active={activeBusinessTab === 'changelog'} 
                  onClick={() => setActiveBusinessTab('changelog')}
                  icon={<History className="w-4 h-4" />}
                  label="Tax Rules Changelog"
                />
              </div>

              <div className="p-6">
                {activeBusinessTab === 'cit' && <CITCalculator />}
                {activeBusinessTab === 'vat' && <VATCalculator />}
                {activeBusinessTab === 'wht' && <WHTCalculator />}
                {activeBusinessTab === 'sme' && <SMETaxEstimator />}
                {activeBusinessTab === 'changelog' && <TaxChangelog />}
              </div>
            </>
          ) : (
            <>
              <div className="flex overflow-x-auto border-b border-slate-200">
                <TabButton 
                  active={activeToolsTab === 'currency'} 
                  onClick={() => setActiveToolsTab('currency')}
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Currency Converter"
                />
                <TabButton 
                  active={activeToolsTab === 'loan'} 
                  onClick={() => setActiveToolsTab('loan')}
                  icon={<Landmark className="w-4 h-4" />}
                  label="Loan Calculator"
                />
                <TabButton 
                  active={activeToolsTab === 'investment'} 
                  onClick={() => setActiveToolsTab('investment')}
                  icon={<LineChart className="w-4 h-4" />}
                  label="Investment Calculator"
                />
                <TabButton 
                  active={activeToolsTab === 'profit'} 
                  onClick={() => setActiveToolsTab('profit')}
                  icon={<PieChart className="w-4 h-4" />}
                  label="Profit Margin Calculator"
                />
                <TabButton 
                  active={activeToolsTab === 'invoice'} 
                  onClick={() => setActiveToolsTab('invoice')}
                  icon={<FileCheck className="w-4 h-4" />}
                  label="Invoice Generator"
                />
                <TabButton 
                  active={activeToolsTab === 'electricity'} 
                  onClick={() => setActiveToolsTab('electricity')}
                  icon={<Zap className="w-4 h-4" />}
                  label="Electricity Calculator"
                />
              </div>

              <div className="p-6">
                {activeToolsTab === 'currency' && <CurrencyConverter />}
                {activeToolsTab === 'loan' && <LoanCalculator />}
                {activeToolsTab === 'investment' && <InvestmentCalculator />}
                {activeToolsTab === 'profit' && <ProfitMarginCalculator />}
                {activeToolsTab === 'invoice' && <InvoiceGenerator />}
                {activeToolsTab === 'electricity' && <ElectricityCostCalculator />}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer onNavigate={setMainCategory} />
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors
        ${active 
          ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/50' 
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
