/**
 * DistributionBridge Monthly Sales Backend - Cloudflare Worker Entry Point
 * Implements:
 * - GET  /health (Diagnostics and DB connectivity check)
 * - GET  /api/auth/amazon (Amazon LWA / SP-API OAuth Redirection)
 * - GET  /api/auth/amazon/callback (Token Exchange & PostgreSQL Upsert via src/db.js)
 * - POST /api/auth/amazon/refresh (Token Refresh)
 * - GET  /api/sales/monthly (Monthly Sales Data)
 * - POST /api/sales/sync (Sync SP-API Monthly Sales for a single seller)
 * - POST /api/sales/sync-all (On-demand trigger for all active sellers sync)
 * - scheduled() Cron Trigger handler for background sync runs
 */

import { getDb, testDbConnection, upsertSellerTokens, getSellerByPartnerId, updateSellerAccessToken } from './db.js';
import { buildAmazonAuthUrl, exchangeCodeForTokens, refreshAccessToken } from './services/lwa.js';
import { generateSignedState, verifySignedState } from './utils/crypto.js';
import { handleGetMonthlySales, handleSyncMonthlySales } from './routes/sales.js';
import { syncAllActiveSellersMonthlySales } from './amazon_spapi.js';
import { handleOptions, jsonResponse, getCorsHeaders } from './utils/cors.js';

