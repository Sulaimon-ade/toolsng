import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITE_URL = 'https://toolsng.com';

const ALL_ROUTES = [
  '/',
  '/calculators/paye-tax',
  '/calculators/bulk-payroll',
  '/calculators/payslip-extraction',
  '/calculators/bank-statement',
  '/calculators/company-income-tax',
  '/calculators/vat',
  '/calculators/withholding-tax',
  '/calculators/sme-tax',
  '/calculators/tax-changelog',
  '/calculators/currency-converter',
  '/calculators/loan',
  '/calculators/investment',
  '/calculators/profit-margin',
  '/calculators/invoice-generator',
  '/calculators/receipt-generator',
  '/calculators/electricity-cost',
  '/calculators/net-salary',
  '/calculators/pension',
  '/calculators/mortgage',
  '/calculators/break-even',
  '/calculators/fuel-cost',
  '/calculators/generator-cost',
  '/calculators/rent-affordability',
  '/calculators/roi',
  '/calculators/payroll',
  '/calculators/inflation',
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const today = new Date().toISOString().split('T')[0];

  const urls = ALL_ROUTES.map(route => `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.includes('paye') || route.includes('net-salary') || route.includes('vat') ? '0.9' : '0.8'}</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24 hours
  res.status(200).send(sitemap);
}
