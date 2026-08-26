'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Building2, 
  UserCheck,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { api, getCurrentUser, logout } from '../../services/api';

const QUICK_DEMO_ACCOUNTS = [
  {
    label: 'Alpha Capital (Investor inv_01)',
    email: 'alpha.capital@distributionbridge.com',
    role: 'investor',
    badge: 'RLS Isolated',
  },
  {
    label: 'Vanguard Syndicate (Investor inv_02)',
    email: 'vanguard.syndicate@distributionbridge.com',
    role: 'investor',
    badge: 'RLS Isolated',
  },
  {
    label: 'ApexGear Tech (Brand Manager)',
    email: 'brand.admin@distributionbridge.com',
    role: 'brand_manager',
    badge: 'Sourcing Triage',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('alpha.capital@distributionbridge.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await api.login(email, password);

      if (result.success && result.user) {
        setSuccessMessage(`Welcome back, ${result.user.name || result.user.email}!`);
        setCurrentUser(result.user);

        setTimeout(() => {
          if (result.user?.role === 'investor') {
            router.push('/brand');
          } else if (result.user?.role === 'brand_manager') {
            router.push('/brand');
          } else {
            router.push('/seller');
          }
        }, 800);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Edge service could not be reached.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage(null);
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setSuccessMessage('Signed out successfully.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] flex items-center justify-center shadow-md shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            DistributionBridge
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          &larr; Back to Overview
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Enterprise Sign In
              </h1>
              <p className="text-xs text-slate-400 mt-1.5">
                Authenticate with PBKDF2 Web Crypto & transaction-scoped RLS.
              </p>
            </div>

            {/* Current Active Session Banner */}
            {currentUser && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-emerald-300">Active: </span>
                    <span className="text-slate-300">{currentUser.email}</span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-400 hover:text-red-400 underline font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@distributionbridge.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500">PBKDF2 100k It.</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                <Link
                  href="/register"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Need an enterprise account? Onboard your organization &rarr;
                </Link>
              </div>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-3 uppercase tracking-wider">
                Select Verified Demo Account:
              </span>
              <div className="space-y-2">
                {QUICK_DEMO_ACCOUNTS.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickFill(acc.email)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      email === acc.email
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{acc.label}</div>
                      <div className="text-[11px] text-slate-500">{acc.email}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-medium text-slate-300 border border-slate-700">
                      {acc.badge}
                    </span>
                  </button>
                ))}
              </div>
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
