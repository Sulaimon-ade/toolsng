import React from 'react';
import IndividualCalculator from '../components/IndividualCalculator';
import BulkPayroll from '../components/BulkPayroll';
import DocumentExtraction from '../components/DocumentExtraction';
import CITCalculator from '../components/business/CITCalculator';
import VATCalculator from '../components/business/VATCalculator';
import WHTCalculator from '../components/business/WHTCalculator';
import SMETaxEstimator from '../components/business/SMETaxEstimator';
import TaxChangelog from '../components/business/TaxChangelog';
import CurrencyConverter from '../components/tools/CurrencyConverter';
import LoanCalculator from '../components/tools/LoanCalculator';
import InvestmentCalculator from '../components/tools/InvestmentCalculator';
import ProfitMarginCalculator from '../components/tools/ProfitMarginCalculator';
import InvoiceGenerator from '../components/tools/InvoiceGenerator';
import ElectricityCostCalculator from '../components/tools/ElectricityCostCalculator';
import ReceiptGenerator from '../components/tools/ReceiptGenerator';
import NetSalaryCalculator from '../components/tools/NetSalaryCalculator';
import PensionCalculator from '../components/tools/PensionCalculator';
import MortgageCalculator from '../components/tools/MortgageCalculator';
import BreakEvenCalculator from '../components/tools/BreakEvenCalculator';
import FuelCostCalculator from '../components/tools/FuelCostCalculator';
import GeneratorCostCalculator from '../components/tools/GeneratorCostCalculator';
import RentAffordabilityCalculator from '../components/tools/RentAffordabilityCalculator';
import ROICalculator from '../components/tools/ROICalculator';
import PayrollCalculator from '../components/tools/PayrollCalculator';
import InflationCalculator from '../components/tools/InflationCalculator';

export interface RouteConfig {
  title: string;
  description: string;
  component: React.ReactNode;
  seoContent?: React.ReactNode;
}

