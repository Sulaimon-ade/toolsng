import React from 'react';
import { Mail, Instagram, Linkedin, MessageCircle } from 'lucide-react';

interface FooterProps {
  onNavigate?: (category: 'personal' | 'business' | 'tools') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, category: 'personal' | 'business' | 'tools') => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(category);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* SECTION 1 — About */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">About This Site</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Free financial and business tools designed to help individuals, freelancers, and businesses make smarter financial decisions.
            </p>
          </div>

          {/* SECTION 2 — Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleNavigation(e, 'personal')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleNavigation(e, 'tools')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  All Tools
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleNavigation(e, 'personal')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Tax Calculators
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleNavigation(e, 'business')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Business Tools
                </a>
              </li>
            </ul>
          </div>

          {/* SECTION 3 — Report Errors / Feedback */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Report Errors or Feedback</h3>
            <p className="text-slate-400 text-sm mb-4">
              Found an error in one of the calculators? Help us improve by reporting it.
            </p>
            <div className="space-y-3">
              <a
                href="https://wa.me/2340000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                Report via WhatsApp
              </a>
              <a
                href="mailto:hello@example.com"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors text-sm w-full justify-center"
              >
                <Mail className="w-4 h-4" />
                hello@example.com
              </a>
            </div>
          </div>

          {/* SECTION 4 — Social Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Connect With Me</h3>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com/in/yourname"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-emerald-600 transition-all transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/yourname"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-emerald-600 transition-all transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/2340000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-emerald-600 transition-all transform hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col items-center text-center space-y-4">
          {/* SECTION 5 — Disclaimer */}
          <p className="text-slate-500 text-xs max-w-3xl">
            These calculators provide estimates and should not replace professional financial, legal, or tax advice.
          </p>

          {/* SECTION 6 — Copyright */}
          <p className="text-slate-500 text-sm">
            &copy; {currentYear} Financial Tools Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
