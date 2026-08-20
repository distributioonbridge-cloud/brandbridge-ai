import React from 'react';
import {
  TrendingUp,
  Store,
  Building2,
  Boxes,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface SellerDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { brands, applications, openStripeModal } = useData();

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              VERIFIED WHOLESALE SELLER
            </span>
            <span className="text-xs text-slate-400">Merchant ID: SEL-892401</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, <span className="gradient-text">{user?.name || 'Alexander'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            PrimeWholesale Global — FBA Wholesale Operations & Brand Direct Partnerships
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('marketplace')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg cyan-glow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Apply to New Brands
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Monthly Sales Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">$412,850</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs last month</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Brand Deals</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">14 Approved</h3>
            <p className="text-xs text-slate-400 mt-1">Exclusive FBA Distribution</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Inventory Turnover</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">94.2% Healthy</h3>
            <p className="text-xs text-emerald-400 mt-1">0 Overstock ASINs</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Average Margin</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">38.5% Net</h3>
            <p className="text-xs text-slate-400 mt-1">Direct Brand Wholesale Pricing</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Partnerships & Applications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Active Wholesale Brand Partnerships
              </h3>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Browse 50+ Brands →
              </button>
            </div>

            <div className="space-y-4">
              {brands.slice(0, 3).map(brand => (
                <div
                  key={brand.id}
                  className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{brand.name}</h4>
                      <p className="text-xs text-slate-400">{brand.category}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Min Order: <strong className="text-slate-200">{brand.minOrderQty} units</strong></span>
                        <span>•</span>
                        <span>Avg Margin: <strong className="text-emerald-400">{brand.avgMargin}</strong></span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-fit">
                    Active FBA Authorization
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Applications Tracker */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Partnership Applications Status
            </h3>
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.id} className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{app.brandName}</h4>
                    <p className="text-slate-400">Monthly Order Promise: {app.monthlyOrderPromise}</p>
                    <span className="text-[10px] text-slate-500">Applied: {app.appliedDate}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-semibold ${
                      app.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : app.status === 'Pending'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: AI Business Insights & Quick Actions */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 bg-slate-900/80 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              AI Wholesale Recommendations
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-semibold text-emerald-400">High Margin Opportunity</span>
                <p className="text-slate-300">PureBlend Nutrition added 10 new SKUs with 45% net margin. Apply for FBA exclusivity now.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-semibold text-cyan-400">FBA Stockout Alert</span>
                <p className="text-slate-300">ASIN B09X2L3K9A stock running low in Midwest 3PL. Reorder 200 units recommended.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">Wholesale Quick Tools</h3>
            <button
              onClick={() => setActiveTab('warehouses')}
              className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-left flex items-center justify-between border border-slate-700 transition-colors"
            >
              <span>Connect 3PL Prep Warehouse</span>
              <Building2 className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={() => setActiveTab('distributors')}
              className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-left flex items-center justify-between border border-slate-700 transition-colors"
            >
              <span>Browse Master Distributors</span>
              <Package className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
