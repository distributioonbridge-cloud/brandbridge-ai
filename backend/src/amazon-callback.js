/**
 * Amazon LWA & SP-API OAuth Callback Handler
 * Endpoint: GET /api/auth/amazon/callback
 * Handles OAuth callback exchange, HMAC verification, cryptographic token protection,
 * and database persistence into PostgreSQL.
 */

import { exchangeCodeForTokens } from './services/lwa.js';
import { verifySignedState } from './utils/crypto.js';
import { upsertSellerTokens } from './db.js';
import { jsonResponse } from './utils/cors.js';

export const amazonOAuth = {
  /**
   * Handles GET /api/auth/amazon/callback
   * @param {Request} request
   * @param {object} env
   * @returns {Promise<Response>}
   */
  async handleCallback(request, env) {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get('spapi_oauth_code') || url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const sellingPartnerId =
        url.searchParams.get('selling_partner_id') ||
        url.searchParams.get('merchant_id') ||
        url.searchParams.get('seller_id');
      const errorParam = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      const format = url.searchParams.get('format');
      const frontendBase = env.FRONTEND_URL || 'https://distributionbridge.com';

      // 1. Handle OAuth rejection or errors from Amazon
      if (errorParam) {
        const errorMsg = errorDescription || errorParam;
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
            Location: `${frontendBase}/seller?auth=error&message=${encodeURIComponent(errorMsg)}`,
          },
        });
      }

      // 2. Validate Authorization Code Presence
      if (!code) {
        const msg = 'Missing authorization code in callback.';
        if (format === 'json') {
          return jsonResponse({ success: false, error: msg }, 400, {}, env, request);
        }
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${frontendBase}/seller?auth=error&message=${encodeURIComponent(msg)}`,
          },
        });
      }

      // 3. Verify HMAC-SHA256 State Parameter (CSRF Protection)
      const secret =
        env.CSRF_SECRET ||
        env.AMAZON_LWA_CLIENT_SECRET ||
        env.LWA_CLIENT_SECRET ||
        'distributionbridge-secret';

      const stateVerification = await verifySignedState(state, secret);
      if (!stateVerification.valid) {
        const msg = stateVerification.error || 'Invalid or expired OAuth state.';
        if (format === 'json') {
          return jsonResponse({ success: false, error: msg }, 403, {}, env, request);
        }
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${frontendBase}/seller?auth=error&message=${encodeURIComponent(msg)}`,
          },
        });
      }

      const statePayload = stateVerification.payload || {};
      const userId = statePayload.userId || null;
      const redirectBack = statePayload.redirectBack || '/seller';

      // 4. Exchange OAuth Code for Long-Lived Tokens
      const effectiveRedirectUri = env.AMAZON_LWA_REDIRECT_URI || env.LWA_REDIRECT_URI;
      const tokenResponse = await exchangeCodeForTokens(
        {
          ...env,
          LWA_CLIENT_ID: env.AMAZON_LWA_CLIENT_ID || env.LWA_CLIENT_ID,
          LWA_CLIENT_SECRET: env.AMAZON_LWA_CLIENT_SECRET || env.LWA_CLIENT_SECRET,
          LWA_REDIRECT_URI: effectiveRedirectUri,
        },
        { code, redirectUri: effectiveRedirectUri }
      );

      const { access_token, refresh_token, token_type, expires_in } = tokenResponse;

      if (!refresh_token) {
        throw new Error('Amazon LWA did not return a refresh_token.');
      }

      const effectiveSellingPartnerId = sellingPartnerId || `SELLER_${Date.now()}`;

      // 5. Persist Seller Partner Credentials to PostgreSQL
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
          encryptionKeyActive: Boolean(env.TOKEN_ENCRYPTION_KEY),
          statePayload: statePayload,
        },
      });

      // 6. Deliver Response (JSON format or 302 redirect)
      if (format === 'json') {
        return jsonResponse(
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
      }

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
    } catch (err) {
      console.error('Amazon OAuth Callback Error:', err);
      const frontendBase = env.FRONTEND_URL || 'https://distributionbridge.com';
      const url = new URL(request.url);
      const format = url.searchParams.get('format');

      if (format === 'json') {
        return jsonResponse(
          {
            success: false,
            error: 'Failed to process Amazon OAuth callback.',
            details: err.message,
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
          Location: `${frontendBase}/seller?auth=error&message=${encodeURIComponent(err.message)}`,
        },
      });
    }
  },
};

export default amazonOAuth;
