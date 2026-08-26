/**
 * Universal CORS Helper Utilities for Cloudflare Workers
 * Ensures all HTTP responses include appropriate CORS headers for Next.js (port 3000), Vite (port 5173), and Production.
 */

export function getCorsHeaders(env = {}, request = null) {
  const origin = request?.headers?.get('Origin') || '';
  const configuredOrigin = env.FRONTEND_URL || 'https://distributionbridge.com';

  // Allowed origin resolution: allow port 3000, 5173, 8787, distributionbridge.com, or reflect incoming origin
  let allowOriginHeader = origin || configuredOrigin || '*';

  // If no origin header was sent (e.g. server-to-server or direct curl)
  if (!origin) {
    allowOriginHeader = configuredOrigin || '*';
  }

  return {
    'Access-Control-Allow-Origin': allowOriginHeader,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-amz-access-token, Accept',
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

/**
 * Injects CORS headers into an existing Response object
 */
export function withCors(response, request, env) {
  const corsHeaders = getCorsHeaders(env, request);
  const newHeaders = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    newHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Standard JSON Response with automatic CORS headers
 */
export function jsonResponse(data, status = 200, headers = {}, env = null, request = null) {
  const corsHeaders = getCorsHeaders(env, request);
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...headers,
    },
  });
}
