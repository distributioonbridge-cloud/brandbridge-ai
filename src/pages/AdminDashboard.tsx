import React from 'react';
import { Building2, ShieldCheck, Users, DollarSign, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';

export const AdminDashboard: React.FC = () => {
  const { brands, sellers } = useData();

  return (
    <div className="space-y-8 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              PLATFORM GOVERNANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            BrandBridge AI Platform Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage user onboarding, verify brand registry credentials, review 3PL logistics hubs, and track system MRR.
          </p>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Platform GMV</span>
          <h3 className="text-2xl font-extrabold text-white">$142.8M</h3>
          <p className="text-xs text-emerald-400">+24.2% YoY Growth</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Platform ARR</span>
          <h3 className="text-2xl font-extrabold text-white">$2.4M ARR</h3>
          <p className="text-xs text-cyan-400">184 Enterprise Subscriptions</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verified Brands</span>
          <h3 className="text-2xl font-extrabold text-white">{brands.length} Active</h3>
          <p className="text-xs text-slate-400">100% Amazon Registry Enrolled</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verified Sellers</span>
          <h3 className="text-2xl font-extrabold text-white">{sellers.length} Active</h3>
          <p className="text-xs text-emerald-400">0 Fraud Flagged</p>
        </div>
      </div>

      {/* Sellers Approval Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base">Wholesale Seller Approvals</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Company Name</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Annual Volume</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sellers.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-white">{s.companyName}</td>
                  <td className="py-3 px-3 text-slate-300">{s.contactName} ({s.email})</td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{s.annualVolume}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.riskScore < 30 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {s.riskScore}/100 Risk
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-200">{s.verifiedStatus}</td>
                  <td className="py-3 px-3 text-right">
                    <button className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px]">
                      Verify Credentials
                    </button>
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
