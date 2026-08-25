import React, { useState } from 'react';
import {
  Store,
  Building2,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Boxes,
  Send,
  X
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Brand } from '../data/mockData';

export const MarketplacePage: React.FC = () => {
  const { brands, applyForPartnership } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const [orderPromise, setOrderPromise] = useState('$35,000 / mo');
  const [notes, setNotes] = useState('We operate 3 US 3PL warehouses with strict MAP adherence and immediate FBA inventory replenishment.');
  const [submitted, setSubmitted] = useState(false);

  const categories = ['All', 'Consumer Electronics', 'Smart Home & Appliances', 'Sports & Outdoors', 'Health & Personal Care', 'Audio & Music'];

  const filteredBrands = brands.filter(b => {
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand) return;
    applyForPartnership(selectedBrand.id, selectedBrand.name, orderPromise, notes);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedBrand(null);
    }, 1800);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              DIRECT BRAND MARKETPLACE
            </span>
            <span className="text-xs text-slate-400">Authorized Wholesale Dealflow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Verified Amazon Brand Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect directly with verified Amazon Brand Registry owners. Apply for exclusive FBA distribution rights with guaranteed margin structures.
          </p>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search brands or categories..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pl-9"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map(brand => (
          <div
            key={brand.id}
            className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-6 relative overflow-hidden group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <img src={brand.logo} alt={brand.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-700" />
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {brand.category}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xl font-bold text-white">{brand.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{brand.description}</p>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Min Order Qty</span>
                  <span className="font-bold text-white">{brand.minOrderQty} units</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Avg Net Margin</span>
                  <span className="font-bold text-emerald-400">{brand.avgMargin}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBrand(brand)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg cyan-glow transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Apply for Wholesale Deal
            </button>
          </div>
        ))}
      </div>

      {/* Application Drawer Modal */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 bg-slate-900/95 shadow-2xl">
            <button
              onClick={() => setSelectedBrand(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Application Submitted!</h3>
                <p className="text-xs text-slate-300">
                  Your wholesale proposal has been sent to <span className="text-emerald-400 font-semibold">{selectedBrand.name}</span>. Brand management will review your seller metrics and notify you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <img src={selectedBrand.logo} alt={selectedBrand.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Apply to {selectedBrand.name}</h3>
                    <p className="text-xs text-slate-400">Direct FBA Wholesale Authorization Proposal</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Monthly Order Volume Promise
                  </label>
                  <input
                    type="text"
                    required
                    value={orderPromise}
                    onChange={e => setOrderPromise(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Seller Proposal & Warehouse Capabilities
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg cyan-glow transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Wholesale Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
