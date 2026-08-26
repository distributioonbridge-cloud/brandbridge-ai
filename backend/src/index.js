/**
 * DistributionBridge Unified Cloudflare Worker Central Router
 * Centralizes dispatch for:
 * - /api/sourcing/triage -> Sourcing Triage Engine
 * - /api/logistics       -> 3PL Logistics & FBA Prep Engine
 * - /api/portal          -> Brand & Seller Portal Engine
 * - /api/auth/*          -> Amazon SP-API & LWA OAuth Engine
 * - /api/sales/*         -> Monthly Sales Ingestion Engine
 * - /health              -> Edge & PostgreSQL Diagnostics
 * Ensures universal CORS headers on all responses for Next.js (port 3000) and production.
 */

import { testDbConnection, upsertSellerTokens, getSellerByPartnerId, updateSellerAccessToken } from './db.js';
import { buildAmazonAuthUrl, exchangeCodeForTokens, refreshAccessToken } from './services/lwa.js';
import { generateSignedState, verifySignedState } from './utils/crypto.js';
import { handleGetMonthlySales, handleSyncMonthlySales } from './routes/sales.js';
import { handleSourcingTriage } from './routes/triage.js';
import { handleLogistics } from './routes/logistics.js';
import { handlePortal } from './routes/portal.js';
import { handleLogin } from './routes/login.js';
import { syncAllActiveSellersMonthlySales } from './amazon_spapi.js';
import { handleOptions, jsonResponse, withCors } from './utils/cors.js';

