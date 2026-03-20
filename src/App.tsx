import React, { useState, useEffect } from 'react';
import { Calculator, Home, ChevronRight } from 'lucide-react';
import { ROUTES } from './routes/index';
import { CALCULATOR_LIST } from './routes/calculatorList';
import Footer from './components/layout/Footer';

// ── Routing helpers ────────────────────────────────────────────────────────────
function getPath(): string {
  return window.location.pathname || '/';
}

export function navigate(path: string) {
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
  const route = ROUTES[path];
  const label = route?.title?.split('|')[0]?.trim() || path;
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

  // Update SEO meta tags, canonical URL and schema on route change
  useEffect(() => {
    const route = ROUTES[currentPath];
    if (!route) return;

    const SITE = 'https://toolsng.com';

    document.title = route.title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'name', 'description');
    setMeta('meta[name="description"]', 'content', route.description);
    setMeta('meta[property="og:title"]', 'property', 'og:title');
    setMeta('meta[property="og:title"]', 'content', route.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description');
    setMeta('meta[property="og:description"]', 'content', route.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url');
    setMeta('meta[property="og:url"]', 'content', `${SITE}${currentPath}`);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${SITE}${currentPath}`;

    let schemaEl = document.getElementById('page-schema');
    if (!schemaEl) { schemaEl = document.createElement('script'); schemaEl.id = 'page-schema'; (schemaEl as HTMLScriptElement).type = 'application/ld+json'; document.head.appendChild(schemaEl); }
    const isTaxPage = ['paye', 'vat', 'wht', 'cit', 'sme', 'net-salary', 'pension'].some(k => currentPath.includes(k));
    schemaEl.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebApplication',
      'name': route.title.split('|')[0].trim(), 'description': route.description,
      'url': `${SITE}${currentPath}`,
      'applicationCategory': isTaxPage ? 'FinanceApplication' : 'BusinessApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'NGN' },
      'provider': { '@type': 'Organization', 'name': 'ToolsNG', 'url': SITE },
      'inLanguage': 'en-NG', 'areaServed': 'NG',
    });
  }, [currentPath]);

  const route = ROUTES[currentPath];
  const isHome = currentPath === '/';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <nav className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
            {route.seoContent && (
              <div className="px-6 pb-8 border-t border-slate-100 mt-4">
                <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-3">
                  {route.seoContent}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
            <p className="text-slate-500 mb-6">The calculator you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/')} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              Back to Home
            </button>
          </div>
        )}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
