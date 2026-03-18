import express from "express";
import cors from "cors";
import toolsRoutes from "../src/routes/toolsRoutes";
import taxRoutes from "../src/routes/taxRoutes";
import businessTaxRoutes from "../src/routes/businessTaxRoutes";

const SITE_URL = process.env.SITE_URL || 'https://toolsng.vercel.app';

const ALL_ROUTES = [
  '/', '/calculators/paye-tax', '/calculators/bulk-payroll',
  '/calculators/payslip-extraction', '/calculators/bank-statement',
  '/calculators/company-income-tax', '/calculators/vat',
  '/calculators/withholding-tax', '/calculators/sme-tax',
  '/calculators/tax-changelog', '/calculators/currency-converter',
  '/calculators/loan', '/calculators/investment',
  '/calculators/profit-margin', '/calculators/invoice-generator',
  '/calculators/receipt-generator', '/calculators/electricity-cost',
  '/calculators/net-salary', '/calculators/pension',
  '/calculators/mortgage', '/calculators/break-even',
  '/calculators/fuel-cost', '/calculators/generator-cost',
];

const app = express();

app.use(cors({
  origin: [
    "https://toolsng.com",
    "https://www.toolsng.com",
    "https://toolsng.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use("/api/tools", toolsRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/business-tax", businessTaxRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: "vercel" });
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const urls = ALL_ROUTES.map(route => `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('');
  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /temp/\n\nSitemap: ${SITE_URL}/sitemap.xml`);
});

export default app;
