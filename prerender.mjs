/**
 * prerender.mjs
 * Runs after `vite build` to generate static HTML files for every route.
 * This lets Google index each calculator page individually.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROUTES = [
  { path: '/', title: 'Free Nigerian Tax & Finance Calculators 2026 | ToolsNG', desc: 'Free, accurate Nigerian tax and finance calculators. PAYE tax, VAT, WHT, loan, mortgage, pension and business calculators updated for Nigeria Finance Act 2026.' },
  { path: '/calculators/paye-tax', title: 'PAYE Tax Calculator Nigeria 2026 | ToolsNG', desc: 'Calculate your Nigerian PAYE income tax accurately using the 2026 Finance Act tax bands. Shows CRA, pension, NHF, NHIS deductions and monthly take-home pay.' },
  { path: '/calculators/bulk-payroll', title: 'Bulk Payroll PAYE Calculator Nigeria 2026 | ToolsNG', desc: 'Upload a CSV of employees and calculate PAYE tax for your entire payroll at once.' },
  { path: '/calculators/payslip-extraction', title: 'Payslip Tax Extractor Nigeria | ToolsNG', desc: 'Upload a payslip PDF and automatically extract salary components for PAYE tax calculation.' },
  { path: '/calculators/bank-statement', title: 'Bank Statement Income Estimator Nigeria | ToolsNG', desc: 'Upload a bank statement to estimate annual income and calculate your Nigerian tax liability.' },
  { path: '/calculators/company-income-tax', title: 'Company Income Tax (CIT) Calculator Nigeria 2026 | ToolsNG', desc: 'Calculate Nigerian Company Income Tax for your business. Updated for Finance Act 2026 rates.' },
  { path: '/calculators/vat', title: 'VAT Calculator Nigeria 7.5% | ToolsNG', desc: 'Calculate Nigerian VAT at 7.5%. Works for both VAT-inclusive and VAT-exclusive amounts.' },
  { path: '/calculators/withholding-tax', title: 'Withholding Tax (WHT) Calculator Nigeria 2026 | ToolsNG', desc: 'Calculate Withholding Tax on contracts, dividends, rent, royalties and more.' },
  { path: '/calculators/sme-tax', title: 'SME Tax Estimator Nigeria 2026 | ToolsNG', desc: 'Estimate tax obligations for small and medium enterprises in Nigeria.' },
  { path: '/calculators/tax-changelog', title: 'Nigeria Tax Law Changes 2026 | ToolsNG', desc: 'A full changelog of Nigerian tax law changes from the Finance Act 2026 and prior years.' },
  { path: '/calculators/currency-converter', title: 'Naira Currency Converter – USD, GBP, EUR | ToolsNG', desc: 'Convert Nigerian Naira to USD, GBP, EUR and other currencies using live exchange rates.' },
  { path: '/calculators/loan', title: 'Loan Calculator Nigeria – Monthly Repayment | ToolsNG', desc: 'Calculate monthly loan repayments, total interest and amortisation schedule for Nigerian loans.' },
  { path: '/calculators/investment', title: 'Investment Calculator Nigeria | ToolsNG', desc: 'Calculate future value of investments in Nigeria including compound interest.' },
  { path: '/calculators/profit-margin', title: 'Profit Margin Calculator Nigeria | ToolsNG', desc: 'Calculate gross profit, profit margin percentage and markup for any product or service.' },
  { path: '/calculators/invoice-generator', title: 'Free Invoice Generator Nigeria | ToolsNG', desc: 'Create professional invoices for Nigerian businesses. Add VAT, WHT and download as PDF.' },
  { path: '/calculators/receipt-generator', title: 'Free Receipt Generator Nigeria | ToolsNG', desc: 'Generate professional payment receipts for Nigerian businesses. Download as PDF instantly.' },
  { path: '/calculators/electricity-cost', title: 'Electricity Cost Calculator Nigeria 2024 | ToolsNG', desc: 'Calculate appliance running costs on Nigerian electricity tariffs. Supports all NERC bands.' },
  { path: '/calculators/net-salary', title: 'Net Salary Calculator Nigeria 2026 | ToolsNG', desc: 'Calculate your exact take-home pay including PAYE tax, pension, NHF and NHIS deductions.' },
  { path: '/calculators/pension', title: 'Pension Calculator Nigeria (RSA/PFA) | ToolsNG', desc: 'Project your retirement savings under Nigeria\'s Contributory Pension Scheme.' },
  { path: '/calculators/mortgage', title: 'Mortgage Calculator Nigeria | ToolsNG', desc: 'Calculate monthly mortgage payments, total interest and repayment schedule.' },
  { path: '/calculators/break-even', title: 'Break-Even Calculator Nigeria | ToolsNG', desc: 'Calculate how many units you need to sell to break even and start making profit.' },
  { path: '/calculators/fuel-cost', title: 'Fuel Cost Calculator Nigeria | ToolsNG', desc: 'Calculate how much you spend on petrol per trip, month and year in Nigeria.' },
  { path: '/calculators/generator-cost', title: 'Generator Running Cost Calculator Nigeria | ToolsNG', desc: 'Calculate your generator monthly running cost vs grid electricity.' },
  { path: '/calculators/rent-affordability', title: 'Rent Affordability Calculator Nigeria | ToolsNG', desc: 'Find out how much rent you can afford in Nigeria including agency and legal fees.' },
  { path: '/calculators/roi', title: 'ROI Calculator Nigeria | ToolsNG', desc: 'Calculate Return on Investment and annualised return for any investment in Nigeria.' },
  { path: '/calculators/payroll', title: 'Payroll Calculator Nigeria 2026 | ToolsNG', desc: 'Calculate net pay, PAYE and employer cost for your entire team. Finance Act 2026 compliant.' },
  { path: '/calculators/inflation', title: 'Nigeria Inflation Calculator 2015–2026 | ToolsNG', desc: 'See how much purchasing power your Naira has lost to inflation between any two years.' },
  { path: '/calculators/import-duty', title: 'Import Duty Calculator Nigeria | ToolsNG', desc: 'Calculate customs duty, levies and VAT on goods imported into Nigeria.' },
  { path: '/calculators/property-transfer-tax', title: 'Property Transfer Tax Calculator Nigeria | ToolsNG', desc: 'Calculate CGT, stamp duty and consent fees when buying or selling property in Nigeria.' },
];

const distDir = path.join(__dirname, 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf-8');

let generated = 0;

for (const route of ROUTES) {
  // Skip homepage — already exists as index.html
  if (route.path === '/') {
    // Just update the homepage meta tags
    const updatedIndex = template
      .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
      .replace(/(<meta name="description" content=")[^"]*"/, `$1${route.desc}"`);
    fs.writeFileSync(templatePath, updatedIndex);
    continue;
  }

  // Create directory for each route
  const routeDir = path.join(distDir, route.path);
  fs.mkdirSync(routeDir, { recursive: true });

  // Inject per-page meta tags into the HTML template
  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
    .replace(/(<meta name="title" content=")[^"]*"/, `$1${route.title}"`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${route.desc}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${route.title}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${route.desc}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1https://www.toolsng.com${route.path}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1https://www.toolsng.com${route.path}"`);

  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
  generated++;
}

console.log(`✓ Prerendered ${generated} routes successfully`);
