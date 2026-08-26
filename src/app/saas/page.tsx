'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Store,
  Building2,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Database,
  Activity,
  Truck,
  Layers,
  RefreshCw,
  Clock,
  Settings,
  CreditCard,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  LogOut,
  Send,
  Zap,
  HelpCircle,
  Menu,
  X,
  User,
  Sliders,
  DollarSign,
  FileCheck
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

type SidebarView = 'overview' | 'defense' | 'sourcing' | 'logistics' | 'integrations' | 'security' | 'billing';

export default function SaasPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [asins, setAsins] = useState<AsinDefenseItem[]>(INITIAL_ASINS);
  const [activeView, setActiveView] = useState<SidebarView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isSyncingSpApi, setIsSyncingSpApi] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [guardedGmv, setGuardedGmv] = useState<number>(18450200);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchHealth();

    const interval = setInterval(() => {
      setGuardedGmv(prev => prev + Math.floor(Math.random() * 120) + 15);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await api.getBackendHealth();
      setHealth(data);
    } catch (err) {
      console.warn('Backend health:', err);
    }
  };

  const handleManualSync = async () => {
    setIsSyncingSpApi(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
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

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex">
      {/* ------------------------------------------------------------------- */}
      {/* 1. ENTERPRISE RESPONSIVE SIDEBAR */}
      {/* ------------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Brand Header */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Distribution<span className="text-cyan-400">Bridge</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">Enterprise SaaS Console</span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'overview' as SidebarView, label: 'Command Center', icon: LayoutDashboard },
              { id: 'defense' as SidebarView, label: 'MAP Defense Stream', icon: ShieldCheck, route: '/brand' },
              { id: 'sourcing' as SidebarView, label: 'Wholesale Deal Triage', icon: TrendingUp, route: '/seller' },
              { id: 'logistics' as SidebarView, label: '3PL Logistics Hubs', icon: Truck, route: '/settings' },
              { id: 'integrations' as SidebarView, label: 'Amazon SP-API & LWA', icon: Store, route: '/settings' },
              { id: 'security' as SidebarView, label: 'PostgreSQL RLS Sandboxing', icon: Database, route: '/register' },
              { id: 'billing' as SidebarView, label: 'Subscription & Billing', icon: CreditCard, route: '/settings' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    if (item.route && item.id !== 'overview') {
                      router.push(item.route);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-slate-950" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left text-xs truncate max-w-[120px]">
                <p className="font-semibold text-white truncate">
                  {currentUser?.name || currentUser?.email || 'Admin User'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono capitalize">
                  {currentUser?.role || 'Administrator'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <Link
            href="/settings"
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-slate-400" />
            Account Settings
          </Link>
        </div>
      </aside>

      {/* ------------------------------------------------------------------- */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top App Header */}
        <header className="sticky top-0 z-40 h-16 backdrop-blur-xl bg-[#070b14]/85 border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              {activeView.toUpperCase()} MODE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hyperdrive: 4ms Latency</span>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Exit to Landing
            </Link>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="p-4 sm:p-8 space-y-8 flex-1">
          {dispatchSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>{dispatchSuccess}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Enforced</span>
            </div>
          )}

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Card 1: GMV */}
            <div className="md:col-span-2 rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/90 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
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
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +18.4% MoM
                </span>
              </div>

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

            {/* Card 2: RLS */}
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

            {/* Card 3: 3PL */}
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

            {/* Card 4: ASIN Defense Stream */}
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
                <span className="text-xs text-slate-400 font-mono">4 Monitored ASINs</span>
              </div>

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

            {/* Card 5: SP-API */}
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
    </div>
  );
}
