/**
 * Authentication Routes for Amazon LWA & SP-API OAuth Flow
 * Implements:
 * - GET /api/auth/amazon (OAuth Redirect)
 * - GET /api/auth/amazon/callback (Token Exchange & Database Persistence)
 * - POST /api/auth/amazon/refresh (Access Token Refresh)
 */

import { buildAmazonAuthUrl, exchangeCodeForTokens, refreshAccessToken } from '../services/lwa.js';
import { generateSignedState, verifySignedState } from '../utils/crypto.js';
import { upsertSellerCredentials, getSellerCredentials, updateSellerAccessToken } from '../db/client.js';
import { jsonResponse } from '../utils/cors.js';

/**
 * Route: GET /api/auth/amazon
 * Initiates the Amazon OAuth flow by redirecting to Amazon Seller Central or LWA
 */
export async function handleAmazonRedirect(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id') || null;
    const redirectBack = url.searchParams.get('redirect_back') || '/brand/dashboard';
    const version = url.searchParams.get('version') || 'beta';
    const mode = url.searchParams.get('mode') || 'spapi'; // 'spapi' or 'lwa_direct'
    const format = url.searchParams.get('format');

    const secret = env.CSRF_SECRET || env.LWA_CLIENT_SECRET || 'distributionbridge-secret';

    // Generate signed tamper-proof state containing user and return path
    const state = await generateSignedState(
      {
        userId,
        redirectBack,
        mode,
        createdAt: new Date().toISOString(),
      },
      secret,
      900 // 15 minutes validity
    );

    // Build the authorization URL
    const authUrl = buildAmazonAuthUrl(env, { state, version, mode });

    // If client requested JSON (e.g. SPA fetch for authorization popup/URL)
    const acceptHeader = request.headers.get('Accept') || '';
    if (format === 'json' || acceptHeader.includes('application/json')) {
      return jsonResponse(
        {
          success: true,
          authorizationUrl: authUrl,
          state: state,
          expiresInSeconds: 900,
        },
        200,
        {},
        env,
        request
      );
    }

    // Default: 302 Found redirect to Amazon OAuth consent page
    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error handling Amazon redirect:', error);
    return jsonResponse(
      {
        success: false,
        error: 'Failed to initiate Amazon OAuth authorization',
        details: error.message,
      },
      500,
      {},
      env,
      request
    );
  }
}

/**
 * Route: GET /api/auth/amazon/callback
 * Handles the OAuth callback from Amazon, exchanges authorization code for tokens,
 * and saves credentials into PostgreSQL.
 */
