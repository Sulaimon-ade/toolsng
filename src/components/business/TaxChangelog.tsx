import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function TaxChangelog() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-2xl font-semibold text-slate-900">Tax Rules Changelog</h2>
          <p className="text-slate-600 mt-2">
            Audit of business tax implementation against the Nigeria Tax Act 2025 (effective January 1, 2026).
            This log details the corrections and updates made to align the engine with the new regime.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* PIT Section */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              1. Personal Income Tax (PIT)
            </h3>
            <div className="ml-10 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">Thresholds, Reliefs & Brackets</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li>
                    <span className="font-medium text-slate-700">Tax-Free Threshold:</span> Increased to ₦800,000 per annum (previously CRA of ₦200k + 20% of gross).
                  </li>
                  <li>
                    <span className="font-medium text-emerald-700">Rent Relief:</span> Introduced a deduction for rent paid up to a maximum of ₦500,000 per annum.
                  </li>
                  <li>
                    <span className="font-medium text-emerald-700">2025 Tax Brackets:</span> First ₦800k (0%), Next ₦2.2m (15%), Next ₦3m (18%), Next ₦4m (21%), Next ₦10m (23%), Above ₦20m (25%).
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* CIT Section */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              2. Company Income Tax (CIT)
            </h3>
            <div className="ml-10 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">Thresholds & Rates</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li>
                    <span className="font-medium text-slate-700">Legacy (Pre-2025):</span> Retained old thresholds (Small ≤ ₦25m at 0%, Medium ₦25m-₦100m at 20%, Large &gt; ₦100m at 30%).
                  </li>
                  <li>
                    <span className="font-medium text-emerald-700">2025 Regime:</span> Updated CIT rates: Small companies (≤ ₦25m) remain exempt (0%), Medium companies (₦25m-₦100m) remain at 20%, and Large companies (&gt; ₦100m) are now taxed at a reduced rate of 25%.
                  </li>
                  <li>
                    <span className="text-amber-600 flex items-start gap-1 mt-1">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <em>Note: The 2025 Act also includes a fixed asset condition for small companies, which is noted in the legal basis but not yet implemented as an input parameter.</em>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Education Tax / Development Levy Section */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              3. Education Tax vs. Development Levy
            </h3>
            <div className="ml-10 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li>
                    <span className="font-medium text-slate-700">Legacy (Pre-2025):</span> Retained the 3% Education Tax for medium and large companies.
                  </li>
                  <li>
                    <span className="font-medium text-emerald-700">2025 Regime:</span> The 3% Education Tax has been replaced by a 4% Development Levy for companies with revenue &gt; ₦100m.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* VAT Section */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              4. Value Added Tax (VAT)
            </h3>
            <div className="ml-10 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li>
                    <span className="font-medium text-slate-700">Legacy (Pre-2025):</span> Maintained the 7.5% VAT rate.
                  </li>
                  <li>
                    <span className="font-medium text-emerald-700">2025 Regime:</span> Updated the VAT rate to 10% as per the new Act.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* WHT Section */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              5. Withholding Tax (WHT)
            </h3>
            <div className="ml-10 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">Rate Adjustments</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li>
                    <span className="font-medium text-slate-700">Legacy (Pre-2025):</span> Professional Services (10%), Rent (10%), Construction (5%), Consultancy (10%), Contracts (5%).
                  </li>
                  <li>
                    <span className="font-medium text-emerald-700">2025 Regime:</span> Reduced rates applied: Professional Services (5%), Consultancy (5%), Management fees (5%), Construction (2%). Rent (10%) remains unchanged.
                  </li>
                  <li>
                    <span className="text-amber-600 flex items-start gap-1 mt-1">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <em>Note: Recipient type variations (e.g., individual vs. corporate) are acknowledged in the API structure but await further detailed rate schedules for full implementation.</em>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* SME Estimator Section */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              6. SME Tax Estimator
            </h3>
            <div className="ml-10 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li>
                    <span className="font-medium text-slate-700">Legacy (Pre-2025):</span> Uses old bands (Small 0%, Medium 23% [20% CIT + 3% EDT], Large 33% [30% CIT + 3% EDT]).
                  </li>
                  <li>
                    <span className="font-medium text-emerald-700">2025 Regime:</span> Uses new bands (Small ≤ ₦25m at 0%, Medium ≤ ₦100m at 24% [20% CIT + 4% Dev Levy], Large &gt; ₦100m at 29% [25% CIT + 4% Dev Levy]).
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* General Updates */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 p-1.5 rounded-lg">
                <Info className="w-5 h-5" />
              </span>
              General System Updates
            </h3>
            <div className="ml-10 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <ul className="list-disc pl-5 space-y-2 text-sm text-blue-900">
                  <li><strong>Regime Selection:</strong> Added a toggle to all business tax calculators allowing users to choose between the "Legacy (Pre-2025)" and "Nigeria Tax Act 2025" regimes.</li>
                  <li><strong>Tax Basis Transparency:</strong> Every calculation now returns and displays a `taxBasis` string, explicitly stating the legal assumptions and rules applied to generate the result.</li>
                </ul>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
