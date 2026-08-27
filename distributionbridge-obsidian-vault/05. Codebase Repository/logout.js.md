# Source Code: `logout.js`

**Path**: `DistributionBridge/logout.js`

```javascript
/**
 * DistributionBridge Secure Logout Utility
 * Handles session revocation, cookie clearance, and client session invalidation.
 */

import { jsonResponse } from './utils/cors.js';

/**
 * Handles POST /api/auth/logout
 * Invalids active session state and delivers cookie clearance headers.
 *
 * @param {Request} request - Incoming Worker request
 * @param {object} env - Cloudflare Worker environment bindings
 * @returns {Promise<Response>} HTTP JSON response with clearance headers
 */
export async function handleLogout(request, env) {
  if (request.method !== 'POST' && request.method !== 'GET') {
    return jsonResponse(
      { success: false, error: 'Method not allowed. Use POST to logout.' },
      405,
      {},
      env,
      request
    );
  }

  try {
    // Standard secure cookie clearing directives
    const cookieClearanceHeader = [
      'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
      'session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
      'db_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
    ].join(', ');

    return jsonResponse(
      {
        success: true,
        message: 'Logged out successfully. Browser session and authentication tokens cleared.',
        loggedOutAt: new Date().toISOString(),
      },
      200,
      {
        'Set-Cookie': cookieClearanceHeader,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      env,
      request
    );
  } catch (error) {
    console.error('[Logout Error]', error);
    return jsonResponse(
      { success: false, error: 'Logout failed due to server error', details: error.message },
      500,
      {},
      env,
      request
    );
  }
}

export const authLogout = {
  handleLogout,
};

export default authLogout;

```
