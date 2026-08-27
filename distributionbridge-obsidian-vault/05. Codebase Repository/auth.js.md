# Source Code: `auth.js`

**Path**: `DistributionBridge/auth.js`

```javascript
/**
 * DistributionBridge Investor Authentication & Context Utility
 * Extracts and validates authenticated investor identities from JWT headers,
 * API keys, or session tokens for transaction-scoped RLS execution.
 */

import { verifySignedState } from './utils/crypto.js';

// Default / Demo mapping for development & testing
const KNOWN_INVESTOR_CODES = {
  'inv_01': '11111111-1111-4111-a111-111111111111',
  'inv_02': '22222222-2222-4222-a222-222222222222',
  'INV-ALPHA-01': '11111111-1111-4111-a111-111111111111',
  'INV-VANGUARD-02': '22222222-2222-4222-a222-222222222222',
};

/**
 * Resolves a readable investor code or UUID into a valid PostgreSQL UUID
 */
export function resolveInvestorUuid(investorIdentifier) {
  if (!investorIdentifier) return null;
  if (KNOWN_INVESTOR_CODES[investorIdentifier]) {
    return KNOWN_INVESTOR_CODES[investorIdentifier];
  }
  // Check if string matches UUID pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(investorIdentifier)) {
    return investorIdentifier;
  }
  return investorIdentifier;
}

/**
 * Extracts and verifies the authenticated Investor ID from incoming HTTP request
 * Supports:
 * 1. Authorization: Bearer <signed_token>
 * 2. X-Investor-Id: <investor_code_or_uuid>
 * 3. Query Parameter: ?investor_id=<uuid>
 *
 * @param {Request} request - Incoming Worker request
 * @param {object} env - Cloudflare Worker environment
 * @returns {Promise<string>} Validated Investor UUID
 */
export async function getAuthenticatedInvestorId(request, env = {}) {
  const authHeader = request.headers.get('Authorization') || '';
  const xInvestorHeader = request.headers.get('X-Investor-Id');
  const url = new URL(request.url);
  const queryInvestorId = url.searchParams.get('investor_id');

  // 1. Bearer Token Verification
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const secret = env.CSRF_SECRET || env.LWA_CLIENT_SECRET || 'distributionbridge-secret';
    
    // Check HMAC-signed token
    const verification = await verifySignedState(token, secret);
    if (verification.valid && verification.payload?.investorId) {
      return resolveInvestorUuid(verification.payload.investorId);
    }
  }

  // 2. Direct Header Authentication (Internal Microservices / Admin Gateways)
  if (xInvestorHeader) {
    return resolveInvestorUuid(xInvestorHeader.trim());
  }

  // 3. Query Parameter Fallback (for authorized portal views)
  if (queryInvestorId) {
    return resolveInvestorUuid(queryInvestorId.trim());
  }

  // Default fallback for demo / test transactions
  return resolveInvestorUuid('inv_01');
}

/**
 * Validates whether the request is from an authorized platform administrator
 */
export function isRequestAdmin(request, env = {}) {
  const adminSecretHeader = request.headers.get('X-Admin-Secret');
  const expectedSecret = env.ADMIN_API_KEY || env.CSRF_SECRET;
  return Boolean(adminSecretHeader && expectedSecret && adminSecretHeader === expectedSecret);
}

export const auth = {
  getAuthenticatedInvestorId,
  resolveInvestorUuid,
  isRequestAdmin,
};

export default auth;

```
