import React from 'react';
import { ShieldAlert, ShieldCheck, Lock, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070a12] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-white">
              Brand<span className="gradient-text">Bridge</span> AI
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The next-generation enterprise SaaS platform connecting verified Amazon Wholesale Sellers directly with Amazon Brands while delivering continuous Agentic AI Brand Protection.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-cyan-400 bg-slate-900/80 border border-slate-800 p-2 rounded-lg w-fit">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit AES Amazon SP-API Encrypted</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-slate-200 uppercase tracking-wider mb-4">Platform Features</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:text-cyan-400 cursor-pointer">Agentic 24/7 ASIN Protection</li>
            <li className="hover:text-cyan-400 cursor-pointer">MAP Price Violation Scanner</li>
            <li className="hover:text-cyan-400 cursor-pointer">Listing Hijacker Detection</li>
            <li className="hover:text-cyan-400 cursor-pointer">Verified Seller Marketplace</li>
            <li className="hover:text-cyan-400 cursor-pointer">3PL Logistics & Prep Warehouse Network</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-slate-200 uppercase tracking-wider mb-4">User Solutions</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:text-cyan-400 cursor-pointer">Amazon Wholesale Sellers</li>
            <li className="hover:text-cyan-400 cursor-pointer">Amazon Brand Registry Owners</li>
            <li className="hover:text-cyan-400 cursor-pointer">Authorized Master Distributors</li>
            <li className="hover:text-cyan-400 cursor-pointer">Legal & Policy Counsel</li>
            <li className="hover:text-cyan-400 cursor-pointer">Enterprise API Integrations</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-slate-200 uppercase tracking-wider mb-4">Enterprise Compliance</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Fully compliant with Amazon Terms of Service, SP-API Data Protection policies, and Brand Registry guidelines.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SOC2 Type II Certified</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 BrandBridge AI Inc. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-400 cursor-pointer">Amazon SP-API Compliance</span>
          <span className="hover:text-slate-400 cursor-pointer">Security</span>
        </div>
      </div>
    </footer>
  );
};
