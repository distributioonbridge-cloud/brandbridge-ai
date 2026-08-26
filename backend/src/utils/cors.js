/**
 * CORS helper utilities for Cloudflare Workers
 */

export function getCorsHeaders(env, request) {
  const origin = request?.headers?.get('Origin') || '';
  const allowedOrigin = env.FRONTEND_URL || '*';

  // Allow matching origin, configured FRONTEND_URL, localhost in dev, or fallback
  let allowOriginHeader = allowedOrigin;
  if (origin && (origin === env.FRONTEND_URL || origin.includes('localhost') || origin.includes('distributionbridge.com'))) {
    allowOriginHeader = origin;
  }

  return {
    'Access-Control-Allow-Origin': allowOriginHeader,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleOptions(request, env) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(env, request),
  });
}

export function jsonResponse(data, status = 200, headers = {}, env = null, request = null) {
  const corsHeaders = env ? getCorsHeaders(env, request) : {};
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...headers,
    },
  });
}
