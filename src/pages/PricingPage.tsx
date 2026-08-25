import React from 'react';
import { CheckCircle2, Zap, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';

export const PricingPage: React.FC = () => {
  const { openStripeModal } = useData();

  return (
    <div className="space-y-12 pb-16">
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          STRIPE SUBSCRIPTION PLANS
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Transparent Enterprise <span className="gradient-text">Pricing</span>
        </h1>
        <p className="text-slate-300 text-sm">
          14-day free trial on all plans. Cancel anytime with 1 click. Fully integrated with Stripe checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Plan 1 */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-8 border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Seller Pro Plan</h3>
            <p className="text-xs text-slate-400">For Amazon Wholesale Sellers looking for direct brand dealflow.</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$199</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Unlimited Brand Marketplace Applications
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Direct Brand Deal Negotiations & Chat
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                3PL Warehouse Directory Access
              </li>
            </ul>
          </div>
          <button
            onClick={() => openStripeModal('Seller Pro ($199/mo)')}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
          >
            Start 14-Day Free Trial
          </button>
        </div>

        {/* Plan 2: Featured */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-8 border border-cyan-500/50 bg-slate-900/90 space-y-6 flex flex-col justify-between relative shadow-2xl cyan-glow">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider">
            Most Popular
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Brand Shield Pro</h3>
            <p className="text-xs text-slate-400">For Amazon Brand Registry owners requiring continuous 24/7 protection.</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$499</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                24/7 Agentic ASIN MAP Monitoring (Up to 100 ASINs)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Automated AI Cease & Desist Case Generator
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Seller Whitelist & Approval System
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Listing Hijacker & Counterfeit Detector
              </li>
            </ul>
          </div>
          <button
            onClick={() => openStripeModal('Brand Shield Pro ($499/mo)')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs cyan-glow shadow-lg transition-all"
          >
            Activate Brand Shield Pro
          </button>
        </div>

        {/* Plan 3 */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-8 border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Enterprise Brand Shield</h3>
            <p className="text-xs text-slate-400">Custom volume brand protection with dedicated legal counsel support.</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$1,499</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Unlimited ASIN Monitoring Across US/EU
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Dedicated IP & Brand Protection Attorney
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Custom Amazon SP-API Integration
              </li>
            </ul>
          </div>
          <button
            onClick={() => openStripeModal('Enterprise Brand Shield ($1,499/mo)')}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
          >
            Contact Enterprise Sales
          </button>
        </div>
      </div>
    </div>
  );
};