export async function handleAmazonCallback(request, env) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('spapi_oauth_code') || url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const sellingPartnerId = url.searchParams.get('selling_partner_id') || url.searchParams.get('merchant_id');
    const errorParam = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    const format = url.searchParams.get('format');

    const frontendBase = env.FRONTEND_URL || 'https://distributionbridge.com';

    // 1. Check if Amazon returned an error
    if (errorParam) {
      const errorMsg = errorDescription || errorParam;
      console.error('Amazon OAuth callback returned error:', errorMsg);

      if (format === 'json') {
        return jsonResponse(
          { success: false, error: 'Amazon Authorization Error', details: errorMsg },
          400,
          {},
          env,
          request
        );
      }

      return new Response(null, {
        status: 302,
        headers: {
          Location: `${frontendBase}/brand/dashboard?auth=error&message=${encodeURIComponent(errorMsg)}`,
        },
      });
    }

    // 2. Validate required code & state parameters
    if (!code) {
      const msg = 'Missing authorization code (spapi_oauth_code / code) in callback.';
      if (format === 'json') {
        return jsonResponse({ success: false, error: msg }, 400, {}, env, request);
      }
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendBase}/brand/dashboard?auth=error&message=${encodeURIComponent(msg)}` },
      });
    }

    // 3. Verify CSRF State
    const secret = env.CSRF_SECRET || env.LWA_CLIENT_SECRET || 'distributionbridge-secret';
    const stateVerification = await verifySignedState(state, secret);

    if (!stateVerification.valid) {
      console.error('State verification failed:', stateVerification.error);
      const msg = stateVerification.error || 'Invalid or expired OAuth state.';
      if (format === 'json') {
        return jsonResponse({ success: false, error: msg }, 403, {}, env, request);
      }
      return new Response(null, {
        status: 302,
        headers: { Location: `${frontendBase}/brand/dashboard?auth=error&message=${encodeURIComponent(msg)}` },
      });
    }

    const statePayload = stateVerification.payload || {};
    const userId = statePayload.userId || null;
    const redirectBack = statePayload.redirectBack || '/brand/dashboard';

    // 4. Exchange authorization code for LWA Tokens
    const tokenResponse = await exchangeCodeForTokens(env, { code });
    const { access_token, refresh_token, token_type, expires_in } = tokenResponse;

    if (!refresh_token) {
      throw new Error('Amazon did not return a refresh_token in OAuth response.');
    }

    // Derive selling partner ID (if not in callback query, use fallback or payload identifier)
    const effectiveSellingPartnerId = sellingPartnerId || `SELLER_${Date.now()}`;

    // 5. Persist credentials to PostgreSQL
    let savedSeller = null;
    try {
      savedSeller = await upsertSellerCredentials(env, {
        sellingPartnerId: effectiveSellingPartnerId,
        userId: userId,
        refreshToken: refresh_token,
        accessToken: access_token,
        expiresIn: expires_in || 3600,
        tokenType: token_type || 'bearer',
        marketplaceIds: [env.DEFAULT_MARKETPLACE_ID || 'ATVPDKIKX0DER'],
        metadata: {
          authorizedVia: 'LWA_OAuth2',
          connectedAt: new Date().toISOString(),
          stateMetadata: statePayload,
        },
      });
    } catch (dbError) {
      console.error('PostgreSQL database upsert error:', dbError);
      // If DB fails, log and return error
      throw new Error(`Database persistence failed: ${dbError.message}`);
    }

    // 6. Return response
    if (format === 'json') {
      return jsonResponse(
        {
          success: true,
          message: 'Amazon Selling Partner Account connected successfully.',
          seller: {
            id: savedSeller?.id,
            sellingPartnerId: effectiveSellingPartnerId,
            authStatus: savedSeller?.auth_status || 'connected',
            marketplaceIds: savedSeller?.marketplace_ids,
            updatedAt: savedSeller?.updated_at,
          },
        },
        200,
        {},
        env,
        request
      );
    }

    // Redirect user back to frontend dashboard with success query parameters
    const redirectUrl = new URL(redirectBack, frontendBase);
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('selling_partner_id', effectiveSellingPartnerId);

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error handling Amazon OAuth callback:', error);
    const frontendBase = env.FRONTEND_URL || 'https://distributionbridge.com';

    if (request.headers.get('Accept')?.includes('application/json')) {
      return jsonResponse(
        {
          success: false,
          error: 'Amazon OAuth Callback Exchange Failed',
          details: error.message,
        },
        500,
        {},
        env,
        request
      );
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendBase}/brand/dashboard?auth=error&message=${encodeURIComponent(error.message)}`,
      },
    });
  }
}

/**
 * Route: POST /api/auth/amazon/refresh
 * Manually or programmatically refresh access token using stored refresh token
 */
export async function handleTokenRefresh(request, env) {
  try {
    const body = await request.json();
    const { selling_partner_id } = body;

    if (!selling_partner_id) {
      return jsonResponse({ success: false, error: 'selling_partner_id is required' }, 400, {}, env, request);
    }

    const seller = await getSellerCredentials(env, selling_partner_id);
    if (!seller || !seller.refresh_token) {
      return jsonResponse(
        { success: false, error: 'No active seller credentials found for given selling_partner_id' },
        404,
        {},
        env,
        request
      );
    }

    const tokenData = await refreshAccessToken(env, seller.refresh_token);
    const updated = await updateSellerAccessToken(
      env,
      selling_partner_id,
      tokenData.access_token,
      tokenData.expires_in || 3600
    );

    return jsonResponse(
      {
        success: true,
        message: 'Access token refreshed successfully.',
        sellingPartnerId: selling_partner_id,
        expiresAt: updated?.access_token_expires_at,
      },
      200,
      {},
      env,
      request
    );
  } catch (error) {
    console.error('Error refreshing token:', error);
    return jsonResponse(
      { success: false, error: 'Token refresh failed', details: error.message },
      500,
      {},
      env,
      request
    );
  }
}
