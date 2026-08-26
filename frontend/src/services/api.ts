/**
 * DistributionBridge API Client Service
 * Connects the Next.js Frontend with the Unified Cloudflare Worker Backend
 */

export interface DatabaseStatus {
  status: 'connected' | 'disconnected' | 'not_configured';
  database?: string;
  version?: string;
  error?: string;
  message?: string;
}

export interface BackendHealthResponse {
  service: string;
  status: 'online' | 'degraded' | 'offline';
  environment: string;
  version: string;
  timestamp: string;
  database: DatabaseStatus;
  cronScheduled?: boolean;
  engines: Record<string, string>;
}

export interface AuthUrlResponse {
  success: boolean;
  authorizationUrl: string;
  state: string;
  expiresInSeconds: number;
}

export interface SellerAccount {
  id: string;
  sellingPartnerId: string;
  accountName?: string;
  authStatus: 'connected' | 'revoked' | 'expired' | 'sync_error';
  marketplaceIds: string[];
  lastSyncAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AsinBreakdownItem {
  asin: string;
  title: string;
  units: number;
  sales: number;
}

export interface MonthlySalesReport {
  id: string;
  selling_partner_id: string;
  marketplace_id: string;
  year: number;
  month: number;
  total_ordered_units: number;
  total_ordered_items: number;
  total_sales_amount: number;
  currency_code: string;
  average_selling_price: number;
  total_orders_count: number;
  fba_units_shipped: number;
  fbm_units_shipped: number;
  asin_breakdown: AsinBreakdownItem[];
  report_status: string;
  synced_at?: string;
  updated_at?: string;
}

export interface SourcingTriageResult {
  asin: string;
  title?: string;
  costPrice?: number;
  retailPrice?: number;
  mapPrice?: number;
  grossMarginAmount?: number;
  grossMarginPercent?: number;
  roiPercent?: number;
  dealScore: number;
  verdict: 'APPROVE_FOR_WHOLESALE' | 'REQUIRES_FURTHER_AUDIT' | 'REJECT_HIGH_RISK';
  warnings: string[];
  recommendations: string[];
  evaluatedAt?: string;
  financials: {
    costPrice: number;
    retailPrice: number;
    mapPrice: number;
    netMarginPercent: number;
    grossMarginAmount: number;
    netProfitPerUnit?: number;
    referralFee?: number;
    totalUnitCost?: number;
    roiPercent: number;
    fbaFeeEstimate?: number;
  };
  riskAssessment?: {
    flags: string[];
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  metrics?: {
    fbaCompetitors: number;
    isAmazonSelling: boolean;
  };
}

export interface WarehouseInfo {
  id: string;
  name: string;
  state: string;
  city: string;
  fbaHubTransitDays: number;
  palletStorageRateMonthly: number;
  fnskuLabelingFee: number;
  polybagFee: number;
  crossDockFee: number;
}

export interface LogisticsQuote {
  quoteId: string;
  units: number;
  totalWeightLbs: number;
  warehouse: WarehouseInfo;
  costBreakdown: {
    prepAndLabeling: number;
    polybagging: number;
    palletStorage: number;
    estimatedFreightToFba: number;
    totalLogisticsCost: number;
    costPerUnit: number;
  };
  estimatedTransitTimeDays: number;
  readyDate: string;
}

export interface MasterDistributor {
  id: string;
  name: string;
  categories: string[];
  region: string;
  minOrderAmount: number;
  exclusiveFbaAuthorized: boolean;
  activeBrandsCount: number;
  leadTimeDays: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'investor' | 'brand_manager' | 'seller' | 'admin';
  companyName?: string;
  investorId?: string;
  sellingPartnerId?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: AuthUser;
  error?: string;
}

export interface InvestorPortfolioData {
  investorId: string;
  sessionRlsActive: boolean;
  portfolio: {
    investor_id?: string;
    total_invested_capital: string;
    current_asset_valuation: string;
    realized_pnl: string;
    active_deals_count: number;
    portfolio_status: string;
  };
  allocations: Array<{
    id: string;
    asin: string;
    sku: string;
    allocated_units: number;
    committed_capital: string;
    target_roi_percent: string;
    status: string;
    warehouse_id: string;
  }>;
}

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://sales-backend.distributionbridge.com';

/**
 * Base fetch wrapper with error handling and authentication token injection
 */
async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BACKEND_BASE_URL}${path}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('db_auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    mode: 'cors',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data as T;
}

// -----------------------------------------------------------------------------
// Authentication & Session API
// -----------------------------------------------------------------------------
export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await fetchApi<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.success && data.token && typeof window !== 'undefined') {
    localStorage.setItem('db_auth_token', data.token);
    localStorage.setItem('db_user', JSON.stringify(data.user));
  }

  return data;
}

