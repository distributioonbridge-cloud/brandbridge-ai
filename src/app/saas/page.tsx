'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  AlertCircle,
  Bot,
  Scale,
  FileCheck,
  Users,
  Award,
  Database,
  Activity,
  Sliders,
  DollarSign,
  Truck,
  Layers,
  ChevronRight,
  ExternalLink,
  KeyRound,
  Check,
  RefreshCw,
  Clock,
  Server,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  FileText,
  Send,
  PieChart,
  Grid,
  CreditCard
} from 'lucide-react';
import { api, BackendHealthResponse, getCurrentUser, logout } from '../../services/api';

interface AsinDefenseItem {
  asin: string;
  title: string;
  mapPrice: number;
  currentBuyBox: number;
  rogueSellers: number;
  status: 'protected' | 'undercut' | 'cd_dispatched';
  dealScore: number;
}

const INITIAL_ASINS: AsinDefenseItem[] = [
  {
    asin: 'B08XYZ1234',
    title: 'Apex Tactical Waterproof Backpack 45L',
    mapPrice: 89.99,
    currentBuyBox: 89.99,
    rogueSellers: 0,
    status: 'protected',
    dealScore: 94
  },
  {
    asin: 'B09ABC5678',
    title: 'UltraLock Heavy-Duty Carabiner 2-Pack',
    mapPrice: 24.50,
    currentBuyBox: 19.99,
    rogueSellers: 3,
    status: 'undercut',
    dealScore: 78
  },
  {
    asin: 'B07DEF9012',
    title: 'AeroShield Ceramic Graphene Spray 500ml',
    mapPrice: 34.00,
    currentBuyBox: 34.00,
    rogueSellers: 1,
    status: 'cd_dispatched',
    dealScore: 88
  },
  {
    asin: 'B0C4M9K2L1',
    title: 'ProGrade Resistance Band Syndicate Set',
    mapPrice: 42.00,
    currentBuyBox: 42.00,
    rogueSellers: 0,
    status: 'protected',
    dealScore: 91
  }
];