export default {
  /**
   * Main HTTP Request Router
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. Universal CORS Preflight Handling
    if (method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    try {
      let response;

      // -----------------------------------------------------------------------
      // 1. Health & Diagnostics Route
      // -----------------------------------------------------------------------
      if (path === '/' || path === '/health') {
        const dbDiagnosis = await testDbConnection(env);

        response = jsonResponse(
          {
            service: 'DistributionBridge Unified API Engine',
            status: 'online',
            environment: env.ENVIRONMENT || 'production',
            version: '1.2.0',
            timestamp: new Date().toISOString(),
            database: dbDiagnosis,
            cronScheduled: true,
            engines: {
              sourcingTriage: '/api/sourcing/triage (AI Wholesale Deal Evaluation)',
              logistics: '/api/logistics (3PL Warehouses & FBA Prep Quotes)',
              portal: '/api/portal (Brand & Seller Portal Governance)',
              auth: '/api/auth/amazon (Amazon LWA & SP-API OAuth2)',
              sales: '/api/sales/monthly (SP-API Sales Reports & Sync)',
            },
          },
          200,
          {},
          env,
          request
        );
      }

      // -----------------------------------------------------------------------
      // 2. Sourcing Triage Engine (/api/sourcing/triage)
      // -----------------------------------------------------------------------
      else if (path.startsWith('/api/sourcing/triage') || path.startsWith('/api/sourcing')) {
        response = await handleSourcingTriage(request, env);
      }

      // -----------------------------------------------------------------------
      // 3. Logistics Engine (/api/logistics)
      // -----------------------------------------------------------------------
      else if (path.startsWith('/api/logistics')) {
        response = await handleLogistics(request, env);
      }

      // -----------------------------------------------------------------------
      // 4. Portal Engine (/api/portal)
      // -----------------------------------------------------------------------
      else if (path.startsWith('/api/portal')) {
        response = await handlePortal(request, env);
      }

      // -----------------------------------------------------------------------
      // 5. User Authentication & Login (/api/auth/login)
      // -----------------------------------------------------------------------
      else if (path === '/api/auth/login' && method === 'POST') {
        response = await handleLogin(request, env);
      }

      // -----------------------------------------------------------------------
      // 6. Amazon SP-API & LWA OAuth Routes (/api/auth/amazon)
      // -----------------------------------------------------------------------
      else if (path === '/api/auth/amazon' && method === 'GET') {
        const userId = url.searchParams.get('user_id') || null;
        const redirectBack = url.searchParams.get('redirect_back') || '/seller';
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
          response = jsonResponse(
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
        } else {
          response = new Response(null, {
            status: 302,
            headers: {
              Location: authUrl,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          });
        }
      }

      else if (path === '/api/auth/amazon/callback' && method === 'GET') {
        const code = url.searchParams.get('spapi_oauth_code') || url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const sellingPartnerId = url.searchParams.get('selling_partner_id') || url.searchParams.get('merchant_id') || url.searchParams.get('seller_id');
        const errorParam = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');
        const format = url.searchParams.get('format');
        const frontendBase = env.FRONTEND_URL || 'https://distributionbridge.com';

        if (errorParam) {
          const errorMsg = errorDescription || errorParam;
          if (format === 'json') {
            response = jsonResponse({ success: false, error: 'Amazon Authorization Error', details: errorMsg }, 400, {}, env, request);
          } else {
            response = new Response(null, {
              status: 302,
              headers: { Location: `${frontendBase}/seller?auth=error&message=${encodeURIComponent(errorMsg)}` },
            });
          }
        } else if (!code) {
          const msg = 'Missing authorization code in callback.';
          if (format === 'json') {
            response = jsonResponse({ success: false, error: msg }, 400, {}, env, request);
          } else {
            response = new Response(null, {
              status: 302,
              headers: { Location: `${frontendBase}/seller?auth=error&message=${encodeURIComponent(msg)}` },
            });
          }
        } else {
          const secret = env.CSRF_SECRET || env.LWA_CLIENT_SECRET || 'distributionbridge-secret';
          const stateVerification = await verifySignedState(state, secret);

          if (!stateVerification.valid) {
            const msg = stateVerification.error || 'Invalid or expired OAuth state.';
            if (format === 'json') {
              response = jsonResponse({ success: false, error: msg }, 403, {}, env, request);
            } else {
              response = new Response(null, {
                status: 302,
                headers: { Location: `${frontendBase}/seller?auth=error&message=${encodeURIComponent(msg)}` },
              });
            }
          } else {
            const statePayload = stateVerification.payload || {};
            const userId = statePayload.userId || null;
            const redirectBack = statePayload.redirectBack || '/seller';

            const tokenResponse = await exchangeCodeForTokens(env, { code });
            const { access_token, refresh_token, token_type, expires_in } = tokenResponse;

            if (!refresh_token) {
              throw new Error('Amazon LWA did not return a refresh_token.');
            }

            const effectiveSellingPartnerId = sellingPartnerId || `SELLER_${Date.now()}`;

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

            if (format === 'json') {
              response = jsonResponse(
                {
                  success: true,
                  message: 'Amazon Seller Partner Account connected and persisted successfully.',
                  seller: savedRecord,
                },
                200,
                {},
                env,
                request
              );
            } else {
              const redirectUrl = new URL(redirectBack, frontendBase);
              redirectUrl.searchParams.set('auth', 'success');
              redirectUrl.searchParams.set('selling_partner_id', effectiveSellingPartnerId);

              response = new Response(null, {
                status: 302,
                headers: {
                  Location: redirectUrl.toString(),
                  'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
              });
            }
          }
        }
      }

      else if (path === '/api/auth/amazon/refresh' && method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const { selling_partner_id } = body;

        if (!selling_partner_id) {
          response = jsonResponse({ success: false, error: 'selling_partner_id is required' }, 400, {}, env, request);
        } else {
          const seller = await getSellerByPartnerId(env, selling_partner_id);
          if (!seller || !seller.refresh_token) {
            response = jsonResponse(
              { success: false, error: 'No active seller credentials found for given selling_partner_id' },
              404,
              {},
              env,
              request
            );
          } else {
            const tokenData = await refreshAccessToken(env, seller.refresh_token);
            const updated = await updateSellerAccessToken(
              env,
              selling_partner_id,
              tokenData.access_token,
              tokenData.expires_in || 3600
            );

            response = jsonResponse(
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
        }
      }

      // -----------------------------------------------------------------------
      // 6. Monthly Sales Ingestion Routes (/api/sales/*)
      // -----------------------------------------------------------------------
      else if (path === '/api/sales/monthly' && method === 'GET') {
        response = await handleGetMonthlySales(request, env);
      }

      else if (path === '/api/sales/sync' && method === 'POST') {
        response = await handleSyncMonthlySales(request, env);
      }

      else if (path === '/api/sales/sync-all' && method === 'POST') {
        const syncSummary = await syncAllActiveSellersMonthlySales(env);
        response = jsonResponse(
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
      // 7. 404 Fallback
      // -----------------------------------------------------------------------
      else {
        response = jsonResponse(
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
      }

      // Enforce CORS headers on every response
      return withCors(response, request, env);
    } catch (error) {
      console.error('[Central Router Fatal Error]:', error);
      const errResponse = jsonResponse(
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
      return withCors(errResponse, request, env);
    }
  },

  /**
   * Cloudflare Workers Scheduled Cron Trigger Handler
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
