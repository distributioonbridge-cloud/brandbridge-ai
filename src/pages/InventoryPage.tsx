import React from 'react';
import { Boxes, Package, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';

export const InventoryPage: React.FC = () => {
  const { products } = useData();

  return (
    <div className="space-y-8 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              INVENTORY MANAGEMENT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Wholesale Inventory & FBA Replenishment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track stock levels across 3PL warehouses and Amazon FBA fulfillment centers.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
        <h3 className="font-bold text-white text-base">Active Stock Catalog</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">ASIN</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">FBA Stock</th>
                <th className="py-3 px-3">3PL Reserve</th>
                <th className="py-3 px-3">MAP Price</th>
                <th className="py-3 px-3">Reorder Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-cyan-400 font-bold">{p.asin}</td>
                  <td className="py-3 px-3 font-semibold text-white max-w-[240px] truncate">{p.title}</td>
                  <td className="py-3 px-3 font-bold text-white">420 units</td>
                  <td className="py-3 px-3 text-slate-400">1,200 units</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">${p.mapPrice.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Stock Optimal
                    </span>
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
