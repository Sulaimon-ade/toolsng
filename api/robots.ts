export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://toolsng.com/sitemap.xml`);
}
