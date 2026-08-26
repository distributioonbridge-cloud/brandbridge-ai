/**
 * DistributionBridge API Client Service
 * Connects the DistributionBridge Frontend with the Cloudflare Worker Sales & SP-API Backend
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
  routes: string[];
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
  report_status: 'completed' | 'processing' | 'failed';
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlySalesResponse {
  success: boolean;
  sellingPartnerId: string;
  count: number;
  data: MonthlySalesReport[];
}

export interface SyncResult {
  success: boolean;
  message?: string;
  report?: MonthlySalesReport;
  error?: string;
  summary?: {
    totalSellers: number;
    successful: number;
    failed: number;
    results: any[];
    executedAt: string;
  };
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://distributionbridge-sales-backend.distributioonbridge.workers.dev';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.details || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function getBackendHealth(): Promise<BackendHealthResponse> {
  return fetchApi<BackendHealthResponse>('/health');
}

export async function getAmazonAuthUrl(params: {
  userId?: string;
  redirectBack?: string;
  mode?: 'spapi' | 'lwa_direct';
  version?: string;
} = {}): Promise<AuthUrlResponse> {
  const searchParams = new URLSearchParams({
    format: 'json',
    ...(params.userId ? { user_id: params.userId } : {}),
    ...(params.redirectBack ? { redirect_back: params.redirectBack } : {}),
    ...(params.mode ? { mode: params.mode } : {}),
    ...(params.version ? { version: params.version } : {}),
  });

  return fetchApi<AuthUrlResponse>(`/api/auth/amazon?${searchParams.toString()}`);
}

export function redirectToAmazonOAuth(params: {
  userId?: string;
  redirectBack?: string;
  mode?: 'spapi' | 'lwa_direct';
} = {}): void {
  const searchParams = new URLSearchParams({
    ...(params.userId ? { user_id: params.userId } : {}),
    ...(params.redirectBack ? { redirect_back: params.redirectBack } : {}),
    ...(params.mode ? { mode: params.mode } : {}),
  });

  const redirectUrl = `${API_BASE_URL}/api/auth/amazon?${searchParams.toString()}`;
  if (typeof window !== 'undefined') {
    window.location.href = redirectUrl;
  }
}

export async function getMonthlySalesData(
  sellingPartnerId: string,
  year?: number
): Promise<MonthlySalesResponse> {
  const searchParams = new URLSearchParams({
    selling_partner_id: sellingPartnerId,
    ...(year ? { year: year.toString() } : {}),
  });

  return fetchApi<MonthlySalesResponse>(`/api/sales/monthly?${searchParams.toString()}`);
}

export async function syncSellerMonthlySales(params: {
  sellingPartnerId: string;
  year?: number;
  month?: number;
  marketplaceId?: string;
}): Promise<SyncResult> {
  return fetchApi<SyncResult>('/api/sales/sync', {
    method: 'POST',
    body: JSON.stringify({
      selling_partner_id: params.sellingPartnerId,
      year: params.year,
      month: params.month,
      marketplace_id: params.marketplaceId || 'ATVPDKIKX0DER',
    }),
  });
}

export const api = {
  getBackendHealth,
  getAmazonAuthUrl,
  redirectToAmazonOAuth,
  getMonthlySalesData,
  syncSellerMonthlySales,
};

export default api;