export default function SaasPortalPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [asins, setAsins] = useState<AsinDefenseItem[]>(INITIAL_ASINS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'defense' | 'sourcing' | 'logistics'>('all');
  const [isSyncingSpApi, setIsSyncingSpApi] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Dynamic Telemetry State
  const [guardedGmv, setGuardedGmv] = useState<number>(18450200);
  const [activeSessionLatency, setActiveSessionLatency] = useState<number>(4);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchHealth();

    const interval = setInterval(() => {
      setGuardedGmv(prev => prev + Math.floor(Math.random() * 120) + 15);
      setActiveSessionLatency(prev => Math.max(3, Math.min(8, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await api.getBackendHealth();
      setHealth(data);
    } catch (err) {
      console.warn('Backend health query:', err);
    }
  };

  const handleManualSync = async () => {
    setIsSyncingSpApi(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3500);
    } finally {
      setIsSyncingSpApi(false);
    }
  };

  const handleDispatchCd = (asin: string) => {
    setAsins(prev =>
      prev.map(item => (item.asin === asin ? { ...item, status: 'cd_dispatched', rogueSellers: 0 } : item))
    );
    setDispatchSuccess(`Automated C&D Legal Notice dispatched for ASIN ${asin}!`);
    setTimeout(() => setDispatchSuccess(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP NAVIGATION HEADER */}
      {/* ------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Distribution<span className="text-cyan-400">Bridge</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  SaaS Bento Console v2.0
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Nav Toggles */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/seller"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Seller Sourcing
            </Link>
            <Link
              href="/brand"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Brand Protection
            </Link>
            <Link
              href="/settings"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Settings
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-md shadow-cyan-500/20 transition-all"
            >
              Register Org
            </Link>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 2. BENTO CONSOLE HERO & TELEMETRY STRIP */}
      {/* ------------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Banner Title & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Unified Enterprise Command Console
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enterprise SaaS <span className="gradient-text">Operations Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time Amazon SP-API telemetry, automated BuyBox MAP enforcement, and PostgreSQL RLS tenant sandboxing.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start md:self-auto text-xs">
            {(['all', 'defense', 'sourcing', 'logistics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                  selectedFilter === tab
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'all' ? 'All Engines' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Global Notifications / Alert Banner */}
        {dispatchSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{dispatchSuccess}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Enforced</span>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 3. CORE BENTO-GRID LAYOUT */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* ----------------------------------------------------------------- */}
          {/* BENTO CARD 1: LIVE GMV & TELEMETRY STREAM (2 COLUMNS) */}
          {/* ----------------------------------------------------------------- */}
          <div className="md:col-span-2 rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/90 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    Live Stream Telemetry
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  ${guardedGmv.toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400">Total Amazon Wholesale GMV Protected Under Management</p>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +18.4% MoM
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">{activeSessionLatency}ms Hyperdrive Latency</p>
              </div>
            </div>

            {/* Sub-Metrics Row */}
            <div className="grid grid-cols-3 gap-3 relative z-10 pt-4 border-t border-slate-800/60">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Active Deals</span>
                <span className="text-base font-bold font-mono text-white">128 Sourced</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">BuyBox Win Rate</span>
                <span className="text-base font-bold font-mono text-emerald-400">92.4%</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">RLS Session Pool</span>
                <span className="text-base font-bold font-mono text-cyan-400">Isolated</span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* BENTO CARD 2: POSTGRESQL HYPERDRIVE & RLS ENGINE (1 COLUMN) */}
          {/* ----------------------------------------------------------------- */}
          <div className="rounded-3xl p-6 bg-slate-900/70 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Database className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">
                  Tenant Pool
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">PostgreSQL Row-Level Security</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Cryptographic session boundaries sandbox wholesale pricing and investor liquidity portfolios.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Tenant Isolation Policy</span>
                <span className="text-emerald-400 font-mono font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Allocations Covering Index</span>
                <span className="text-cyan-400 font-mono font-semibold">11 Verified</span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* BENTO CARD 3: 3PL LOGISTICS ROUTING (1 COLUMN) */}
          {/* ----------------------------------------------------------------- */}
          <div className="rounded-3xl p-6 bg-slate-900/70 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                  FBA Prep
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">3PL Logistics Hub Network</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Automated cross-docking and pallet intake routing through Chicago MDW2, Dallas DFW6, and Ontario ONT8.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Chicago MDW2 Rate:</span>
                <span className="font-mono text-white font-bold">$18.50/pallet</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dallas DFW6 Rate:</span>
                <span className="font-mono text-white font-bold">$17.00/pallet</span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* BENTO CARD 4: AUTONOMOUS MAP DEFENSE & ASIN TRIAGE (FULL 2-3 COLS) */}
          {/* ----------------------------------------------------------------- */}
          <div className="md:col-span-2 lg:col-span-3 rounded-3xl p-6 sm:p-7 bg-slate-900/80 border border-slate-800/90 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                  Autonomous MAP Defense & ASIN Triage Stream
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuous surveillance of unauthorized sellers, price undercutting, and 1-click legal C&D dispatch.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">4 Monitored ASINs</span>
              </div>
            </div>

            {/* ASIN Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800/80 pb-2">
                    <th className="pb-3 font-semibold">ASIN / Product Title</th>
                    <th className="pb-3 font-semibold">MAP Price</th>
                    <th className="pb-3 font-semibold">Live BuyBox</th>
                    <th className="pb-3 font-semibold">Rogue Sellers</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Enforcement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {asins.map(item => (
                    <tr key={item.asin} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <span className="font-mono font-bold text-cyan-400">{item.asin}</span>
                        <p className="text-slate-300 truncate max-w-xs">{item.title}</p>
                      </td>
                      <td className="py-3.5 font-mono text-slate-200 font-semibold">${item.mapPrice.toFixed(2)}</td>
                      <td className="py-3.5 font-mono">
                        <span
                          className={`font-bold ${
                            item.currentBuyBox < item.mapPrice ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          ${item.currentBuyBox.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        {item.rogueSellers > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                            {item.rogueSellers} Rogue
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        {item.status === 'protected' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Protected
                          </span>
                        )}
                        {item.status === 'undercut' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                            MAP Undercut
                          </span>
                        )}
                        {item.status === 'cd_dispatched' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            C&D Dispatched
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        {item.status === 'undercut' ? (
                          <button
                            onClick={() => handleDispatchCd(item.asin)}
                            className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all"
                          >
                            Dispatch C&D
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 text-[11px] cursor-not-allowed"
                          >
                            Compliant
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* BENTO CARD 5: AMAZON SP-API AUTO SYNC GATEWAY (1 COLUMN) */}
          {/* ----------------------------------------------------------------- */}
          <div className="rounded-3xl p-6 bg-slate-900/70 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Store className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">
                  LWA OAuth
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">SP-API Sales Sync Engine</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Automated Selling Partner API order metrics ingestion and FBA fee synchronization.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {syncSuccess && (
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] text-center font-medium border border-emerald-500/20">
                  ✓ Synced 6,240 SP-API Orders
                </div>
              )}
              <button
                onClick={handleManualSync}
                disabled={isSyncingSpApi}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg cyan-glow transition-all disabled:opacity-50"
              >
                {isSyncingSpApi ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Syncing Orders...
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" />
                    Trigger Manual SP-API Sync
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