export default {
  /**
   * Main HTTP Request Router
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. Handle CORS Preflight
    if (method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    try {
      // -----------------------------------------------------------------------
      // Health Check & Diagnostics Route
      // -----------------------------------------------------------------------
      if (path === '/' || path === '/health') {
        const dbDiagnosis = await testDbConnection(env);

        return jsonResponse(
          {
            service: 'DistributionBridge Monthly Sales Backend',
            status: 'online',
            environment: env.ENVIRONMENT || 'production',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            database: dbDiagnosis,
            cronScheduled: true,
            routes: [
              'GET  /health (Diagnostics & Database Health)',
              'GET  /api/auth/amazon (Amazon LWA / SP-API OAuth Redirect)',
              'GET  /api/auth/amazon/callback (OAuth Token Exchange & PostgreSQL Upsert)',
              'POST /api/auth/amazon/refresh (Token Refresh)',
              'GET  /api/sales/monthly (Monthly Sales Data)',
              'POST /api/sales/sync (Sync SP-API Monthly Sales for Single Seller)',
              'POST /api/sales/sync-all (Trigger Background Sync for All Active Sellers)',
            ],
          },
          200,
          {},
          env,
          request
        );
      }

      // -----------------------------------------------------------------------
      // Route: GET /api/auth/amazon (OAuth Redirect)
      // -----------------------------------------------------------------------
      if (path === '/api/auth/amazon' && method === 'GET') {
        const userId = url.searchParams.get('user_id') || null;
        const redirectBack = url.searchParams.get('redirect_back') || '/brand/dashboard';
        const version = url.searchParams.get('version') || 'beta';
        const mode = url.searchParams.get('mode') || 'spapi';
        const format = url.searchParams.get('format');

        const secret = env.CSRF_SECRET || env.LWA_CLIENT_SECRET || 'distributionbridge-secret';

        // Generate HMAC-SHA256 signed tamper-proof state
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

        const authUrl = buildAmazonAuthUrl(env, { state, version, mode });

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

        return new Response(null, {
          status: 302,
          headers: {
            Location: authUrl,
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        });
      }

      // -----------------------------------------------------------------------
      // Route: GET /api/auth/amazon/callback (Token Exchange & DB Persistence)
      // -----------------------------------------------------------------------
      if (path === '/api/auth/amazon/callback' && method === 'GET') {
        const code = url.searchParams.get('spapi_oauth_code') || url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const sellingPartnerId = url.searchParams.get('selling_partner_id') || url.searchParams.get('merchant_id') || url.searchParams.get('seller_id');
        const errorParam = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');
        const format = url.searchParams.get('format');
        const frontendBase = env.FRONTEND_URL || 'https://distributionbridge.com';

        // Check if Amazon returned an authorization error
        if (errorParam) {
          const errorMsg = errorDescription || errorParam;
          console.error('Amazon OAuth callback error:', errorMsg);

          if (format === 'json') {
            return jsonResponse({ success: false, error: 'Amazon Authorization Error', details: errorMsg }, 400, {}, env, request);
          }

          return new Response(null, {
            status: 302,
            headers: {
              Location: `${frontendBase}/brand/dashboard?auth=error&message=${encodeURIComponent(errorMsg)}`,
            },
          });
        }

        // Validate code parameter
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

        // Verify CSRF State
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

        // Exchange Authorization Code for LWA Tokens
        const tokenResponse = await exchangeCodeForTokens(env, { code });
        const { access_token, refresh_token, token_type, expires_in } = tokenResponse;

        if (!refresh_token) {
          throw new Error('Amazon LWA did not return a refresh_token.');
        }

        const effectiveSellingPartnerId = sellingPartnerId || `SELLER_${Date.now()}`;

        // Persist Seller Credentials to PostgreSQL using src/db.js
        const savedRecord = await upsertSellerTokens(env, {
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
            statePayload: statePayload,
          },
        });

        // Return JSON response if requested
        if (format === 'json') {
          return jsonResponse(
            {
              success: true,
              message: 'Amazon Seller Partner Account connected and persisted successfully.',
              seller: {
                id: savedRecord?.id,
                sellingPartnerId: effectiveSellingPartnerId,
                authStatus: savedRecord?.auth_status || 'connected',
                marketplaceIds: savedRecord?.marketplace_ids,
                updatedAt: savedRecord?.updated_at,
              },
            },
            200,
            {},
            env,
            request
          );
        }

        // Redirect back to frontend dashboard with success parameters
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
      }

      // -----------------------------------------------------------------------
      // Route: POST /api/auth/amazon/refresh (Token Refresh)
      // -----------------------------------------------------------------------
      if (path === '/api/auth/amazon/refresh' && method === 'POST') {
        const body = await request.json();
        const { selling_partner_id } = body;

        if (!selling_partner_id) {
          return jsonResponse({ success: false, error: 'selling_partner_id is required' }, 400, {}, env, request);
        }

        const seller = await getSellerByPartnerId(env, selling_partner_id);
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
      }

      // -----------------------------------------------------------------------
      // Monthly Sales Routes
      // -----------------------------------------------------------------------
      if (path === '/api/sales/monthly' && method === 'GET') {
        return await handleGetMonthlySales(request, env);
      }

      if (path === '/api/sales/sync' && method === 'POST') {
        return await handleSyncMonthlySales(request, env);
      }

      // -----------------------------------------------------------------------
      // Route: POST /api/sales/sync-all (On-demand trigger for all active sellers)
      // -----------------------------------------------------------------------
      if (path === '/api/sales/sync-all' && method === 'POST') {
        const syncSummary = await syncAllActiveSellersMonthlySales(env);
        return jsonResponse(
          {
            success: true,
            message: 'Background sales synchronization completed for active sellers.',
            summary: syncSummary,
          },
          200,
          {},
          env,
          request
        );
      }

      // -----------------------------------------------------------------------
      // 404 Fallback
      // -----------------------------------------------------------------------
      return jsonResponse(
        {
          success: false,
          error: 'Route not found',
          path: path,
          method: method,
        },
        404,
        {},
        env,
        request
      );
    } catch (error) {
      console.error('Unhandled Worker Error:', error);
      return jsonResponse(
        {
          success: false,
          error: 'Internal Server Error',
          message: error.message,
        },
        500,
        {},
        env,
        request
      );
    }
  },

  /**
   * Cloudflare Workers Scheduled Cron Trigger Handler
   * Automatically executes periodic SP-API data ingestion for all connected sellers
   */
  async scheduled(event, env, ctx) {
    console.log(`[Scheduled Cron] Triggered by cron schedule: ${event.cron} at ${new Date().toISOString()}`);

    ctx.waitUntil(
      (async () => {
        try {
          const syncSummary = await syncAllActiveSellersMonthlySales(env);
          console.log('[Scheduled Cron] Background sales sync summary:', JSON.stringify(syncSummary));
        } catch (error) {
          console.error('[Scheduled Cron] Fatal error during scheduled sync execution:', error);
        }
      })()
    );
  },
};
