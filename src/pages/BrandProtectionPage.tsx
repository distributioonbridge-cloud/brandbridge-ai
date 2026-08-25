import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Radar,
  FileText,
  AlertTriangle,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { AgenticScannerWidget } from '../components/ai/AgenticScannerWidget';

export const BrandProtectionPage: React.FC = () => {
  const { products, violations, openLegalCaseModal } = useData();
  const [filter, setFilter] = useState<'All' | 'MAP Violation' | 'Hijacked' | 'Clean'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesFilter = filter === 'All' || p.status === filter;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.asin.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              AGENTIC AI SUITE
            </span>
            <span className="text-xs text-slate-400">Continuous 24/7 Scanning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Brand Protection & Enforcement Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Buybox inspection, MAP price floor compliance, listing hijacker alerts, and automated C&D legal notice generation.
          </p>
        </div>

        <button
          onClick={() => {
            if (violations[0]) openLegalCaseModal(violations[0]);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs shadow-lg cyan-glow transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Draft AI Legal Case Notice
        </button>
      </div>

      {/* Agentic Scanner Card */}
      <AgenticScannerWidget />

      {/* Product ASIN Scanner Table with Filter & Search */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search ASIN or product title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-9"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-slate-400 font-medium">Filter Status:</span>
            {(['All', 'MAP Violation', 'Hijacked', 'Clean'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === status
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ASIN Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">ASIN & Image</th>
                <th className="py-3.5 px-4">Product Title</th>
                <th className="py-3.5 px-4">MAP Target</th>
                <th className="py-3.5 px-4">Current Buybox</th>
                <th className="py-3.5 px-4">Buybox Winner</th>
                <th className="py-3.5 px-4">Threat Level</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                      <span className="font-mono text-cyan-400 font-bold">{p.asin}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-[220px]">
                    <span className="font-semibold text-white block truncate">{p.title}</span>
                    <span className="text-[10px] text-slate-500">Last Scanned: {p.lastScanned}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">${p.mapPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`font-bold ${p.currentBuyBoxPrice < p.mapPrice ? 'text-red-400' : 'text-emerald-400'}`}>
                      ${p.currentBuyBoxPrice.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">{p.buyBoxWinner}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'Clean'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'MAP Violation'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                      }`}
                    >
                      {p.status} ({p.riskScore}/100 Risk)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.status !== 'Clean' ? (
                      <button
                        onClick={() => {
                          const v = violations.find(v => v.asin === p.asin) || violations[0];
                          openLegalCaseModal(v);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-[11px] shadow-sm ml-auto"
                      >
                        Enforce C&D
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center justify-end gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fully Compliant
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
