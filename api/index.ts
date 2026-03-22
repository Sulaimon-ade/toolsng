const SITE_URL = process.env.SITE_URL || 'https://www.toolsng.com';
const ROUTES = [
  '/','/calculators/paye-tax','/calculators/bulk-payroll','/calculators/net-salary',
  '/calculators/pension','/calculators/mortgage','/calculators/company-income-tax',
  '/calculators/vat','/calculators/withholding-tax','/calculators/sme-tax',
  '/calculators/currency-converter','/calculators/loan','/calculators/investment',
  '/calculators/profit-margin','/calculators/break-even','/calculators/fuel-cost',
  '/calculators/generator-cost','/calculators/electricity-cost',
  '/calculators/invoice-generator','/calculators/receipt-generator',
  '/calculators/rent-affordability','/calculators/roi','/calculators/payroll',
  '/calculators/inflation','/calculators/import-duty','/calculators/property-transfer-tax',
];

export default function handler(req: any, res: any) {
  const url = req.url || '';

  if (url.includes('/api/health')) {
    return res.json({ status: 'ok', environment: 'vercel' });
  }

  if (url.includes('sitemap.xml')) {
    const today = new Date().toISOString().split('T')[0];
    const urls = ROUTES.map(r => `<url><loc>${SITE_URL}${r}</loc><lastmod>${today}</lastmod><priority>${r==='/'?'1.0':'0.8'}</priority></url>`).join('');
    res.setHeader('Content-Type', 'application/xml');
    return res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  }

  if (url.includes('robots.txt')) {
    res.setHeader('Content-Type', 'text/plain');
    return res.send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml`);
  }

  res.status(404).json({ error: 'Not found' });
}