export async function logout(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetchApi<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('db_auth_token');
      localStorage.removeItem('db_user');
    }
    return res;
  } catch (err) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('db_auth_token');
      localStorage.removeItem('db_user');
    }
    return { success: true, message: 'Logged out locally' };
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('db_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Health Diagnostics API
// -----------------------------------------------------------------------------
export async function getBackendHealth(): Promise<BackendHealthResponse> {
  return fetchApi<BackendHealthResponse>('/health');
}

// -----------------------------------------------------------------------------
// Amazon SP-API & LWA OAuth API
// -----------------------------------------------------------------------------
export async function getAmazonAuthUrl(params: {
  userId?: string;
  redirectBack?: string;
  version?: 'beta' | 'production';
  mode?: 'spapi' | 'lwa_direct';
} = {}): Promise<AuthUrlResponse> {
  const query = new URLSearchParams({
    format: 'json',
    ...(params.userId && { user_id: params.userId }),
    ...(params.redirectBack && { redirect_back: params.redirectBack }),
    ...(params.version && { version: params.version }),
    ...(params.mode && { mode: params.mode }),
  }).toString();

  return fetchApi<AuthUrlResponse>(`/api/auth/amazon?${query}`);
}

export function redirectToAmazonOAuth(params: {
  userId?: string;
  redirectBack?: string;
  version?: 'beta' | 'production';
  mode?: 'spapi' | 'lwa_direct';
} = {}): void {
  const query = new URLSearchParams({
    ...(params.userId && { user_id: params.userId }),
    ...(params.redirectBack && { redirect_back: params.redirectBack }),
    ...(params.version && { version: params.version }),
    ...(params.mode && { mode: params.mode }),
  }).toString();

  window.location.href = `${BACKEND_BASE_URL}/api/auth/amazon?${query}`;
}

export async function refreshSellerAccessToken(sellingPartnerId: string): Promise<{
  success: boolean;
  accessToken: string;
  expiresIn: number;
  expiresAt?: string;
}> {
  return fetchApi<{ success: boolean; accessToken: string; expiresIn: number; expiresAt?: string }>(
    `/api/auth/amazon/refresh?seller_id=${encodeURIComponent(sellingPartnerId)}`
  );
}

// -----------------------------------------------------------------------------
// Monthly Sales API
// -----------------------------------------------------------------------------
export async function getMonthlySalesData(
  sellingPartnerId: string,
  year?: number
): Promise<{ success: boolean; reports: MonthlySalesReport[]; data: MonthlySalesReport[]; count: number }> {
  const query = new URLSearchParams({
    seller_id: sellingPartnerId,
    ...(year && { year: year.toString() }),
  }).toString();

  const res = await fetchApi<{ success: boolean; reports: MonthlySalesReport[]; data?: MonthlySalesReport[]; count: number }>(
    `/api/sales/monthly?${query}`
  );

  const reports = res.reports || res.data || [];
  return {
    success: res.success ?? true,
    reports,
    data: reports,
    count: res.count ?? reports.length,
  };
}

export async function syncSellerMonthlySales(
  arg1: string | { sellingPartnerId: string; year: number; month: number },
  arg2?: number,
  arg3?: number
): Promise<{ success: boolean; report: MonthlySalesReport; message: string }> {
  const sellingPartnerId = typeof arg1 === 'object' ? arg1.sellingPartnerId : arg1;
  const year = typeof arg1 === 'object' ? arg1.year : arg2!;
  const month = typeof arg1 === 'object' ? arg1.month : arg3!;

  return fetchApi<{ success: boolean; report: MonthlySalesReport; message: string }>(
    '/api/sales/monthly/sync',
    {
      method: 'POST',
      body: JSON.stringify({
        sellingPartnerId,
        year,
        month,
      }),
    }
  );
}

export async function triggerSyncAllActiveSellers(): Promise<{
  success: boolean;
  totalActiveSellers: number;
  syncedCount: number;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
}> {
  return fetchApi<{
    success: boolean;
    totalActiveSellers: number;
    syncedCount: number;
    summary?: { total: number; successful: number; failed: number };
  }>('/api/sales/sync-all', { method: 'POST' });
}

// -----------------------------------------------------------------------------
// Sourcing Triage Engine API
// -----------------------------------------------------------------------------
export async function evaluateSourcingDeal(dealParams: {
  asin: string;
  title?: string;
  costPrice: number;
  retailPrice: number;
  mapPrice?: number;
  fbaFeeEstimate?: number;
  fbaCompetitors?: number;
  isAmazonSelling?: boolean;
}): Promise<{ success: boolean; triage: SourcingTriageResult }> {
  return fetchApi<{ success: boolean; triage: SourcingTriageResult }>('/api/sourcing/triage', {
    method: 'POST',
    body: JSON.stringify(dealParams),
  });
}

// -----------------------------------------------------------------------------
// Logistics Engine API
// -----------------------------------------------------------------------------
export async function getLogisticsWarehouses(): Promise<{
  success: boolean;
  network: string;
  count: number;
  warehouses: WarehouseInfo[];
}> {
  return fetchApi<{ success: boolean; network: string; count: number; warehouses: WarehouseInfo[] }>(
    '/api/logistics/warehouses'
  );
}

export async function calculateLogisticsQuote(params: {
  units: number;
  weightLbsPerUnit?: number;
  warehouseId?: string;
  destinationFbaHub?: string;
  requirePolybag?: boolean;
  requireFnskuLabeling?: boolean;
  requirePalletization?: boolean;
}): Promise<{ success: boolean; quote: LogisticsQuote }> {
  return fetchApi<{ success: boolean; quote: LogisticsQuote }>('/api/logistics', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// -----------------------------------------------------------------------------
// Portal & Investor RLS API
// -----------------------------------------------------------------------------
export async function getPortalSummary(): Promise<any> {
  return fetchApi<any>('/api/portal');
}

export async function getPortalDistributors(): Promise<{
  success: boolean;
  distributors: MasterDistributor[];
  count: number;
}> {
  return fetchApi<{ success: boolean; distributors: MasterDistributor[]; count: number }>(
    '/api/portal/distributors'
  );
}

export async function getInvestorPortfolio(investorId?: string): Promise<{
  success: boolean;
  rlsSessionActive: boolean;
  portfolio: any;
  allocations: any[];
}> {
  const query = investorId ? `?investor_id=${encodeURIComponent(investorId)}` : '';
  return fetchApi<{ success: boolean; rlsSessionActive: boolean; portfolio: any; allocations: any[] }>(
    `/api/portal/investor/portfolio${query}`
  );
}

export async function allocateInvestorCapital(allocationParams: {
  inventoryId: string;
  allocatedUnits: number;
  committedCapital: number;
  targetRoiPercent?: number;
  investorId?: string;
}): Promise<{ success: boolean; message: string; allocation: any }> {
  return fetchApi<{ success: boolean; message: string; allocation: any }>('/api/portal/investor/allocate', {
    method: 'POST',
    body: JSON.stringify(allocationParams),
  });
}

export const api = {
  login,
  logout,
  getCurrentUser,
  getBackendHealth,
  getAmazonAuthUrl,
  redirectToAmazonOAuth,
  refreshSellerAccessToken,
  getMonthlySalesData,
  syncSellerMonthlySales,
  triggerSyncAllActiveSellers,
  evaluateSourcingDeal,
  getLogisticsWarehouses,
  calculateLogisticsQuote,
  getPortalSummary,
  getPortalDistributors,
  getInvestorPortfolio,
  allocateInvestorCapital,
};

export default api;
