# Source Code: `settings-page-v2.tsx`

**Path**: `DistributionBridge/settings-page-v2.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Truck,
  Store,
  DollarSign,
  Globe2,
  KeyRound,
  Settings,
  Bell,
  Database,
  Sliders,
  RefreshCw,
  Save,
  Check,
  Server,
  ShieldAlert,
  Download,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type TabType = 'profile' | 'amazon_spapi' | 'security_rls' | 'notifications' | 'logistics';

export const SettingsPage: React.FC<{ setActiveTab?: (tab: string) => void }> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTabLocal] = useState<TabType>('profile');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Profile Form State
  const [name, setName] = useState<string>('Alexander Wright');
  const [email, setEmail] = useState<string>('alpha.capital@distributionbridge.com');
  const [companyName, setCompanyName] = useState<string>('Alpha Capital Partners LLC');
  const [role, setRole] = useState<string>('seller');
  const [timezone, setTimezone] = useState<string>('America/New_York (EST)');
  const [currency, setCurrency] = useState<string>('USD ($)');

  // Amazon SP-API State
  const [sellingPartnerId, setSellingPartnerId] = useState<string>('SEL-892401');
  const [marketplaceId, setMarketplaceId] = useState<string>('ATVPDKIKX0DER');
  const [syncIntervalHours, setSyncIntervalHours] = useState<number>(6);
  const [autoSyncSales, setAutoSyncSales] = useState<boolean>(true);
  const [autoFetchFbaFees, setAutoFetchFbaFees] = useState<boolean>(true);

  // Security & RLS State
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number>(120);

  // Notification State
  const [emailAlertsMap, setEmailAlertsMap] = useState<boolean>(true);
  const [buyBoxHijackAlerts, setBuyBoxHijackAlerts] = useState<boolean>(true);
  const [webhookUrl, setWebhookUrl] = useState<string>('https://hooks.slack.com/services/T00/B00/X00');

  // Logistics State
  const [defaultWarehouse, setDefaultWarehouse] = useState<string>('wh_chicago_01');
  const [requirePolybagging, setRequirePolybagging] = useState<boolean>(true);
  const [requireFnskuLabeling, setRequireFnskuLabeling] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setName(user.name || 'Alexander Wright');
      setEmail(user.email || 'admin@distributionbridge.com');
      setCompanyName(user.companyName || 'Apex Wholesale Enterprises');
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Settings className="h-7 w-7 text-cyan-400" />
            Enterprise <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage multi-tenant configuration, Amazon SP-API tokens, PostgreSQL RLS sessions, and notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <Check className="h-4 w-4" />
              Saved successfully
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cyan-glow transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabbed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1.5">
          {[
            { id: 'profile' as TabType, label: 'Profile & Organization', icon: User },
            { id: 'amazon_spapi' as TabType, label: 'Amazon SP-API & LWA', icon: Store },
            { id: 'security_rls' as TabType, label: 'Security & PostgreSQL RLS', icon: ShieldCheck },
            { id: 'notifications' as TabType, label: 'Alerts & Webhooks', icon: Bell },
            { id: 'logistics' as TabType, label: 'Logistics & 3PL Defaults', icon: Truck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabLocal(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg cyan-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl bg-slate-900/90 backdrop-blur-xl">
            {/* TAB 1: Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Profile & Organization Details</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage administrator contact identity and regional localization.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Legal Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Assigned Role</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    >
                      <option value="seller">Authorized Wholesale Seller</option>
                      <option value="brand_manager">Brand Registry Manager</option>
                      <option value="investor">Capital Syndicate / Investor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SP-API */}
            {activeTab === 'amazon_spapi' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Amazon SP-API & LWA OAuth</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage Selling Partner API tokens, scheduled sales sync, and fee ingestion.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Selling Partner ID</label>
                      <input
                        type="text"
                        value={sellingPartnerId}
                        onChange={e => setSellingPartnerId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Marketplace</label>
                      <select
                        value={marketplaceId}
                        onChange={e => setMarketplaceId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      >
                        <option value="ATVPDKIKX0DER">US - Amazon.com (ATVPDKIKX0DER)</option>
                        <option value="A2EUQ1WTGCTBG2">CA - Amazon.ca (A2EUQ1WTGCTBG2)</option>
                        <option value="A1F83G8C2ARO7P">UK - Amazon.co.uk (A1F83G8C2ARO7P)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Auto Sales Sync Cadence</span>
                      <span className="text-xs font-mono font-bold text-cyan-400">Every {syncIntervalHours} Hours</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      value={syncIntervalHours}
                      onChange={e => setSyncIntervalHours(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Security */}
            {activeTab === 'security_rls' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">PostgreSQL Row-Level Security & Access</h2>
                  <p className="text-xs text-slate-400 mt-1">Multi-tenant cryptographic session isolation.</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Row-Level Security Active (Tenant Sandboxed)</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Queries are isolated using PostgreSQL Hyperdrive connection pooling.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Alerts */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Alerts, MAP Monitoring & Webhooks</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure real-time notifications for MAP price changes.</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                    <span className="text-xs text-white font-medium">Instant MAP Undercut Alerts</span>
                    <input
                      type="checkbox"
                      checked={emailAlertsMap}
                      onChange={e => setEmailAlertsMap(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                    <span className="text-xs text-white font-medium">BuyBox Hijack Alerts</span>
                    <input
                      type="checkbox"
                      checked={buyBoxHijackAlerts}
                      onChange={e => setBuyBoxHijackAlerts(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: Logistics */}
            {activeTab === 'logistics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Logistics & 3PL Defaults</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure warehouse routing and packaging rules.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Warehouse Hub</label>
                  <select
                    value={defaultWarehouse}
                    onChange={e => setDefaultWarehouse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                  >
                    <option value="wh_chicago_01">Chicago Prime Prep (MDW2 Hub) - $18.50/pallet</option>
                    <option value="wh_dallas_02">Dallas Logistics Gateway (DFW6 Hub) - $17.00/pallet</option>
                    <option value="wh_ontario_03">California Inland Hub (ONT8 Hub) - $21.00/pallet</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

```
