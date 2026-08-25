import React from 'react';
import { TrendingUp, BarChart2, ShieldCheck, DollarSign } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-900/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Brand Protection & Sales Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep telemetry into MAP compliance rates, unauthorized volume elimination, and channel revenue trajectory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Revenue & Protected Volume */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Monthly Revenue vs Protected Volume ($)
            </h3>
            <span className="text-xs text-slate-400">2026 Q1 - Q3</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            {[
              { month: 'Jan', val: 65, color: 'bg-cyan-500' },
              { month: 'Feb', val: 78, color: 'bg-cyan-500' },
              { month: 'Mar', val: 82, color: 'bg-cyan-500' },
              { month: 'Apr', val: 94, color: 'bg-cyan-500' },
              { month: 'May', val: 110, color: 'bg-cyan-500' },
              { month: 'Jun', val: 125, color: 'bg-emerald-500' },
              { month: 'Jul', val: 142, color: 'bg-emerald-400' }
            ].map(item => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className={`w-full rounded-t-lg ${item.color} cyan-glow transition-all duration-500`}
                  style={{ height: `${item.val}%` }}
                ></div>
                <span className="text-[10px] text-slate-400 font-mono">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Threat Enforcement Velocity */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              MAP Breaches Resolved vs Generated C&Ds
            </h3>
            <span className="text-xs text-slate-400">100% Success Rate</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            {[
              { month: 'Jan', val: 40, color: 'bg-purple-500' },
              { month: 'Feb', val: 55, color: 'bg-purple-500' },
              { month: 'Mar', val: 48, color: 'bg-purple-500' },
              { month: 'Apr', val: 70, color: 'bg-purple-500' },
              { month: 'May', val: 85, color: 'bg-purple-500' },
              { month: 'Jun', val: 92, color: 'bg-purple-400' },
              { month: 'Jul', val: 98, color: 'bg-cyan-400' }
            ].map(item => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className={`w-full rounded-t-lg ${item.color} transition-all duration-500`}
                  style={{ height: `${item.val}%` }}
                ></div>
                <span className="text-[10px] text-slate-400 font-mono">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
