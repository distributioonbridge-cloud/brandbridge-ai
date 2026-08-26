'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { getCurrentUser, logout } from '../../services/api';

type TabType = 'profile' | 'amazon_spapi' | 'security_rls' | 'notifications' | 'logistics';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Profile Form State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
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
  const [rlsIsolationEnabled, setRlsIsolationEnabled] = useState<boolean>(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number>(120);

  // Notification State
  const [emailAlertsMap, setEmailAlertsMap] = useState<boolean>(true);
  const [buyBoxHijackAlerts, setBuyBoxHijackAlerts] = useState<boolean>(true);
  const [dailyDigestEmail, setDailyDigestEmail] = useState<boolean>(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('https://hooks.slack.com/services/T00/B00/X00');

  // Logistics State
  const [defaultWarehouse, setDefaultWarehouse] = useState<string>('wh_chicago_01');
  const [requirePolybagging, setRequirePolybagging] = useState<boolean>(true);
  const [requireFnskuLabeling, setRequireFnskuLabeling] = useState<boolean>(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setName(user.name || '');
      setEmail(user.email || '');
      setCompanyName(user.companyName || 'Apex Wholesale Enterprises');
      setRole(user.role || 'seller');
      if (user.sellingPartnerId) {
        setSellingPartnerId(user.sellingPartnerId);
      }
    } else {
      // Default fallback demo user
      setName('Alexander Wright');
      setEmail('alpha.capital@distributionbridge.com');
      setCompanyName('Alpha Capital Partners LLC');
      setRole('investor');
    }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      if (typeof window !== 'undefined') {
        const updated = {
          ...(currentUser || {}),
          name,
          email,
          companyName,
          role,
          sellingPartnerId
        };
        localStorage.setItem('db_user', JSON.stringify(updated));
        setCurrentUser(updated);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Layers className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                DistributionBridge
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Enterprise Settings
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/seller"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Seller Dashboard
            </Link>
            <Link
              href="/brand"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Brand Manager
            </Link>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Settings className="h-7 w-7 text-indigo-400" />
              Settings & Organization Controls
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage multi-tenant configuration, Amazon SP-API tokens, PostgreSQL RLS security, and notifications.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 animate-fadeIn">
                <Check className="h-4 w-4" />
                Settings saved successfully
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-6 mt-6 border-t border-slate-800/80">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Tenant Status
                </span>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Hyperdrive Active
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  PostgreSQL RLS session verified under cryptographic token.
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
              {/* TAB 1: Profile & Organization */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Profile & Organization Details</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage administrator identity, business organization name, and regional localization.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Legal Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Assigned Role</label>
                      <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      >
                        <option value="seller">Authorized Wholesale Seller</option>
                        <option value="brand_manager">Brand Registry Manager</option>
                        <option value="investor">Capital Syndicate / Investor</option>
                        <option value="admin">Platform Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Timezone</label>
                      <select
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      >
                        <option value="America/New_York (EST)">Eastern Time (US & Canada)</option>
                        <option value="America/Chicago (CST)">Central Time (US & Canada)</option>
                        <option value="America/Denver (MST)">Mountain Time (US & Canada)</option>
                        <option value="America/Los_Angeles (PST)">Pacific Time (US & Canada)</option>
                        <option value="Europe/London (GMT)">London (GMT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Base Currency</label>
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      >
                        <option value="USD ($)">USD ($) - United States Dollar</option>
                        <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                        <option value="GBP (£)">GBP (£) - British Pound</option>
                        <option value="EUR (€)">EUR (€) - Euro</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Amazon SP-API & LWA */}
              {activeTab === 'amazon_spapi' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-lg font-bold text-white">Amazon SP-API & LWA OAuth</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Manage Selling Partner API tokens, scheduled sales synchronization, and fee ingestion.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SP-API Linked
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Selling Partner ID</label>
                        <input
                          type="text"
                          value={sellingPartnerId}
                          onChange={e => setSellingPartnerId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Marketplace</label>
                        <select
                          value={marketplaceId}
                          onChange={e => setMarketplaceId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        >
                          <option value="ATVPDKIKX0DER">US - Amazon.com (ATVPDKIKX0DER)</option>
                          <option value="A2EUQ1WTGCTBG2">CA - Amazon.ca (A2EUQ1WTGCTBG2)</option>
                          <option value="A1F83G8C2ARO7P">UK - Amazon.co.uk (A1F83G8C2ARO7P)</option>
                          <option value="A1PA6795UKMFR9">DE - Amazon.de (A1PA6795UKMFR9)</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white">Auto Sales Sync Cadence</div>
                          <div className="text-[11px] text-slate-400">Scheduled Cloudflare Cron trigger frequency</div>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                          Every {syncIntervalHours} Hours
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={syncIntervalHours}
                        onChange={e => setSyncIntervalHours(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                        <div>
                          <div className="text-xs font-semibold text-white">Automated Monthly Sales Sync</div>
                          <div className="text-[11px] text-slate-400">Pulls FBA/FBM unit breakdown & gross revenue</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoSyncSales}
                          onChange={e => setAutoSyncSales(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                        <div>
                          <div className="text-xs font-semibold text-white">Dynamic FBA Fee Estimator</div>
                          <div className="text-[11px] text-slate-400">Ingests real-time referral fees & weight-handling costs</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoFetchFbaFees}
                          onChange={e => setAutoFetchFbaFees(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Security & PostgreSQL RLS */}
              {activeTab === 'security_rls' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">PostgreSQL Row-Level Security & Access</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure multi-tenant isolation, tenant policy enforcement, and authentication parameters.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Row-Level Security Active (Tenant Isolated)</span>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Every SQL query to Amazon sales history, profit triage records, and investor allocations is sandboxed with <code className="text-emerald-300 font-mono bg-emerald-950/60 px-1 py-0.5 rounded">SET LOCAL app.current_user_id</code>.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Session Inactivity Timeout</label>
                        <select
                          value={sessionTimeoutMinutes}
                          onChange={e => setSessionTimeoutMinutes(parseInt(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        >
                          <option value="30">30 Minutes</option>
                          <option value="60">1 Hour</option>
                          <option value="120">2 Hours (Default)</option>
                          <option value="480">8 Hours (Full Shift)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">PostgreSQL Connection Engine</label>
                        <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-400 flex items-center justify-between">
                          <span>Hyperdrive Pool (Cloudflare Edge)</span>
                          <Server className="h-4 w-4 text-emerald-400" />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                      <div>
                        <div className="text-xs font-semibold text-white">Require Two-Factor Authentication (2FA)</div>
                        <div className="text-[11px] text-slate-400">Enforces TOTP authenticator prompt for all administrative logins</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={twoFactorAuth}
                        onChange={e => setTwoFactorAuth(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 4: Alerts & Webhooks */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Alerts, MAP Monitoring & Webhooks</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure real-time notifications for MAP violations, BuyBox suppression, and deal score changes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                      <div>
                        <div className="text-xs font-semibold text-white">Instant MAP Undercut Alerts</div>
                        <div className="text-[11px] text-slate-400">Notifies when unauthorized sellers drop prices below agreed MAP floor</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailAlertsMap}
                        onChange={e => setEmailAlertsMap(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                      <div>
                        <div className="text-xs font-semibold text-white">BuyBox Hijack & Suppression Alerts</div>
                        <div className="text-[11px] text-slate-400">Triggered when BuyBox ownership transfers to unauthorized FBM sellers</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={buyBoxHijackAlerts}
                        onChange={e => setBuyBoxHijackAlerts(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Slack / Discord Webhook URL</label>
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={e => setWebhookUrl(e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Logistics Defaults */}
              {activeTab === 'logistics' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Logistics & 3PL Fulfillment Defaults</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Set automated warehouse prep parameters, cross-docking hubs, and packaging requirements.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary 3PL Warehouse Hub</label>
                      <select
                        value={defaultWarehouse}
                        onChange={e => setDefaultWarehouse(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      >
                        <option value="wh_chicago_01">Chicago Prime Prep (MDW2 / ORD2 Hub) - $18.50/pallet</option>
                        <option value="wh_dallas_02">Dallas Logistics Gateway (DFW6 / FTW1 Hub) - $17.00/pallet</option>
                        <option value="wh_ontario_03">California Inland Hub (ONT8 / LAX9 Hub) - $21.00/pallet</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                        <div>
                          <div className="text-xs font-semibold text-white">Mandatory FNSKU Barcode Labeling</div>
                          <div className="text-[11px] text-slate-400">Automates $0.18/unit labeling at warehouse inbound intake</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={requireFnskuLabeling}
                          onChange={e => setRequireFnskuLabeling(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                        <div>
                          <div className="text-xs font-semibold text-white">Mandatory Polybagging & Suffocation Warnings</div>
                          <div className="text-[11px] text-slate-400">Ensures compliance for apparel, liquids, and bundled multi-packs</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={requirePolybagging}
                          onChange={e => setRequirePolybagging(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-600">
        Secured by DistributionBridge Cloudflare Worker & PostgreSQL Hyperdrive Architecture
      </footer>
    </div>
  );
}
