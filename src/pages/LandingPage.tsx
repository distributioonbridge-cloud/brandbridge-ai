import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  Store,
  Building2,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bot,
  Scale,
  FileCheck,
  Users,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  const { switchRole } = useAuth();
  const { openStripeModal } = useData();

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Glowing aura blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-cyan-500/30 text-xs font-semibold text-cyan-400 cyan-glow animate-pulse-subtle">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Agentic AI Brand Protection & Amazon Wholesale Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Bridge the Gap Between <br className="hidden sm:inline" />
            <span className="gradient-text">Amazon Brands</span> & Wholesale Sellers.
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-light">
            Distribution Bridge AI protects Amazon Brand Registry assets with continuous 24/7 Agentic MAP monitoring while directly connecting verified wholesale distributors to exclusive brand partnerships.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                switchRole('Brand');
                setActiveTab('brand-dashboard');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base cyan-glow transition-all shadow-xl flex items-center justify-center gap-2 group"
            >
              <ShieldCheck className="w-5 h-5" />
              Launch Brand Protection Console
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                switchRole('Seller');
                setActiveTab('marketplace');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel glass-panel-hover border border-slate-700 text-slate-200 font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5 text-emerald-400" />
              Explore Seller Wholesale Marketplace
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>256-Bit Amazon SP-API Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Automated C&D Legal Cases</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Over $180M Wholesale Volume Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Enterprise <span className="gradient-text">Brands & Sellers</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Dual-purpose platform architecture providing end-to-end brand protection and direct wholesale dealflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Agentic AI Protection */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-8 border border-slate-800 space-y-5 relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Agentic 24/7 AI ASIN Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous background agents continuously monitor buybox prices, detect MAP undercutting, identify listing hijackers, and instantly trigger legal alerts.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                MAP Breach Detection Engine
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Seller Risk Scorecard (0-100)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Automated Amazon IP Case Generator
              </li>
            </ul>
          </div>

          {/* Card 2: Wholesale Brand Marketplace */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-8 border border-slate-800 space-y-5 relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Verified Brand Marketplace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Wholesale sellers apply directly to authorized brands for exclusive distribution deals, bypassing middleman distributors and securing high margins.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                1-Click Partnership Applications
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Seller Whitelist & Approval System
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Direct Brand Deal Requests & Chat
              </li>
            </ul>
          </div>

          {/* Card 3: 3PL Warehouse & Logistics Support */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-8 border border-slate-800 space-y-5 relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">3PL Warehouse & Distributor Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated prep & ship warehouse directory across major US logistics hubs with FBA prep capabilities and real-time inventory management.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Verified FBA Prep & Ship Partners
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Real-time Stockout & Margin Tracker
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Authorized Master Distributors
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Live Agentic AI Simulator Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold">
                <Scale className="w-3.5 h-3.5" />
                Automated Legal Enforcement
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Generate Amazon Legal C&D Cases in <span className="gradient-text">60 Seconds</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                When an unauthorized seller drops prices below MAP or hijacks your buybox, Distribution Bridge AI's agentic model compiles the evidence and drafts formal Amazon Brand Registry complaints automatically.
              </p>
              <button
                onClick={() => {
                  switchRole('Brand');
                  setActiveTab('brand-protection');
                }}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg cyan-glow transition-all"
              >
                Test AI Legal Notice Generator
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-inner space-y-4 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4" /> AI CASE ENGINE ACTIVE
                </span>
                <span className="text-slate-500">ASIN B08N5WRWNW</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <p><span className="text-slate-500">Violator:</span> DiscountDealsDirect_Store (ID: A3V9K2L1M8P)</p>
                <p><span className="text-slate-500">MAP Target:</span> $249.99 | <span className="text-red-400 font-bold">Current Offer: $224.50 (-$25.49)</span></p>
                <p><span className="text-slate-500">Risk Score:</span> 89/100 (High Risk - Unflagged Wholesale Distributor)</p>
              </div>
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-cyan-300 text-[10px]">
                ✓ Cease & Desist legal notice compiled. Transmitted via Amazon SP-API IP Infringement endpoint.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
