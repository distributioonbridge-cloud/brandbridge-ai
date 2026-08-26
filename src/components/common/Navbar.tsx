import React, { useState } from 'react';
import {
  ShieldAlert,
  Store,
  Building2,
  ShieldCheck,
  Bell,
  Search,
  User,
  ChevronDown,
  Sparkles,
  Layers,
  Zap,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, role, switchRole } = useAuth();
  const { notifications, markNotificationRead, openStripeModal } = useData();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const roleColors: Record<UserRole, string> = {
    Seller: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Brand: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    Admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      {/* Top Enterprise Role Switcher Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/50 py-1.5 px-4 sm:px-8 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">Distribution Bridge v2.4 Engine</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">24/7 Agentic ASIN Protection active across Amazon US & EU</span>
        </div>

        {/* Demo Role Selector Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline font-medium">Switch View:</span>
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={() => switchRole('Seller')}
              className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all flex items-center gap-1.5 ${
                role === 'Seller'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Seller Mode
            </button>
            <button
              onClick={() => switchRole('Brand')}
              className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all flex items-center gap-1.5 ${
                role === 'Brand'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Brand Mode
            </button>
            <button
              onClick={() => switchRole('Admin')}
              className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all flex items-center gap-1.5 ${
                role === 'Admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab(role === 'Brand' ? 'brand-dashboard' : role === 'Seller' ? 'seller-dashboard' : 'admin-dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg cyan-glow group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                Distribution<span className="gradient-text">Bridge</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Enterprise Wholesale & Protection</p>
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {/* Landing / General links */}
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'landing' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Overview
          </button>

          {role === 'Seller' && (
            <>
              <button
                onClick={() => setActiveTab('seller-dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'seller-dashboard' ? 'text-emerald-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'marketplace' ? 'text-emerald-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Brand Marketplace
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'inventory' ? 'text-emerald-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Inventory & Sales
              </button>
              <button
                onClick={() => setActiveTab('warehouses')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'warehouses' ? 'text-emerald-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                3PL Warehouses
              </button>
              <button
                onClick={() => setActiveTab('distributors')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'distributors' ? 'text-emerald-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Distributor Network
              </button>
            </>
          )}

          {role === 'Brand' && (
            <>
              <button
                onClick={() => setActiveTab('brand-dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'brand-dashboard' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('brand-protection')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'brand-protection' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                AI Brand Protection
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'marketplace' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Seller Applications
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'analytics' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Analytics
              </button>
            </>
          )}

          {role === 'Admin' && (
            <>
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'admin-dashboard' ? 'text-purple-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Admin Governance
              </button>
              <button
                onClick={() => setActiveTab('brand-protection')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'brand-protection' ? 'text-purple-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                System Risk Monitor
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'analytics' ? 'text-purple-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Global GMV Analytics
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'pricing' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'settings' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Right Section: Notifications, Billing Upgrade, User Profile */}
        <div className="flex items-center gap-3">
          {/* Register & Upgrade CTA Buttons */}
          <button
            onClick={() => setActiveTab('register')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all ${
              activeTab === 'register'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : 'bg-slate-800/60 hover:bg-slate-800 text-cyan-400 border-cyan-500/30'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => openStripeModal('Brand Shield')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs cyan-glow transition-all shadow-md"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Upgrade Plan
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl p-4 shadow-2xl z-50 border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    Agentic AI Alerts
                  </h4>
                  <span className="text-xs text-slate-400">{notifications.length} updates</span>
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        n.read
                          ? 'bg-slate-800/30 border-slate-800 text-slate-400'
                          : 'bg-cyan-950/30 border-cyan-500/40 text-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-cyan-500/40 object-cover"
              />
              <div className="hidden md:block text-left text-xs">
                <p className="font-semibold text-slate-200 leading-tight">{user.companyName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${roleColors[role]}`}>
                    {role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-sm">
          <button
            onClick={() => { setActiveTab('landing'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-200"
          >
            Overview
          </button>
          {role === 'Seller' && (
            <>
              <button
                onClick={() => { setActiveTab('seller-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-emerald-400"
              >
                Seller Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('marketplace'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-emerald-400"
              >
                Brand Marketplace
              </button>
            </>
          )}
          {role === 'Brand' && (
            <>
              <button
                onClick={() => { setActiveTab('brand-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-cyan-400"
              >
                Brand Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('brand-protection'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-cyan-400"
              >
                AI Brand Protection
              </button>
            </>
          )}
          {role === 'Admin' && (
            <button
              onClick={() => { setActiveTab('admin-dashboard'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-purple-400"
            >
              Admin Governance
            </button>
          )}
          <button
            onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-200"
          >
            Pricing & Plans
          </button>
        </div>
      )}
    </header>
  );
};
