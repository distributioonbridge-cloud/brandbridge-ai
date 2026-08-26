import React, { useState, useEffect, useMemo } from 'react';
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
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  const { user, switchRole, isAuthenticated } = useAuth();
  const { openStripeModal } = useData();

  // Dynamic live state counters
  const [tickerCount, setTickerCount] = useState<number>(14820);
  const [activeTabFeature, setActiveTabFeature] = useState<'sourcing' | 'map' | 'logistics' | 'rls'>('sourcing');

  // Simulator 1: Wholesale Yield State
  const [capitalAllocation, setCapitalAllocation] = useState<number>(100000);
  const [targetMargin, setTargetMargin] = useState<number>(32);
  const [inventoryTurnDays, setInventoryTurnDays] = useState<number>(45);
  const [averageSellingPrice, setAverageSellingPrice] = useState<number>(48);

  // Simulator 2: MAP Protection ROI State
  const [catalogAsinCount, setCatalogAsinCount] = useState<number>(45);
  const [unauthorizedSellers, setUnauthorizedSellers] = useState<number>(6);
  const [averagePriceErosion, setAveragePriceErosion] = useState<number>(14);
  const [monthlyUnitsPerAsin, setMonthlyUnitsPerAsin] = useState<number>(350);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Memoized Math Calculations for Simulator 1
  const yieldMetrics = useMemo(() => {
    const unitCost = averageSellingPrice * (1 - targetMargin / 100);
    const unitsProcured = Math.max(1, Math.floor(capitalAllocation / Math.max(1, unitCost)));
    const grossRevenue = unitsProcured * averageSellingPrice;
    const grossProfit = grossRevenue - capitalAllocation;
    const fbaFeePerUnit = averageSellingPrice * 0.15 + 4.25;
    const totalFbaFees = unitsProcured * fbaFeePerUnit;
    const netProfitPerCycle = Math.max(0, grossProfit - totalFbaFees);
    const annualCycles = 365 / Math.max(1, inventoryTurnDays);
    const annualizedProfit = netProfitPerCycle * annualCycles;
    const annualizedYieldPercent = (annualizedProfit / Math.max(1, capitalAllocation)) * 100;
    const dealScore = Math.min(
      99,
      Math.max(40, Math.round(targetMargin * 1.6 + annualCycles * 2.8 + (averageSellingPrice > 35 ? 10 : 4)))
    );

    return {
      unitCost,
      unitsProcured,
      grossRevenue,
      grossProfit,
      totalFbaFees,
      netProfitPerCycle,
      annualCycles: annualCycles.toFixed(1),
      annualizedProfit,
      annualizedYieldPercent: annualizedYieldPercent.toFixed(1),
      dealScore
    };
  }, [capitalAllocation, targetMargin, inventoryTurnDays, averageSellingPrice]);

  // Memoized Math Calculations for Simulator 2
  const protectionMetrics = useMemo(() => {
    const totalMonthlyVolume = catalogAsinCount * monthlyUnitsPerAsin;
    const monthlyErosionLoss = totalMonthlyVolume * averagePriceErosion * 0.35;
    const recoveredRevenueMonthly = monthlyErosionLoss * 0.88;
    const recoveredAnnualized = recoveredRevenueMonthly * 12;
    const buyBoxUpliftPercent = Math.min(46, Math.round(unauthorizedSellers * 3.8 + 14));
    const automatedCdNoticesMonthly = catalogAsinCount * unauthorizedSellers * 2;

    return {
      totalMonthlyVolume,
      monthlyErosionLoss,
      recoveredRevenueMonthly,
      recoveredAnnualized,
      buyBoxUpliftPercent,
      automatedCdNoticesMonthly
    };
  }, [catalogAsinCount, unauthorizedSellers, averagePriceErosion, monthlyUnitsPerAsin]);

  return (
    <div className="space-y-16 pb-20">
      {/* ------------------------------------------------------------------- */}
      {/* 1. LIVE TELEMETRY & STATUS STRIP */}
      {/* ------------------------------------------------------------------- */}
      <div className="glass-panel rounded-2xl py-2.5 px-4 sm:px-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">Microservice Engine:</span>
            <span className="font-semibold text-white">Online (v3.5 Cloudflare Worker)</span>
          </div>

          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">PostgreSQL RLS:</span>
            <span className="font-mono text-cyan-400 font-semibold">Active & Sandboxed</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Amazon SP-API Gateway:</span>
            <span className="text-slate-200 font-medium">LWA Ready</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Guarded ASINs:</span>
          <span className="text-white font-bold">{tickerCount.toLocaleString()}</span>
          <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-sans">
            100% MAP Guarded
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. HERO FUNNEL SECTION */}
      {/* ------------------------------------------------------------------- */}
      <section className="relative pt-6 sm:pt-12 pb-10 overflow-hidden text-center space-y-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-cyan-500/30 text-xs font-semibold text-cyan-400 cyan-glow">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Autonomous Amazon Wholesale Sourcing & MAP Brand Defense</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Bridge the Gap Between <br className="hidden sm:inline" />
            <span className="gradient-text">Amazon Brands</span> & Wholesale Sellers.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-300 leading-relaxed font-light">
            Register your organization, connect your Amazon Selling Partner API tokens, and unlock full access to
            automated deal triage, 3PL logistics routing, and 24/7 MAP defense.
          </p>

          {/* 4-Step Access Funnel Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-xl cyan-glow transition-all flex items-center justify-center gap-2 group"
            >
              <KeyRound className="w-5 h-5 text-slate-950" />
              1. Register Organization & Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel glass-panel-hover border border-slate-700 text-slate-200 font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5 text-emerald-400" />
              2. Connect Amazon SP-API & Unlock Access
            </button>
          </div>

          {/* 4-Step Visual Progress Funnel */}
          <div className="max-w-3xl mx-auto pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {[
                { step: 'Step 1', title: 'Explore & Model', desc: 'Simulate ROI & Yields' },
                { step: 'Step 2', title: 'Register / Sign In', desc: 'Enterprise Credentials' },
                { step: 'Step 3', title: 'Integration', desc: 'Link SP-API / LWA' },
                { step: 'Step 4', title: 'Full Access', desc: 'Unlocked Workspace' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveTab(idx === 0 ? 'landing' : 'register')}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all"
                >
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{item.step}</span>
                  <p className="text-xs font-bold text-white mt-0.5">{item.title}</p>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 3. INTERACTIVE SLIDER MATH SIMULATORS */}
      {/* ------------------------------------------------------------------- */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            INTERACTIVE MATH & ROI SIMULATORS
          </span>
          <h2 className="text-3xl font-bold text-white">
            Simulate Wholesale Yields & Revenue Recovery
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Adjust variables in real-time to model capital returns, Amazon FBA fee deductions, and BuyBox price stabilization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SIMULATOR 1: Wholesale Capital & Margin Yield */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 bg-slate-900/80 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Wholesale Capital Yield Simulator</h3>
                  <p className="text-slate-400 text-xs">For Sellers & Capital Syndicates</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Deal Score: {yieldMetrics.dealScore}/100
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Deployed Wholesale Capital:</span>
                  <span className="text-white font-mono font-bold">${capitalAllocation.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="5000"
                  value={capitalAllocation}
                  onChange={e => setCapitalAllocation(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Target Wholesale Gross Margin:</span>
                  <span className="text-emerald-400 font-mono font-bold">{targetMargin}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="1"
                  value={targetMargin}
                  onChange={e => setTargetMargin(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Inventory Turn:</span>
                    <span className="text-white font-mono font-bold">{inventoryTurnDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={inventoryTurnDays}
                    onChange={e => setInventoryTurnDays(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Average ASP:</span>
                    <span className="text-white font-mono font-bold">${averageSellingPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    step="2"
                    value={averageSellingPrice}
                    onChange={e => setAverageSellingPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Computed Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Units / Batch</span>
                <span className="text-sm font-bold font-mono text-white">{yieldMetrics.unitsProcured.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Net Profit / Cycle</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  +${Math.round(yieldMetrics.netProfitPerCycle).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Annualized APY</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {yieldMetrics.annualizedYieldPercent}%
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                switchRole('Seller');
                setActiveTab('seller-dashboard');
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              Access Seller Dashboard & Deploy Capital
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* SIMULATOR 2: Brand Protection & MAP Recovery */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 bg-slate-900/80 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">MAP Protection & Recovery Calculator</h3>
                  <p className="text-slate-400 text-xs">For Brand Registry Owners</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                +{protectionMetrics.buyBoxUpliftPercent}% BuyBox Win
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Guarded ASINs:</span>
                    <span className="text-white font-mono font-bold">{catalogAsinCount}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={catalogAsinCount}
                    onChange={e => setCatalogAsinCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Rogue Sellers / ASIN:</span>
                    <span className="text-cyan-400 font-mono font-bold">{unauthorizedSellers}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={unauthorizedSellers}
                    onChange={e => setUnauthorizedSellers(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Average Price Undercut / Unit:</span>
                  <span className="text-red-400 font-mono font-bold">-${averagePriceErosion}.00</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="35"
                  step="1"
                  value={averagePriceErosion}
                  onChange={e => setAveragePriceErosion(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Monthly Volume per ASIN:</span>
                  <span className="text-white font-mono font-bold">{monthlyUnitsPerAsin} Units</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={monthlyUnitsPerAsin}
                  onChange={e => setMonthlyUnitsPerAsin(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Computed Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Recovered / Mo</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  +${Math.round(protectionMetrics.recoveredRevenueMonthly).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Recovered / Yr</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  +${Math.round(protectionMetrics.recoveredAnnualized).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Automated C&Ds</span>
                <span className="text-sm font-bold font-mono text-white">
                  {protectionMetrics.automatedCdNoticesMonthly} / mo
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                switchRole('Brand');
                setActiveTab('brand-dashboard');
              }}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg cyan-glow transition-all"
            >
              Access Brand Defense Suite
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 4. CORE PLATFORM PILLARS (DEEP DIVE) */}
      {/* ------------------------------------------------------------------- */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Built for High-Velocity Amazon Commerce</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Explore native engines engineered for wholesale deal scoring, 3PL logistics, and database sandboxing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Store className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Sourcing Triage Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates wholesale product manifests against live Amazon SP-API BuyBox price histories,
              calculating deal scores, net ROI, and FBA fee deductions in seconds.
            </p>
            <button
              onClick={() => {
                switchRole('Seller');
                setActiveTab('seller-dashboard');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold hover:underline"
            >
              Explore Seller Tools <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">3PL Logistics & FBA Prep</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connects directly to certified 3PL hubs across Chicago (MDW2), Dallas (DFW6), and California (ONT8)
              for automated pallet receiving, polybagging, and Amazon FC routing.
            </p>
            <button
              onClick={() => setActiveTab('warehouses')}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold hover:underline"
            >
              View 3PL Hubs <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">PostgreSQL Row-Level Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ensures 100% cryptographic isolation between seller catalogs, investor allocation portfolios, and
              proprietary pricing models via Hyperdrive pooled connections.
            </p>
            <button
              onClick={() => setActiveTab('register')}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold hover:underline"
            >
              Register & Sandboxing <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