// ── Add new routes here — one entry per calculator ──────────────────────────
export const ROUTES: Record<string, RouteConfig> = {
  '/': {
    title: 'Free Nigerian Tax & Finance Calculators 2026 | ToolsNG',
    description: 'Free, accurate Nigerian tax and finance calculators. PAYE tax, VAT, WHT, loan, investment calculators updated for the Nigeria Finance Act 2026.',
    component: null,
  },

  // ── Personal Tax ───────────────────────────────────────────────────────────
  '/calculators/paye-tax': {
    title: 'PAYE Tax Calculator Nigeria 2026 | ToolsNG',
    description: 'Calculate your Nigerian PAYE income tax accurately using the 2026 Finance Act tax bands. Shows CRA, pension, NHF, NHIS deductions and monthly take-home pay.',
    component: <IndividualCalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">How is PAYE Tax Calculated in Nigeria (2026)?</h2>
        <p>PAYE (Pay As You Earn) tax in Nigeria is calculated using the progressive tax bands introduced by the Finance Act 2026, effective 1 January 2026. The first step is to calculate the Consolidated Relief Allowance (CRA), which equals the higher of ₦200,000 or 1% of gross income, plus 20% of gross income. Statutory deductions — pension (8%), NHF (2.5% of basic), and NHIS (5%) — are also subtracted before tax is applied.</p>
        <p>The 2026 tax bands are: first ₦800,000 at 0%, next ₦2.2 million at 15%, next ₦9 million at 18%, next ₦12 million at 21%, and above ₦24 million at 24%.</p>
        <h2 className="text-base font-semibold text-slate-800">Who pays PAYE tax in Nigeria?</h2>
        <p>All employees earning above the tax-free threshold in Nigeria are subject to PAYE tax, which is deducted at source by employers and remitted to the relevant State Internal Revenue Service (SIRS) monthly.</p>
      </div>
    ),
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

  // ── Business Tax ───────────────────────────────────────────────────────────
  '/calculators/company-income-tax': {
    title: 'Company Income Tax (CIT) Calculator Nigeria 2026 | ToolsNG',
    description: 'Calculate Nigerian Company Income Tax (CIT) for your business. Updated for Finance Act 2026 rates and SME exemptions.',
    component: <CITCalculator />,
  },
  '/calculators/vat': {
    title: 'VAT Calculator Nigeria 7.5% | ToolsNG',
    description: 'Calculate Nigerian VAT at 7.5%. Works for both VAT-inclusive and VAT-exclusive amounts. Instant results.',
    component: <VATCalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">What is the VAT rate in Nigeria?</h2>
        <p>Nigeria's Value Added Tax (VAT) rate is 7.5%, as established by the Finance Act 2019 and effective from February 2020. This rate remains unchanged under the Finance Act 2026. VAT registration is mandatory for businesses with annual turnover above ₦25 million.</p>
        <p>VAT is charged on the supply of goods and services in Nigeria and must be remitted to FIRS monthly. Exempt items include basic food items, medical services, educational materials, and exported services.</p>
      </div>
    ),
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

  // ── Finance Tools ──────────────────────────────────────────────────────────
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
  '/calculators/receipt-generator': {
    title: 'Free Receipt Generator Nigeria | ToolsNG',
    description: 'Generate professional payment receipts for Nigerian businesses instantly. Add items, VAT, payment method and download as PDF.',
    component: <ReceiptGenerator />,
  },
  '/calculators/electricity-cost': {
    title: 'Electricity Cost Calculator Nigeria 2024 | ToolsNG',
    description: 'Calculate how much your appliances cost to run on Nigerian electricity tariffs. Supports all NERC bands A–E with 2024 rates.',
    component: <ElectricityCostCalculator />,
  },

  // ── Salary & Retirement ────────────────────────────────────────────────────
  '/calculators/net-salary': {
    title: 'Net Salary Calculator Nigeria 2026 | ToolsNG',
    description: 'Calculate your exact take-home pay in Nigeria including PAYE tax, pension, NHF and NHIS deductions. Updated for Finance Act 2026.',
    component: <NetSalaryCalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">What deductions come out of a Nigerian salary?</h2>
        <p>A Nigerian employee's gross salary is reduced by several statutory deductions: PAYE income tax, pension (8% of basic + housing + transport), NHF (2.5% of basic salary), and NHIS (5% of gross income). The employer also contributes 10% to pension and 5% to NHIS on your behalf.</p>
      </div>
    ),
  },
  '/calculators/pension': {
    title: 'Pension Calculator Nigeria (RSA/PFA) | ToolsNG',
    description: 'Project your retirement savings under Nigeria\'s Contributory Pension Scheme. Calculate RSA balance at retirement.',
    component: <PensionCalculator />,
  },
  '/calculators/mortgage': {
    title: 'Mortgage Calculator Nigeria | ToolsNG',
    description: 'Calculate monthly mortgage payments, total interest and repayment schedule for Nigerian property loans.',
    component: <MortgageCalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">What are typical mortgage rates in Nigeria?</h2>
        <p>Nigerian mortgage interest rates typically range from 18% to 25% per annum for commercial bank mortgages. The Federal Mortgage Bank of Nigeria (FMBN) offers subsidised rates of 6–9% for NHF contributors. Most banks require a minimum down payment of 20–30% of the property value.</p>
      </div>
    ),
  },

  // ── Business Tools ─────────────────────────────────────────────────────────
  '/calculators/break-even': {
    title: 'Break-Even Calculator Nigeria | ToolsNG',
    description: 'Calculate how many units you need to sell to break even and start making profit. Includes contribution margin and profit chart.',
    component: <BreakEvenCalculator />,
  },
  '/calculators/fuel-cost': {
    title: 'Fuel Cost Calculator Nigeria | ToolsNG',
    description: 'Calculate how much you spend on petrol per trip, per month and per year in Nigeria. Includes popular Nigerian car models.',
    component: <FuelCostCalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">How much does fuel cost in Nigeria?</h2>
        <p>Following the removal of the petrol subsidy in May 2023, Nigeria's petrol price is determined by market forces and ranges from ₦900 to ₦1,100 per litre depending on location. Most Nigerian cars achieve 8–15 km per litre, with Lagos traffic reducing efficiency by 20–30%.</p>
      </div>
    ),
  },
  '/calculators/generator-cost': {
    title: 'Generator Running Cost Calculator Nigeria | ToolsNG',
    description: 'Calculate your generator\'s monthly running cost vs grid electricity. Compare fuel, maintenance and effective cost per kWh.',
    component: <GeneratorCostCalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">How much does it cost to run a generator in Nigeria?</h2>
        <p>A typical 2.5 KVA generator at ₦950/litre costs ₦25,000–₦35,000/month in fuel for 8 hours daily use. The effective cost per kWh from a generator is ₦400–₦800, versus ₦40–₦209 from the grid — making solar/inverter systems attractive with 2–4 year payback periods.</p>
      </div>
    ),
  },

  // ── New Tools ──────────────────────────────────────────────────────────────
  '/calculators/rent-affordability': {
    title: 'Rent Affordability Calculator Nigeria | ToolsNG',
    description: 'Find out how much rent you can afford in Nigeria. Includes agency fees, legal fees, caution deposit and total move-in cost.',
    component: <RentAffordabilityCalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">How much rent can I afford in Nigeria?</h2>
        <p>The widely recommended rule is to spend no more than 30% of your monthly income on rent. In Nigerian cities like Lagos and Abuja where landlords request 1–2 years rent upfront, you also need to budget for agency fees (10% of annual rent), legal fees (5%), and a caution deposit (usually 1 month's rent).</p>
        <p>For example, if you earn ₦350,000/month, your maximum monthly rent should be around ₦105,000, meaning annual rent of ₦1.26 million — plus move-in costs of about ₦1.6 million in total.</p>
      </div>
    ),
  },
  '/calculators/roi': {
    title: 'ROI Calculator Nigeria | ToolsNG',
    description: 'Calculate Return on Investment (ROI) and annualised return for any investment or business venture in Nigeria.',
    component: <ROICalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">How to calculate ROI in Nigeria</h2>
        <p>ROI (Return on Investment) is calculated as: (Final Value − Initial Investment) ÷ Initial Investment × 100. For example, if you invested ₦1 million and it grew to ₦1.5 million, your ROI is 50%. The annualised ROI adjusts for the duration so you can compare investments held for different time periods.</p>
      </div>
    ),
  },
  '/calculators/payroll': {
    title: 'Payroll Calculator Nigeria 2026 | ToolsNG',
    description: 'Calculate net pay, PAYE tax, pension and total employer cost for your entire team. Supports multiple employees. Finance Act 2026 compliant.',
    component: <PayrollCalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">How to run payroll in Nigeria</h2>
        <p>Nigerian payroll requires calculating PAYE tax for each employee using the Finance Act 2026 tax bands, deducting pension (employee 8%, employer 10% of basic + housing + transport), NHF (2.5% of basic salary) and NHIS (5% of gross). PAYE must be remitted to the relevant State Internal Revenue Service by the 10th of the following month, and pension to the employee's PFA by the 7th.</p>
      </div>
    ),
  },
  '/calculators/inflation': {
    title: 'Nigeria Inflation Calculator 2015–2026 | ToolsNG',
    description: 'See how much purchasing power your Naira has lost to inflation in Nigeria between any two years from 2015 to 2026.',
    component: <InflationCalculator />,
    seoContent: (
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <h2 className="text-base font-semibold text-slate-800">How bad is inflation in Nigeria?</h2>
        <p>Nigeria's inflation rate surged from around 9% in 2015 to over 32% in 2024, one of the highest in Africa. This means ₦100,000 in 2015 would need to be worth over ₦600,000 in 2026 to have the same purchasing power. Food inflation has been even higher, significantly impacting household budgets across Nigeria.</p>
      </div>
    ),
  },
};
