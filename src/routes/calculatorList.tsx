import React from 'react';
import {
  Calculator, FileSpreadsheet, FileText, Building2,
  Briefcase, Percent, Receipt, TrendingUp, History,
  DollarSign, Landmark, LineChart, PieChart, FileCheck,
  Zap,
} from 'lucide-react';

export interface CalculatorItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
}

export interface CalculatorGroup {
  category: string;
  items: CalculatorItem[];
}

// ── Add new tools here — one entry per calculator ───────────────────────────
export const CALCULATOR_LIST: CalculatorGroup[] = [
  {
    category: 'Personal Tax',
    items: [
      { path: '/calculators/paye-tax',          label: 'PAYE Tax Calculator',       icon: <Calculator className="w-5 h-5" />,     desc: 'Monthly take-home pay & tax breakdown' },
      { path: '/calculators/bulk-payroll',       label: 'Bulk Payroll (CSV)',         icon: <FileSpreadsheet className="w-5 h-5" />, desc: 'Calculate tax for all employees at once' },
      { path: '/calculators/payslip-extraction', label: 'Payslip Extraction',         icon: <FileText className="w-5 h-5" />,       desc: 'Extract salary data from a payslip PDF' },
      { path: '/calculators/bank-statement',     label: 'Bank Statement Estimate',    icon: <Building2 className="w-5 h-5" />,      desc: 'Estimate income from bank statement' },
    ],
  },
  {
    category: 'Business Tax',
    items: [
      { path: '/calculators/company-income-tax', label: 'Company Income Tax',         icon: <Briefcase className="w-5 h-5" />,  desc: 'CIT for companies & corporates' },
      { path: '/calculators/vat',                label: 'VAT Calculator',             icon: <Percent className="w-5 h-5" />,    desc: 'Nigerian VAT at 7.5%' },
      { path: '/calculators/withholding-tax',    label: 'Withholding Tax',            icon: <Receipt className="w-5 h-5" />,    desc: 'WHT on contracts, rent, dividends' },
      { path: '/calculators/sme-tax',            label: 'SME Tax Estimator',          icon: <TrendingUp className="w-5 h-5" />, desc: 'Tax estimates for small businesses' },
      { path: '/calculators/tax-changelog',      label: 'Tax Rules Changelog',        icon: <History className="w-5 h-5" />,    desc: 'What changed in Finance Act 2026' },
    ],
  },
  {
    category: 'Finance Tools',
    items: [
      { path: '/calculators/currency-converter', label: 'Currency Converter',         icon: <DollarSign className="w-5 h-5" />, desc: 'Naira to USD, GBP, EUR and more' },
      { path: '/calculators/loan',               label: 'Loan Calculator',            icon: <Landmark className="w-5 h-5" />,   desc: 'Monthly repayment & amortisation' },
      { path: '/calculators/investment',         label: 'Investment Calculator',      icon: <LineChart className="w-5 h-5" />,  desc: 'Compound interest & future value' },
      { path: '/calculators/profit-margin',      label: 'Profit Margin Calculator',   icon: <PieChart className="w-5 h-5" />,   desc: 'Margin %, markup % & total profit' },
      { path: '/calculators/invoice-generator',  label: 'Invoice Generator',          icon: <FileCheck className="w-5 h-5" />,  desc: 'Professional PDF invoices with VAT' },
      { path: '/calculators/receipt-generator',  label: 'Receipt Generator',          icon: <Receipt className="w-5 h-5" />,    desc: 'Payment receipts with PDF download' },
      { path: '/calculators/electricity-cost',   label: 'Electricity Cost Calculator',icon: <Zap className="w-5 h-5" />,        desc: 'NERC Band A–E tariff calculator' },
    ],
  },
  {
    category: 'Salary & Retirement',
    items: [
      { path: '/calculators/net-salary', label: 'Net Salary Calculator',  icon: <Calculator className="w-5 h-5" />, desc: 'Full take-home pay with PAYE, pension, NHF' },
      { path: '/calculators/pension',    label: 'Pension Calculator (RSA)',icon: <TrendingUp className="w-5 h-5" />, desc: 'Project your RSA balance at retirement' },
      { path: '/calculators/mortgage',   label: 'Mortgage Calculator',    icon: <Landmark className="w-5 h-5" />,   desc: 'Monthly payments & repayment schedule' },
    ],
  },
  {
    category: 'Business Tools',
    items: [
      { path: '/calculators/break-even',      label: 'Break-Even Calculator',         icon: <PieChart className="w-5 h-5" />, desc: 'Units needed to cover costs & profit' },
      { path: '/calculators/fuel-cost',       label: 'Fuel Cost Calculator',          icon: <Zap className="w-5 h-5" />,     desc: 'Petrol spend per trip, month & year' },
      { path: '/calculators/generator-cost',  label: 'Generator Cost Calculator',     icon: <Zap className="w-5 h-5" />,     desc: 'Generator vs grid electricity cost' },
    ],
  },
];
