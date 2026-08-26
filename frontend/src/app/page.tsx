'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  BarChart3, 
  Truck, 
  Layers,
  Sparkles,
  ExternalLink,
  UserCheck,
  Settings
} from 'lucide-react';
import { api, BackendHealthResponse, getCurrentUser, logout } from '../services/api';

export default function LandingPage() {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoadingHealth(true);
      const data = await api.getBackendHealth();
      setHealth(data);
    } catch (err) {
      console.warn('Backend probe offline:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500 selection:text-white font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Layers className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                DistributionBridge
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Enterprise v1.2
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/seller"
              className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Seller Dashboard
            </Link>
            <Link
              href="/brand"
              className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Brand Manager
            </Link>
            <Link
              href="/settings"
              className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <span className="text-xs text-slate-400 hidden md:inline">
                  {currentUser.email} ({currentUser.role})
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors hidden sm:inline-block border border-indigo-500/20"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 mb-6 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Edge Network & PostgreSQL Hyperdrive Connected
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise Infrastructure for{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                Amazon Wholesale & Capital Allocation
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 leading-relaxed">
              Unify Amazon SP-API synchronization, AI deal triage, multi-tenant PostgreSQL Row-Level Security, and 3PL logistics routing on Cloudflare edge.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/seller"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all"
              >
                <BarChart3 className="h-5 w-5" />
                Launch Seller Dashboard
              </Link>
              <Link
                href="/brand"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold flex items-center gap-2 transition-all"
              >
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Explore Sourcing Triage
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80 font-semibold flex items-center gap-2 transition-all"
              >
                <Lock className="h-5 w-5 text-emerald-400" />
                Investor Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostics Panel */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                Live Cloudflare Edge & Database Telemetry
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time status of worker engine microservices, PostgreSQL RLS sessions, and LWA integrations.
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {loadingHealth ? 'Probing...' : 'Refresh Status'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4">
              <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                <span>Worker Edge API</span>
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {health?.status === 'online' ? 'Online' : 'Operational'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                sales-backend.distributionbridge.com
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4">
              <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                <span>Database Isolation</span>
                <Database className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                RLS Active
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                PostgreSQL Hyperdrive Multi-Tenant
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4">
              <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                <span>Amazon SP-API Engine</span>
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                LWA OAuth2
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                HMAC State & Daily Cron (0 2 * * *)
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4">
              <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                <span>Session Security</span>
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                PBKDF2 SHA-256
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                24h Signed Bearer Tokens
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all group">
            <div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Wholesale Seller Intelligence</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Automated Amazon Selling Partner token refresh, monthly order metric ingestion, and granular ASIN sales performance analysis.
              </p>
            </div>
            <Link
              href="/seller"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Open Seller Workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all group">
            <div>
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Sourcing Deal Triage</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Batch ASIN deal profitability scoring (0–100), automated Minimum Advertised Price (MAP) breach detection, and BuyBox saturation audits.
              </p>
            </div>
            <Link
              href="/brand"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Open Sourcing Triage <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all group">
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Investor Capital & RLS Portal</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                PostgreSQL transaction-scoped tenant isolation. Zero cross-investor inventory or portfolio data leakage guaranteed by database policies.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Sign In to Investor Portal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} DistributionBridge Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Cloudflare Edge Operational
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              PostgreSQL RLS Enforced
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
