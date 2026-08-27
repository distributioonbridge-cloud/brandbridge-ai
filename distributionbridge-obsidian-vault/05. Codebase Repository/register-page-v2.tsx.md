# Source Code: `register-page-v2.tsx`

**Path**: `DistributionBridge/register-page-v2.tsx`

```tsx
import React, { useState } from 'react';
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
  FileCheck,
  ExternalLink,
  Check,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  amazonConnected: boolean;
}

const ROLE_OPTIONS = [
  {
    id: 'seller' as AccountRole,
    title: 'Authorized Wholesale Seller',
    tag: 'SP-API Sync',
    icon: Store,
    desc: 'Access authorized brand catalogs, submit purchase orders, and monitor MAP-compliant profit margins.',
  },
  {
    id: 'brand_manager' as AccountRole,
    title: 'Brand Registry Manager',
    tag: 'MAP Protection',
    icon: ShieldCheck,
    desc: 'Automate 24/7 ASIN price monitoring, BuyBox defense, unauthorized seller triage, and C&D notices.',
  },
  {
    id: 'investor' as AccountRole,
    title: 'Capital Syndicate / Investor',
    tag: 'RLS Isolated',
    icon: DollarSign,
    desc: 'Deploy wholesale liquidity, underwrite high-deal-score inventory, and track audited portfolio yield.',
  },
  {
    id: 'logistics' as AccountRole,
    title: '3PL Logistics & Prep Partner',
    tag: 'FBA Routing',
    icon: Truck,
    desc: 'Receive palletized shipments, manage FNSKU labeling, polybagging, and cross-docking to Amazon FCs.',
  }
];

export const RegisterPage: React.FC<{ setActiveTab?: (tab: string) => void }> = ({ setActiveTab }) => {
  const { switchRole } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isConnectingAmazon, setIsConnectingAmazon] = useState<boolean>(false);
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
    agreedToRlsCompliance: false,
    amazonConnected: false
  });

  const updateField = (field: keyof WizardFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const handleConnectAmazon = async () => {
    setIsConnectingAmazon(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      updateField('sellingPartnerId', `SEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      updateField('amazonConnected', true);
      setSuccessMessage('Amazon SP-API credentials successfully connected via LWA OAuth!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsConnectingAmazon(false);
    }
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
      if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!formData.sellingPartnerId.trim()) {
        setErrorMessage('Please enter your Amazon Merchant Token or click Connect Amazon SP-API.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!formData.agreedToTerms) {
        setErrorMessage('You must agree to the Master Service Agreement and Terms of Service.');
        return false;
      }
      if (!formData.agreedToRlsCompliance) {
        setErrorMessage('You must acknowledge PostgreSQL Row-Level Security & SP-API compliance.');
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
        role: formData.role === 'brand_manager' ? 'Brand' : formData.role === 'seller' ? 'Seller' : 'Admin',
        sellingPartnerId: formData.sellingPartnerId || undefined
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('db_auth_token', `token_${Date.now()}`);
        localStorage.setItem('db_user', JSON.stringify(registeredUser));
      }

      setSuccessMessage('Account provisioned and Amazon SP-API authenticated! Unlocking full access...');
      setCurrentStep(5);

      setTimeout(() => {
        if (formData.role === 'brand_manager') {
          switchRole('Brand');
          setActiveTab?.('brand-dashboard');
        } else if (formData.role === 'seller') {
          switchRole('Seller');
          setActiveTab?.('seller-dashboard');
        } else {
          setActiveTab?.('landing');
        }
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Funnel Breadcrumb Header */}
      <div className="text-center max-w-xl mx-auto space-y-2 pt-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          ENTERPRISE ONBOARDING & AUTHENTICATION
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Organization <span className="gradient-text">Onboarding</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Follow the 4 steps to connect Amazon SP-API and unlock full dashboard access.
        </p>
      </div>

      {/* Wizard Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-3">
          {[
            { step: 1, label: '1. Role' },
            { step: 2, label: '2. Profile & Sign In' },
            { step: 3, label: '3. Amazon Integration' },
            { step: 4, label: '4. Full Access' }
          ].map(item => (
            <div key={item.step} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === item.step
                    ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/30'
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
                    ? 'text-cyan-400 font-semibold'
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
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, (currentStep / 4) * 100)}%` }}
          />
        </div>
      </div>

      {/* Card Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden bg-slate-900/90 backdrop-blur-xl">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Select Organization Role */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">Step 1 of 4</span>
              <h2 className="text-2xl font-bold text-white mt-1">Select Your Account Type</h2>
              <p className="text-slate-400 text-xs mt-1">
                Configures your specialized dashboard tools, permissions, and security policies.
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
                    className={`text-left p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500/30 shadow-xl cyan-glow'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
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

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cyan-glow transition-all"
              >
                Continue to Profile & Sign In
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Profile & Credentials */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">Step 2 of 4</span>
              <h2 className="text-2xl font-bold text-white mt-1">Company & Security Profile</h2>
              <p className="text-slate-400 text-xs mt-1">Create administrator credentials for your organization.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Administrator Full Name <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => updateField('fullName', e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Legal Business / Entity Name <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={e => updateField('companyName', e.target.value)}
                      placeholder="e.g. Apex Distribution LLC"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Corporate Work Email <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                      placeholder="admin@yourcompany.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password <span className="text-cyan-400">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => updateField('password', e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
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
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cyan-glow transition-all"
              >
                Continue to Amazon Integration
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Integration & Amazon SP-API */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">Step 3 of 4</span>
              <h2 className="text-2xl font-bold text-white mt-1">Amazon SP-API & LWA Integration</h2>
              <p className="text-slate-400 text-xs mt-1">
                Link Selling Partner API endpoints for automated sales & fee ingestion.
              </p>
            </div>

            {/* Direct Connect Action Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-cyan-400" />
                  <h4 className="font-bold text-sm text-white">One-Click Amazon LWA Authorization</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Connect Selling Partner account directly to populate token credentials and auto-sync reports.
                </p>
              </div>

              <button
                type="button"
                onClick={handleConnectAmazon}
                disabled={isConnectingAmazon}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                  formData.amazonConnected
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cyan-glow'
                }`}
              >
                {formData.amazonConnected ? (
                  <>
                    <Check className="h-4 w-4" />
                    SP-API Connected
                  </>
                ) : isConnectingAmazon ? (
                  'Exchanging LWA OAuth...'
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Connect Amazon SP-API
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Amazon Selling Partner ID / Merchant Token <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sellingPartnerId}
                  onChange={e => updateField('sellingPartnerId', e.target.value)}
                  placeholder="e.g. A21TJEXAMPLE123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Marketplace</label>
                  <select
                    value={formData.primaryMarketplace}
                    onChange={e => updateField('primaryMarketplace', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                  >
                    <option value="ATVPDKIKX0DER">United States (Amazon.com)</option>
                    <option value="A2EUQ1WTGCTBG2">Canada (Amazon.ca)</option>
                    <option value="A1F83G8C2ARO7P">United Kingdom (Amazon.co.uk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Volume Tier</label>
                  <select
                    value={formData.monthlyGmv}
                    onChange={e => updateField('monthlyGmv', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                  >
                    <option value="$100k - $500k">$100,000 - $500,000 / mo</option>
                    <option value="$500k - $2M">$500,000 - $2,000,000 / mo</option>
                    <option value="$2M+">$2,000,000+ / mo (Enterprise)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cyan-glow transition-all"
              >
                Continue to Compliance
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Compliance & Unlock Full Access */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">Step 4 of 4</span>
              <h2 className="text-2xl font-bold text-white mt-1">Unlock Full Platform Access</h2>
              <p className="text-slate-400 text-xs mt-1">Acknowledge data isolation covenants to provision session.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span>Configuration Summary</span>
                  <span className="text-cyan-400 font-mono font-bold uppercase">{formData.role}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div><span className="text-slate-500">Legal Entity:</span> {formData.companyName}</div>
                  <div><span className="text-slate-500">Admin Email:</span> {formData.email}</div>
                  <div><span className="text-slate-500">SP-API Identifier:</span> {formData.sellingPartnerId || 'Pending'}</div>
                  <div><span className="text-slate-500">Volume Tier:</span> {formData.monthlyGmv}</div>
                </div>
              </div>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={e => updateField('agreedToTerms', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Master Services Agreement & MAP Policy</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    I agree to strict adherence to Minimum Advertised Price (MAP) standards and wholesale covenants.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.agreedToRlsCompliance}
                  onChange={e => updateField('agreedToRlsCompliance', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">PostgreSQL RLS & SP-API Isolation</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    I acknowledge that proprietary catalog data and sales margins are isolated under tenant Row-Level Security.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Provisioning Full Access...' : 'Complete & Unlock Full Access'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Success & Workspace Unlock */}
        {currentStep === 5 && (
          <div className="text-center py-8 space-y-4">
            <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-2 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-white">Full Access Granted!</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
              Your organization and Amazon SP-API credentials have been authenticated. You now have full access to your workspace.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-cyan-400 font-medium bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              Redirecting to Workspace Dashboard...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;

```
