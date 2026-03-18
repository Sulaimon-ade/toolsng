import React, { useState, useEffect } from 'react';
import { Calculator, FileSpreadsheet, FileText, Building2, Briefcase, Percent, Receipt, TrendingUp, History, DollarSign, Landmark, LineChart, PieChart, FileCheck, Zap, Home, ChevronRight } from 'lucide-react';
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
import ReceiptGenerator from './components/tools/ReceiptGenerator';
import Footer from './components/layout/Footer';

// ── Route map ──────────────────────────────────────────────────────────────────
const ROUTES: Record<string, { title: string; description: string; component: React.ReactNode }> = {
  '/': {
    title: 'Free Nigerian Tax & Finance Calculators 2026 | ToolsNG',
    description: 'Free, accurate Nigerian tax and finance calculators. PAYE tax, VAT, WHT, loan, investment calculators updated for the Nigeria Finance Act 2026.',
    component: null,
  },
  '/calculators/paye-tax': {
    title: 'PAYE Tax Calculator Nigeria 2026 | ToolsNG',
    description: 'Calculate your Nigerian PAYE income tax accurately using the 2026 Finance Act tax bands. Shows CRA, pension, NHF, NHIS deductions and monthly take-home pay.',
    component: <IndividualCalculator />,
  },
  '/calculators/bulk-payroll': {
    title: 'Bulk Payroll PAYE Calculator Nigeria 2026 | ToolsNG',
    description: 'Upload a CSV of employees and calculate PAYE tax for your entire payroll at once. Compliant with Nigeria Finance Act 2026.',
    component: <BulkPayroll />,
  },
  '/calculators/payslip-extraction': {
    title: 'Payslip Tax Extractor Nigeria | ToolsNG',
    description: 'Upload a payslip PDF and automatically extract salary components for PAYE tax calculation.',
    component: <DocumentExtraction mode="payslip" />,
  },
  '/calculators/bank-statement': {
    title: 'Bank Statement Income Estimator Nigeria | ToolsNG',
    description: 'Upload a bank statement to estimate annual income and calculate your Nigerian tax liability.',
    component: <DocumentExtraction mode="bank" />,
  },
  '/calculators/company-income-tax': {
    title: 'Company Income Tax (CIT) Calculator Nigeria 2026 | ToolsNG',
    description: 'Calculate Nigerian Company Income Tax (CIT) for your business. Updated for Finance Act 2026 rates and SME exemptions.',
    component: <CITCalculator />,
  },
  '/calculators/vat': {
    title: 'VAT Calculator Nigeria 7.5% | ToolsNG',
    description: 'Calculate Nigerian VAT at 7.5%. Works for both VAT-inclusive and VAT-exclusive amounts. Instant results.',
    component: <VATCalculator />,
  },
  '/calculators/withholding-tax': {
    title: 'Withholding Tax (WHT) Calculator Nigeria 2026 | ToolsNG',
    description: 'Calculate Withholding Tax on contracts, dividends, rent, royalties and more. All WHT rates per the Nigeria Finance Act 2026.',
    component: <WHTCalculator />,
  },
  '/calculators/sme-tax': {
    title: 'SME Tax Estimator Nigeria 2026 | ToolsNG',
    description: 'Estimate tax obligations for small and medium enterprises in Nigeria. Includes CIT, VAT registration threshold and presumptive tax.',
    component: <SMETaxEstimator />,
  },
  '/calculators/tax-changelog': {
    title: 'Nigeria Tax Law Changes 2026 | ToolsNG',
    description: 'A full changelog of Nigerian tax law changes from the Finance Act 2026 and prior years.',
    component: <TaxChangelog />,
  },
  '/calculators/currency-converter': {
    title: 'Naira Currency Converter – USD, GBP, EUR | ToolsNG',
    description: 'Convert Nigerian Naira (NGN) to USD, GBP, EUR and other currencies. Uses live exchange rates.',
    component: <CurrencyConverter />,
  },
  '/calculators/loan': {
    title: 'Loan Calculator Nigeria – Monthly Repayment | ToolsNG',
    description: 'Calculate monthly loan repayments, total interest and amortisation schedule for Nigerian loans.',
    component: <LoanCalculator />,
  },
  '/calculators/investment': {
    title: 'Investment Calculator Nigeria | ToolsNG',
    description: 'Calculate future value of investments in Nigeria including compound interest and monthly contributions.',
    component: <InvestmentCalculator />,
  },
  '/calculators/profit-margin': {
    title: 'Profit Margin Calculator Nigeria | ToolsNG',
    description: 'Calculate gross profit, profit margin percentage, markup percentage and total profit for any product or service sold in Nigeria.',
    component: <ProfitMarginCalculator />,
  },
  '/calculators/invoice-generator': {
    title: 'Free Invoice Generator Nigeria | ToolsNG',
    description: 'Create professional invoices for Nigerian businesses. Add VAT, WHT, discounts and extra charges. Download as PDF instantly.',
    component: <InvoiceGenerator />,
  },
  '/calculators/electricity-cost': {
    title: 'Electricity Cost Calculator Nigeria 2024 | ToolsNG',
    description: 'Calculate how much your appliances cost to run on Nigerian electricity tariffs. Supports all NERC bands A–E with 2024 rates.',
    component: <ElectricityCostCalculator />,
  },
  '/calculators/receipt-generator': {
    title: 'Free Receipt Generator Nigeria | ToolsNG',
    description: 'Generate professional payment receipts for Nigerian businesses instantly. Add items, VAT, payment method and download as PDF.',
    component: <ReceiptGenerator />,
  },
};

