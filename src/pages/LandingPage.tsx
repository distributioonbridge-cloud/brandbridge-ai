import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Database,
  Activity,
  DollarSign,
  Truck,
  Layers,
  ChevronRight,
  KeyRound,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface Point3D {
  x: number;
  y: number;
  z: number;
  originX: number;
  originY: number;
  originZ: number;
  color: string;
  size: number;
  pulsePhase: number;
}

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { switchRole } = useAuth();
  const { openStripeModal } = useData();

  // Dynamic live state counters
  const [tickerCount, setTickerCount] = useState<number>(14820);

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

  // 1. HTML5 Canvas Perspective Projection Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 600;
    };
    window.addEventListener('resize', handleResize);

    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.25;
    let targetRotY = 0;
    let currentRotX = 0.25;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      mouseX = x / (width / 2);
      mouseY = y / (height / 2);
      targetRotY = mouseX * 0.35;
      targetRotX = 0.25 + mouseY * 0.2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const gridSize = 14;
    const spacing = 75;
    const points: Point3D[] = [];

    for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
      for (let j = -gridSize / 2; j <= gridSize / 2; j++) {
        const x = i * spacing;
        const z = j * spacing;
        const y = Math.sin(Math.sqrt(i * i + j * j) * 0.5) * 25;
        const isDefenseNode = (i + j) % 4 === 0;
        points.push({
          x,
          y,
          z,
          originX: x,
          originY: y,
          originZ: z,
          color: isDefenseNode ? '#06b6d4' : '#3b82f6',
          size: isDefenseNode ? 2.5 : 1.5,
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
    }

    const fov = 450;
    let time = 0;

    const render = () => {
      time += 0.015;
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 50;

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);

      ctx.lineWidth = 0.75;
      const projectedPoints: { sx: number; sy: number; scale: number; p: Point3D }[] = [];

      for (let idx = 0; idx < points.length; idx++) {
        const p = points[idx];
        const dist = Math.sqrt(p.originX * p.originX + p.originZ * p.originZ);
        const dynamicY = p.originY + Math.sin(dist * 0.03 - time * 2) * 20;

        const x1 = p.originX * cosY - p.originZ * sinY;
        const z1 = p.originX * sinY + p.originZ * cosY;
        const y2 = dynamicY * cosX - z1 * sinX;
        const z2 = dynamicY * sinX + z1 * cosX + 600;

        if (z2 > 10) {
          const scale = fov / z2;
          const sx = cx + x1 * scale;
          const sy = cy + y2 * scale;
          projectedPoints.push({ sx, sy, scale, p });
        }
      }

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.beginPath();
      const stride = gridSize + 1;

      for (let i = 0; i <= gridSize; i++) {
        for (let j = 0; j <= gridSize; j++) {
          const currIdx = i * stride + j;
          if (currIdx >= projectedPoints.length) continue;
          const curr = projectedPoints[currIdx];

          if (j < gridSize && currIdx + 1 < projectedPoints.length) {
            const nextH = projectedPoints[currIdx + 1];
            ctx.moveTo(curr.sx, curr.sy);
            ctx.lineTo(nextH.sx, nextH.sy);
          }
          if (i < gridSize && currIdx + stride < projectedPoints.length) {
            const nextV = projectedPoints[currIdx + stride];
            ctx.moveTo(curr.sx, curr.sy);
            ctx.lineTo(nextV.sx, nextV.sy);
          }
        }
      }
      ctx.stroke();

      for (let i = 0; i < projectedPoints.length; i++) {
        const { sx, sy, scale, p } = projectedPoints[i];
        const pulse = (Math.sin(time * 3 + p.pulsePhase) + 1) * 0.5;
        const radius = Math.max(1, p.size * scale * (0.8 + pulse * 0.4));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, Math.max(0.1, scale * 1.2));
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.size > 2) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 2.2 * pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Telemetry Strip */}
      <div className="glass-panel rounded-2xl py-2.5 px-4 sm:px-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">Worker Matrix Engine:</span>
            <span className="font-semibold text-white">Online (v4.0 Matrix Loop)</span>
          </div>

          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">PostgreSQL RLS:</span>
            <span className="font-mono text-cyan-400 font-semibold">Active & Sandboxed</span>
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

      {/* Hero Section with Canvas */}
      <section className="relative pt-6 sm:pt-12 pb-10 overflow-hidden text-center space-y-8">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

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
            <button
              onClick={() => setActiveTab('saas')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500 text-cyan-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              SaaS Bento Console
            </button>
          </div>
        </div>
      </section>

      {/* Simulators */}
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
          {/* Simulator 1 */}
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

          {/* Simulator 2 */}
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
    </div>
  );
};

export default LandingPage;
