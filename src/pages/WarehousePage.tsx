import React from 'react';
import { Building2, MapPin, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';

export const WarehousePage: React.FC = () => {
  const { warehouses } = useData();

  return (
    <div className="space-y-8 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              3PL LOGISTICS NETWORK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Verified 3PL Warehouse & FBA Prep Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect with certified Amazon FBA prep centers, cold storage facilities, and hazmat 3PL hubs across the United States.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warehouses.map(w => (
          <div key={w.id} className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> FBA Certified
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{w.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {w.location}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Capacity:</span>
                <span className="font-bold text-white">{w.capacitySqFt.toLocaleString()} sq ft</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Utilization Rate:</span>
                <span className="font-bold text-cyan-400">{w.utilizationRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Partner Rating:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> {w.rating}
                </span>
              </div>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors">
              Connect Warehouse Hub
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
