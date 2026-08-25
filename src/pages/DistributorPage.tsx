import React from 'react';
import { Package, ShieldCheck, Star } from 'lucide-react';
import { useData } from '../context/DataContext';

export const DistributorPage: React.FC = () => {
  const { distributors } = useData();

  return (
    <div className="space-y-8 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              MASTER DISTRIBUTOR NETWORK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Authorized Wholesale Distributor Network
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Partner with verified master distributors holding authorized brand distribution rights for North America & Europe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {distributors.map(d => (
          <div key={d.id} className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Package className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Authorized
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{d.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Region: {d.region}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400 block mb-1">Supported Categories:</span>
                <div className="flex flex-wrap gap-1">
                  {d.categories.map(c => (
                    <span key={c} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Min Order Value:</span>
                <span className="font-bold text-emerald-400">${d.minimumOrder.toLocaleString()}</span>
              </div>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all">
              Request Wholesale Catalog
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
