/**
 * Login with Amazon (LWA) & Amazon SP-API Service
 * Handles OAuth authorization URLs, token exchange, and token refresh
 */

/**
 * Builds the Amazon Selling Partner / LWA authorization redirect URL
 * @param {object} env - Cloudflare Worker environment
 * @param {object} options - Options including signed state, version, and auth mode
 */
export function buildAmazonAuthUrl(env, { state, version = 'beta', mode = 'spapi' }) {
  const appId = env.AMAZON_APP_ID;
  const clientId = env.LWA_CLIENT_ID;
  const redirectUri = env.LWA_REDIRECT_URI;

  if (mode === 'lwa_direct') {
    if (!clientId) {
      throw new Error('LWA_CLIENT_ID is not configured in worker environment.');
    }
    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'sellingpartnerapi::notifications',
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state,
    });
    return `https://www.amazon.com/ap/oa?${params.toString()}`;
  }

  // Default: Amazon Seller Central SP-API App Consent workflow
  if (!appId) {
    throw new Error('AMAZON_APP_ID is not configured in worker environment.');
  }

  const baseUrl = env.AMAZON_AUTH_BASE_URL || 'https://sellercentral.amazon.com/apps/authorize/consent';
  const params = new URLSearchParams({
    application_id: appId,
    state: state,
  });

  if (version) {
    params.set('version', version);
  }

  if (redirectUri) {
    params.set('redirect_uri', redirectUri);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Exchanges the SP-API authorization code for LWA access and refresh tokens
 * @param {object} env - Cloudflare Worker environment
 * @param {object} params - Code and redirect URI
 * @returns {Promise<{ access_token: string, refresh_token: string, token_type: string, expires_in: number }>}
 */
export async function exchangeCodeForTokens(env, { code, redirectUri = null }) {
  const tokenUrl = env.AMAZON_TOKEN_URL || 'https://api.amazon.com/auth/o2/token';
  const clientId = env.LWA_CLIENT_ID;
  const clientSecret = env.LWA_CLIENT_SECRET;
  const effectiveRedirectUri = redirectUri || env.LWA_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new Error('LWA_CLIENT_ID or LWA_CLIENT_SECRET is missing from environment secrets.');
  }

  const bodyParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
  });

  if (effectiveRedirectUri) {
    bodyParams.set('redirect_uri', effectiveRedirectUri);
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Accept': 'application/json',
      'User-Agent': 'DistributionBridge-Backend/1.0',
    },
    body: bodyParams.toString(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorDescription = responseData.error_description || responseData.error || 'Unknown Amazon OAuth error';
    throw new Error(`Amazon LWA Token Exchange Failed (${response.status}): ${errorDescription}`);
  }

  return responseData;
}

/**
 * Refreshes an expired LWA access token using a stored long-lived refresh token
 * @param {object} env - Cloudflare Worker environment
 * @param {string} refreshToken - The stored LWA refresh token
 * @returns {Promise<{ access_token: string, token_type: string, expires_in: number }>}
 */
export async function refreshAccessToken(env, refreshToken) {
  const tokenUrl = env.AMAZON_TOKEN_URL || 'https://api.amazon.com/auth/o2/token';
  const clientId = env.LWA_CLIENT_ID;
  const clientSecret = env.LWA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('LWA_CLIENT_ID or LWA_CLIENT_SECRET is missing from environment secrets.');
  }

  const bodyParams = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Accept': 'application/json',
      'User-Agent': 'DistributionBridge-Backend/1.0',
    },
    body: bodyParams.toString(),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorDescription = responseData.error_description || responseData.error || 'Token refresh failed';
    throw new Error(`Amazon LWA Token Refresh Failed (${response.status}): ${errorDescription}`);
  }

  return responseData;
}