const CALCULATOR_LIST = [
  {
    category: 'Personal Tax',
    color: 'emerald',
    items: [
      { path: '/calculators/paye-tax', label: 'PAYE Tax Calculator', icon: <Calculator className="w-5 h-5" />, desc: 'Monthly take-home pay & tax breakdown' },
      { path: '/calculators/bulk-payroll', label: 'Bulk Payroll (CSV)', icon: <FileSpreadsheet className="w-5 h-5" />, desc: 'Calculate tax for all employees at once' },
      { path: '/calculators/payslip-extraction', label: 'Payslip Extraction', icon: <FileText className="w-5 h-5" />, desc: 'Extract salary data from a payslip PDF' },
      { path: '/calculators/bank-statement', label: 'Bank Statement Estimate', icon: <Building2 className="w-5 h-5" />, desc: 'Estimate income from bank statement' },
    ],
  },
  {
    category: 'Business Tax',
    color: 'blue',
    items: [
      { path: '/calculators/company-income-tax', label: 'Company Income Tax', icon: <Briefcase className="w-5 h-5" />, desc: 'CIT for companies & corporates' },
      { path: '/calculators/vat', label: 'VAT Calculator', icon: <Percent className="w-5 h-5" />, desc: 'Nigerian VAT at 7.5%' },
      { path: '/calculators/withholding-tax', label: 'Withholding Tax', icon: <Receipt className="w-5 h-5" />, desc: 'WHT on contracts, rent, dividends' },
      { path: '/calculators/sme-tax', label: 'SME Tax Estimator', icon: <TrendingUp className="w-5 h-5" />, desc: 'Tax estimates for small businesses' },
      { path: '/calculators/tax-changelog', label: 'Tax Rules Changelog', icon: <History className="w-5 h-5" />, desc: 'What changed in Finance Act 2026' },
    ],
  },
  {
    category: 'Finance Tools',
    color: 'purple',
    items: [
      { path: '/calculators/currency-converter', label: 'Currency Converter', icon: <DollarSign className="w-5 h-5" />, desc: 'Naira to USD, GBP, EUR and more' },
      { path: '/calculators/loan', label: 'Loan Calculator', icon: <Landmark className="w-5 h-5" />, desc: 'Monthly repayment & amortisation' },
      { path: '/calculators/investment', label: 'Investment Calculator', icon: <LineChart className="w-5 h-5" />, desc: 'Compound interest & future value' },
      { path: '/calculators/profit-margin', label: 'Profit Margin Calculator', icon: <PieChart className="w-5 h-5" />, desc: 'Margin %, markup % & total profit' },
      { path: '/calculators/invoice-generator', label: 'Invoice Generator', icon: <FileCheck className="w-5 h-5" />, desc: 'Professional PDF invoices with VAT' },
      { path: '/calculators/receipt-generator', label: 'Receipt Generator', icon: <Receipt className="w-5 h-5" />, desc: 'Payment receipts with PDF download' },
      { path: '/calculators/electricity-cost', label: 'Electricity Cost Calculator', icon: <Zap className="w-5 h-5" />, desc: 'NERC Band A–E tariff calculator' },
    ],
  },
];

// ── Routing helpers ────────────────────────────────────────────────────────────
function getPath(): string {
  return window.location.pathname || '/';
}

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

// ── Homepage ───────────────────────────────────────────────────────────────────
function HomePage() {
  return (
    <div className="space-y-12">
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Free Nigerian Tax & Finance Calculators
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Accurate, transparent calculations based on the <strong>Nigeria Finance Act 2026</strong>.
          Every formula is shown — no black boxes.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2 rounded-full font-medium">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Updated for Finance Act 2026 — effective 1 January 2026
        </div>
      </div>

      {CALCULATOR_LIST.map((group) => (
        <div key={group.category}>
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
            {group.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all text-left group"
              >
                <div className="text-emerald-600 mt-0.5 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 mt-1 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────────
function Breadcrumb({ path }: { path: string }) {
  if (path === '/') return null;
  const label = Object.values(ROUTES).find((_, i) => Object.keys(ROUTES)[i] === path)?.title?.split('|')[0]?.trim() || path;
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
      <button onClick={() => navigate('/')} className="hover:text-emerald-600 flex items-center gap-1">
        <Home className="w-4 h-4" /> Home
      </button>
      <ChevronRight className="w-3 h-3" />
      <span className="text-slate-800 font-medium">{label}</span>
    </nav>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentPath, setCurrentPath] = useState(getPath());

  useEffect(() => {
    const onPop = () => setCurrentPath(getPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Update document title and meta description on route change
  useEffect(() => {
    const route = ROUTES[currentPath];
    if (route) {
      document.title = route.title;
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = route.description;
    }
  }, [currentPath]);

  const route = ROUTES[currentPath];
  const isHome = currentPath === '/';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Nav */}
      <nav className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Calculator className="w-6 h-6 text-emerald-300" />
              <span className="font-bold text-xl tracking-tight">ToolsNG</span>
            </button>
            <div className="text-emerald-200 text-sm font-medium hidden sm:block">
              Finance Act 2026 Compliant
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {!isHome && <Breadcrumb path={currentPath} />}

        {isHome ? (
          <HomePage />
        ) : route ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 pt-6 pb-2 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900">
                {route.title.split('|')[0].trim()}
              </h1>
              <p className="text-slate-500 text-sm mt-1">{route.description}</p>
            </div>
            <div className="p-6">{route.component}</div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
            <p className="text-slate-500 mb-6">The calculator you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
