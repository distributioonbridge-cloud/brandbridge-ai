import React from 'react';
import { Sparkles, RefreshCw, ShieldAlert, Cpu, CheckCircle2, Radar } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AgenticScannerWidget: React.FC = () => {
  const { isScanning, runAiScanner, violations } = useData();

  return (
    <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 bg-slate-900/80 relative overflow-hidden shadow-2xl">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg cyan-glow">
            <Radar className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Agentic AI Brand Protection Engine</h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                24/7 Active Worker
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous ASIN scraper, MAP breach detection, and Buybox threat analyzer</p>
          </div>
        </div>

        <button
          onClick={runAiScanner}
          disabled={isScanning}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs cyan-glow transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              Scanning 42 ASINs across Amazon...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Trigger Live AI Scan Now
            </>
          )}
        </button>
      </div>

      {/* Autonomous Scanner Capabilities Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>ASIN Scan Speed</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-base font-bold text-white">1,420 ASINs/min</p>
          <span className="text-[10px] text-emerald-400">Real-time SP-API Sync</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>MAP Variance Precision</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-bold text-white">99.8% Accuracy</p>
          <span className="text-[10px] text-slate-400">Auto Currency Normalization</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Seller Risk Scoring</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-base font-bold text-white">3-Factor Fraud Algo</p>
          <span className="text-[10px] text-amber-400">IP & Feedback History</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Active Alerts</span>
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
          </div>
          <p className="text-base font-bold text-white">{violations.length} Detected Threats</p>
          <span className="text-[10px] text-red-400">Requires Brand Action</span>
        </div>
      </div>
    </div>
  );
};
