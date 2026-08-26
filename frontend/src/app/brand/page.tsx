'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  api, 
  SourcingTriageResult, 
  BackendHealthResponse 
} from '@/services/api';
import {
  ShieldCheck,
  ShieldAlert,
  UploadCloud,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Layers,
  Activity,
  Database,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export default function BrandManagerPage() {
  const [triagedDeals, setTriagedDeals] = useState<SourcingTriageResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [filter, setFilter] = useState<'All' | 'APPROVE_FOR_WHOLESALE' | 'REQUIRES_FURTHER_AUDIT' | 'REJECT_HIGH_RISK'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDeal, setSelectedDeal] = useState<SourcingTriageResult | null>(null);
  const [csvInput, setCsvInput] = useState<string>('');
  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Initial deal list to demonstrate real-time triage
  const initialBatch = [
    {
      asin: 'B08XYZ1234',
      title: 'ApexGear Tactical Ultra-Light Backpack',
      costPrice: 28.50,
      retailPrice: 79.99,
      mapPrice: 79.99,
      fbaFeeEstimate: 7.20,
      fbaCompetitors: 2,
      isAmazonSelling: false,
    },
    {
      asin: 'B09ABC5678',
      title: 'Precision CNC Machined Carbon Carabiner 2-Pack',
      costPrice: 12.00,
      retailPrice: 29.99,
      mapPrice: 29.99,
      fbaFeeEstimate: 4.80,
      fbaCompetitors: 4,
      isAmazonSelling: false,
    },
    {
      asin: 'B07DEF9012',
      title: 'HydroShield Nano Waterproofing Sealant 500ml',
      costPrice: 19.50,
      retailPrice: 22.00,
      mapPrice: 29.99,
      fbaFeeEstimate: 5.50,
      fbaCompetitors: 11,
      isAmazonSelling: true,
    },
    {
      asin: 'B01M4K8L99',
      title: 'ApexGear Mag-Lock Hydration Bladder 2.5L',
      costPrice: 16.00,
      retailPrice: 42.50,
      mapPrice: 42.50,
      fbaFeeEstimate: 5.90,
      fbaCompetitors: 3,
      isAmazonSelling: false,
    }
  ];

  // Fetch health and initial triage
  const runInitialTriage = useCallback(async () => {
    setLoading(true);
    try {
      const healthData = await api.getBackendHealth();
      setHealth(healthData);

      // Evaluate initial batch via Cloudflare Worker /api/sourcing/triage
      const results: SourcingTriageResult[] = [];
      for (const item of initialBatch) {
        const res = await api.evaluateSourcingDeal(item);
        if (res.success && res.triage) {
          results.push(res.triage);
        }
      }
      setTriagedDeals(results);
      if (results.length > 0) {
        setSelectedDeal(results[0]);
      }
    } catch (err: any) {
      console.error('Initial triage evaluation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runInitialTriage();
  }, [runInitialTriage]);

  // Upload & Evaluate custom ASIN list
  async function handleProcessUploadedList() {
    if (!csvInput.trim()) {
      setNotification({ type: 'error', text: 'Please paste or enter ASIN records to triage.' });
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      const lines = csvInput.trim().split('\n');
      const newTriaged: SourcingTriageResult[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.toLowerCase().startsWith('asin')) continue;

        const parts = trimmed.split(',').map((p) => p.trim());
        const asin = parts[0] || `ASIN_${Date.now()}`;
        const title = parts[1] || 'Imported Wholesale SKU';
        const costPrice = parseFloat(parts[2]) || 20.00;
        const retailPrice = parseFloat(parts[3]) || 49.99;
        const mapPrice = parseFloat(parts[4]) || retailPrice;
        const fbaCompetitors = parseInt(parts[5], 10) || 3;

        const res = await api.evaluateSourcingDeal({
          asin,
          title,
          costPrice,
          retailPrice,
          mapPrice,
          fbaCompetitors,
          isAmazonSelling: false,
        });

        if (res.success && res.triage) {
          newTriaged.push(res.triage);
        }
      }

      setTriagedDeals((prev) => [...newTriaged, ...prev]);
      if (newTriaged.length > 0) {
        setSelectedDeal(newTriaged[0]);
      }
      setNotification({ type: 'success', text: `Successfully triaged ${newTriaged.length} ASINs with real-time margins.` });
      setCsvInput('');
      setShowUploader(false);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to process uploaded list.' });
    } finally {
      setLoading(false);
    }
  }

  // Filtered Deal Records
  const filteredDeals = triagedDeals.filter((deal) => {
    const matchesFilter = filter === 'All' || deal.verdict === filter;
    const matchesSearch =
      (deal.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.asin.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Aggregates
  const approvedCount = triagedDeals.filter((d) => d.verdict === 'APPROVE_FOR_WHOLESALE').length;
  const highRiskCount = triagedDeals.filter((d) => d.verdict === 'REJECT_HIGH_RISK').length;
  const avgMargin =
    triagedDeals.length > 0
      ? (triagedDeals.reduce((sum, d) => sum + d.financials.netMarginPercent, 0) / triagedDeals.length).toFixed(1)
      : '0.0';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Brand Registry Banner */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              AMAZON BRAND REGISTRY AUTHORIZED
            </span>
            <span className="text-xs text-slate-400">Brand ID: BRD-440912</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Brand Protection & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Wholesale Sourcing Triage</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time ASIN deal evaluation, MAP enforcement compliance, and wholesale distributor list ingestion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            {showUploader ? 'Close Ingest' : 'Upload ASIN List'}
          </button>

          <button
            onClick={() => api.redirectToAmazonOAuth({ userId: 'brand_manager', redirectBack: '/brand', mode: 'spapi' })}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg cyan-glow transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Connect Brand Store
          </button>
        </div>
      </header>

      {/* Edge Backend & Diagnostics Header */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Triage Engine</span>
            <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live (/api/sourcing/triage)
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PostgreSQL Persistence</span>
            <p className="text-sm font-bold text-white capitalize mt-0.5">
              {health?.database?.status === 'connected' ? 'Connected (Hyperdrive)' : 'Active (Ready)'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Automated MAP Guard</span>
              <p className="text-sm font-bold text-white mt-0.5">24/7 Scanning Active</p>
            </div>
          </div>
          <button
            onClick={runInitialTriage}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Re-run Triage Evaluation"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </section>

      {/* CSV / List Upload Modal Area */}
      {showUploader && (
        <section className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Batch ASIN Wholesale List Ingestion</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Format: ASIN, Title, Cost, Retail, MAP, Competitors</span>
          </div>

          <textarea
            rows={4}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder={`B08PROFIT99, Pro Trail Running Poles, 24.00, 69.99, 69.99, 2\nB09LOWMARG01, Generic Hydration Flask, 15.00, 18.99, 24.99, 8`}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowUploader(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessUploadedList}
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? 'Evaluating Deals...' : 'Run Real-Time Triage'}
            </button>
          </div>
        </section>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm border ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Triaged Deals</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">{triagedDeals.length} SKUs</h3>
            <p className="text-xs text-cyan-400 mt-1">Live Backend Evaluation</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Approved for Wholesale</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">{approvedCount} Approved</h3>
            <p className="text-xs text-emerald-400 mt-1">High ROI & MAP Compliant</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Average Net Margin</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">{avgMargin}%</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-teal-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Above 20% Baseline</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">MAP Violations / Risk</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">{highRiskCount} Flagged</h3>
            <p className="text-xs text-rose-400 mt-1">Price Undercut Detected</p>
          </div>
        </div>
      </section>

      {/* Main Content Layout: Triaged ASIN Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Deal Table */}
        <section className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search ASIN or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-9"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-500 text-[11px] font-medium mr-1">Verdict:</span>
              {(['All', 'APPROVE_FOR_WHOLESALE', 'REQUIRES_FURTHER_AUDIT', 'REJECT_HIGH_RISK'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filter === v
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {v === 'All' ? 'All' : v === 'APPROVE_FOR_WHOLESALE' ? 'Approved' : v === 'REQUIRES_FURTHER_AUDIT' ? 'Audit' : 'High Risk'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="text-[11px] uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">ASIN & Product</th>
                  <th className="py-3 px-4">Cost / Retail</th>
                  <th className="py-3 px-4">Net Margin</th>
                  <th className="py-3 px-4">Deal Score</th>
                  <th className="py-3 px-4">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDeals.length > 0 ? (
                  filteredDeals.map((deal) => (
                    <tr
                      key={deal.asin}
                      onClick={() => setSelectedDeal(deal)}
                      className={`cursor-pointer transition-colors ${
                        selectedDeal?.asin === deal.asin ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white line-clamp-1">{deal.title}</div>
                        <div className="text-[11px] text-cyan-400 font-mono">{deal.asin}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        ${deal.financials.costPrice.toFixed(2)} / <span className="text-white">${deal.financials.retailPrice.toFixed(2)}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {deal.financials.netMarginPercent}%
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{deal.dealScore}</span>
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                deal.dealScore >= 80 ? 'bg-emerald-400' : deal.dealScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                              }`}
                              style={{ width: `${deal.dealScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            deal.verdict === 'APPROVE_FOR_WHOLESALE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : deal.verdict === 'REQUIRES_FURTHER_AUDIT'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {deal.verdict.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No ASIN deals match the filter. Upload a new batch to triage.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Col: Detailed Deal Financials & Risk Inspector */}
        <section className="space-y-6">
          <div className="bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
                Triage Deep Dive
              </h3>
              {selectedDeal && (
                <span className="text-xs font-mono text-cyan-400 font-bold">{selectedDeal.asin}</span>
              )}
            </div>

            {selectedDeal ? (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedDeal.title}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Evaluated at: {new Date(selectedDeal.evaluatedAt || Date.now()).toLocaleTimeString()}
                  </p>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 text-[11px]">Net Profit / Unit</span>
                    <p className="text-base font-extrabold text-emerald-400">
                      ${(selectedDeal.financials.netProfitPerUnit ?? selectedDeal.financials.grossMarginAmount ?? 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 text-[11px]">Return on Investment</span>
                    <p className="text-base font-extrabold text-teal-400">
                      {selectedDeal.financials.roiPercent}% ROI
                    </p>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-semibold text-slate-300">Unit Cost Structure</span>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Supplier Cost Price:</span>
                      <span className="text-white font-mono">${selectedDeal.financials.costPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amazon Referral Fee (15%):</span>
                      <span className="text-white font-mono">${(selectedDeal.financials.referralFee ?? (selectedDeal.financials.retailPrice * 0.15)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated FBA Pick & Pack:</span>
                      <span className="text-white font-mono">${(selectedDeal.financials.fbaFeeEstimate ?? 5.50).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 font-semibold text-slate-200">
                      <span>Total Landed Cost:</span>
                      <span className="text-cyan-400 font-mono">${(selectedDeal.financials.totalUnitCost ?? (selectedDeal.financials.costPrice + (selectedDeal.financials.fbaFeeEstimate ?? 5.50))).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Flags */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-semibold text-slate-300">Compliance & Risk Flags</span>
                  {selectedDeal.riskAssessment?.flags && selectedDeal.riskAssessment.flags.length > 0 ? (
                    <div className="space-y-1 text-[11px]">
                      {selectedDeal.riskAssessment.flags.map((flag, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-rose-400">
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Zero MAP violations or Buybox hijacking detected.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select an ASIN deal from the table to view unit margins and risk assessment.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
