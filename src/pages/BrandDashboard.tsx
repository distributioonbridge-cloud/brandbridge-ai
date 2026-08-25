import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Users,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AgenticScannerWidget } from '../components/ai/AgenticScannerWidget';

interface BrandDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { products, violations, applications, openLegalCaseModal, updateApplicationStatus } = useData();

  const pendingApps = applications.filter(a => a.status === 'Pending');

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Brand Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              AMAZON BRAND REGISTRY ENROLLED
            </span>
            <span className="text-xs text-slate-400">Brand ID: BRD-440912</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Brand Protection Control Panel — <span className="gradient-text">{user?.companyName || 'ApexGear Tech'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous Agentic AI ASIN Guardian & MAP Enforcement Operations
          </p>
        </div>

        <button
          onClick={() => setActiveTab('brand-protection')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg cyan-glow transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Full AI Protection Console
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Protected ASINs</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">42 ASINs</h3>
            <p className="text-xs text-emerald-400 mt-1">100% Monitored 24/7</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Brand Health Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">98 / 100</h3>
            <p className="text-xs text-emerald-400 mt-1">Optimal Buybox Integrity</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Violations</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">{violations.length} MAP Breaches</h3>
            <p className="text-xs text-amber-400 mt-1">Action Required</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verified Sellers</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">8 Authorized</h3>
            <p className="text-xs text-slate-400 mt-1">{pendingApps.length} Pending Approval</p>
          </div>
        </div>
      </div>

      {/* Agentic Scanner Widget */}
      <AgenticScannerWidget />

      {/* Main Section: Live MAP Violations Feed & Seller Whitelist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Violations Table */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Detected MAP Violations & Hijacker Threat Feed
              </h3>
              <p className="text-xs text-slate-400">Agentic AI scan output from Amazon SP-API</p>
            </div>
            <button
              onClick={() => setActiveTab('brand-protection')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All Violations →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">ASIN / Product</th>
                  <th className="py-3 px-3">Violator Seller</th>
                  <th className="py-3 px-3">MAP vs Price</th>
                  <th className="py-3 px-3">Risk Score</th>
                  <th className="py-3 px-3 text-right">Legal Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {violations.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-cyan-400 font-bold block">{v.asin}</span>
                      <span className="text-[11px] text-slate-300 truncate max-w-[180px] block">{v.productTitle}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">{v.violatorSellerName}</span>
                      <span className="font-mono text-[10px] text-slate-500">ID: {v.violatorSellerId}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-red-400 font-bold block">${v.violatingPrice.toFixed(2)}</span>
                      <span className="text-slate-500 text-[10px]">MAP: ${v.mapPrice.toFixed(2)}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        {v.riskScore}/100 Risk
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => openLegalCaseModal(v)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Generate C&D
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Seller Approval Requests */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Wholesale Seller Applications
            </h3>
            <p className="text-xs text-slate-400">Approve or reject wholesale sellers for FBA distribution</p>
          </div>

          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{app.sellerName}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-slate-400">Order Promise: <strong className="text-slate-200">{app.monthlyOrderPromise}</strong></p>
                <p className="text-slate-500 text-[11px]">{app.notes}</p>

                {app.status === 'Pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => updateApplicationStatus(app.id, 'Approved')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                    >
                      Approve Whitelist
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(app.id, 'Declined')}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
