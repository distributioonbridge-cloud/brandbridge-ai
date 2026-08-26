'use client';

import React, { useState } from 'react';
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
  FileCheck
} from 'lucide-react';

type AccountRole = 'seller' | 'brand_manager' | 'investor' | 'logistics';

interface WizardFormData {
  role: AccountRole;
  fullName: string;
  email: string;
  companyName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  sellingPartnerId: string;
  primaryMarketplace: string;
  monthlyGmv: string;
  agreedToTerms: boolean;
  agreedToRlsCompliance: boolean;
}

const ROLE_OPTIONS = [
  {
    id: 'seller' as AccountRole,
    title: 'Authorized Wholesale Seller',
    tag: 'SP-API Sync',
    icon: Store,
    desc: 'Access authorized brand catalogs, submit purchase orders, and monitor MAP-compliant profit margins.',
    color: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'brand_manager' as AccountRole,
    title: 'Brand Registry Manager',
    tag: 'MAP Protection',
    icon: ShieldCheck,
    desc: 'Automate 24/7 ASIN price monitoring, BuyBox defense, unauthorized seller triage, and C&D notices.',
    color: 'from-indigo-600 to-purple-600',
    borderColor: 'border-indigo-500/30'
  },
  {
    id: 'investor' as AccountRole,
    title: 'Capital Syndicate / Investor',
    tag: 'RLS Isolated',
    icon: DollarSign,
    desc: 'Deploy wholesale liquidity, underwrite high-deal-score inventory, and track audited portfolio yield.',
    color: 'from-emerald-600 to-teal-600',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'logistics' as AccountRole,
    title: '3PL Logistics & Prep Partner',
    tag: 'FBA Routing',
    icon: Truck,
    desc: 'Receive palletized shipments, manage FNSKU labeling, polybagging, and cross-docking to Amazon FCs.',
    color: 'from-amber-600 to-orange-600',
    borderColor: 'border-amber-500/30'
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<WizardFormData>({
    role: 'seller',
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    sellingPartnerId: '',
    primaryMarketplace: 'ATVPDKIKX0DER',
    monthlyGmv: '$100k - $500k',
    agreedToTerms: false,
    agreedToRlsCompliance: false
  });

  const updateField = (field: keyof WizardFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.role) {
        setErrorMessage('Please select an account type to proceed.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.fullName.trim()) {
        setErrorMessage('Full name is required.');
        return false;
      }
      if (!formData.companyName.trim()) {
        setErrorMessage('Company or Organization name is required.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('A valid corporate email address is required.');
        return false;
      }
      if (formData.password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (formData.role === 'seller' || formData.role === 'brand_manager') {
        if (!formData.sellingPartnerId.trim()) {
          setErrorMessage('Amazon Selling Partner ID or Merchant Token is required.');
          return false;
        }
      }
      return true;
    }

    if (step === 4) {
      if (!formData.agreedToTerms) {
        setErrorMessage('You must agree to the Master Service Agreement and Terms of Service.');
        return false;
      }
      if (!formData.agreedToRlsCompliance) {
        setErrorMessage('You must acknowledge the PostgreSQL Row-Level Security & SP-API Data Compliance policy.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrorMessage(null);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const registeredUser = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: formData.email,
        name: formData.fullName,
        companyName: formData.companyName,
        role: formData.role,
        sellingPartnerId: formData.sellingPartnerId || undefined,
        investorId: formData.role === 'investor' ? `inv_${Math.random().toString(36).substring(2, 7)}` : undefined
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('db_auth_token', `demo_token_${Date.now()}`);
        localStorage.setItem('db_user', JSON.stringify(registeredUser));
      }

      setSuccessMessage('Account provisioned successfully! Directing to your workspace...');
      setCurrentStep(5);

      setTimeout(() => {
        if (formData.role === 'brand_manager' || formData.role === 'investor') {
          router.push('/brand');
        } else {
          router.push('/seller');
        }
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
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
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Onboarding
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 hidden sm:inline">Already registered?</span>
            <Link
              href="/login"
              className="px-3.5 py-1.5 font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {/* Wizard Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-3">
            {[
              { step: 1, label: 'Role' },
              { step: 2, label: 'Profile' },
              { step: 3, label: 'Integration' },
              { step: 4, label: 'Compliance' }
            ].map(item => (
              <div key={item.step} className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === item.step
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-600/30'
                      : currentStep > item.step
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}
                >
                  {currentStep > item.step ? <CheckCircle2 className="h-4 w-4" /> : item.step}
                </div>
                <span
                  className={`text-xs hidden sm:inline font-medium ${
                    currentStep === item.step
                      ? 'text-indigo-400 font-semibold'
                      : currentStep > item.step
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden max-w-2xl mx-auto border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, (currentStep / 4) * 100)}%` }}
            />
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3 animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1: Select Organization Role */}
          {currentStep === 1 && (
            <div>
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Step 1 of 4</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Select Your Organization Type
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Tailors your workspace dashboards, SP-API integration permissions, and PostgreSQL security policies.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = formData.role === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('role', opt.id)}
                      className={`text-left p-5 rounded-xl border transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/10'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 border border-slate-700 text-slate-300">
                          {opt.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{opt.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Continue to Profile
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Profile & Credentials */}
          {currentStep === 2 && (
            <div>
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Step 2 of 4</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Company & Security Profile
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Create administrative credentials for your multi-tenant organization.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Administrator Full Name <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={e => updateField('fullName', e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Legal Business / Entity Name <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={e => updateField('companyName', e.target.value)}
                        placeholder="e.g. Apex Distribution LLC"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Corporate Work Email <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => updateField('email', e.target.value)}
                        placeholder="admin@yourcompany.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Password <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => updateField('password', e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Confirm Password <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={e => updateField('confirmPassword', e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-sm flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Continue to Integration
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Integration & Amazon SP-API */}
          {currentStep === 3 && (
            <div>
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Step 3 of 4</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Amazon SP-API Configuration
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Connect your Amazon Seller Central or Brand Registry endpoints for automated inventory synchronization.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Amazon Selling Partner ID / Merchant Token <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.sellingPartnerId}
                      onChange={e => updateField('sellingPartnerId', e.target.value)}
                      placeholder="e.g. A21TJEXAMPLE123"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Found in Seller Central under Settings &rarr; Account Info &rarr; Business Information &rarr; Merchant Token.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Primary Amazon Marketplace
                    </label>
                    <div className="relative">
                      <Globe2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <select
                        value={formData.primaryMarketplace}
                        onChange={e => updateField('primaryMarketplace', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none"
                      >
                        <option value="ATVPDKIKX0DER">United States (Amazon.com)</option>
                        <option value="A2EUQ1WTGCTBG2">Canada (Amazon.ca)</option>
                        <option value="A1F83G8C2ARO7P">United Kingdom (Amazon.co.uk)</option>
                        <option value="A1PA6795UKMFR9">Germany (Amazon.de)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Expected Monthly Volume / Allocation Target
                    </label>
                    <select
                      value={formData.monthlyGmv}
                      onChange={e => updateField('monthlyGmv', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none"
                    >
                      <option value="Under $50k">Under $50,000 / mo</option>
                      <option value="$50k - $100k">$50,000 - $100,000 / mo</option>
                      <option value="$100k - $500k">$100,000 - $500,000 / mo</option>
                      <option value="$500k - $2M">$500,000 - $2,000,000 / mo</option>
                      <option value="$2M+">$2,000,000+ / mo (Enterprise Tier)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-3 mt-4">
                  <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Automated LWA Handshake</span>
                    <p className="text-slate-400 mt-0.5">
                      After onboarding, you can grant direct Login with Amazon (LWA) OAuth permissions to enable real-time FBA fees and monthly sales retrieval.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-sm flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Continue to Compliance
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Compliance & Confirmation */}
          {currentStep === 4 && (
            <div>
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Step 4 of 4</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Governance & Compliance
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Review and acknowledge multi-tenant security guarantees and data policies.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                    <span>Provisioning Configuration</span>
                    <span className="text-indigo-400 font-mono font-semibold uppercase">{formData.role}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div><span className="text-slate-500">Legal Entity:</span> {formData.companyName}</div>
                    <div><span className="text-slate-500">Admin Email:</span> {formData.email}</div>
                    <div><span className="text-slate-500">SP-API Identifier:</span> {formData.sellingPartnerId || 'Pending OAuth'}</div>
                    <div><span className="text-slate-500">Volume Tier:</span> {formData.monthlyGmv}</div>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={e => updateField('agreedToTerms', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">Master Services Agreement & MAP Policy</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      I agree to the DistributionBridge platform terms, Minimum Advertised Price (MAP) strict adherence, and wholesale trade covenants.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.agreedToRlsCompliance}
                    onChange={e => updateField('agreedToRlsCompliance', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">PostgreSQL RLS & SP-API Isolation</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      I acknowledge that all proprietary catalog data, profit margins, and sales velocity are isolated under tenant Row-Level Security encryption.
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-sm flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Provisioning Workspace...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4" />
                      Complete Registration
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Redirect */}
          {currentStep === 5 && (
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to DistributionBridge!</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Your enterprise organization has been provisioned and your cryptographic session has been initialized.
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-indigo-400 font-medium bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                Launching Dashboard...
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-600">
        Secured by DistributionBridge Cloudflare Worker & PostgreSQL Hyperdrive Architecture
      </footer>
    </div>
  );
}
