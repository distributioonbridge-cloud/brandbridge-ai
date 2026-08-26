/**
 * Cryptographic utilities for secure state generation and verification using Web Crypto API
 */

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getHmacKey(secret) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret || 'default-distributionbridge-oauth-secret-fallback'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Generates a signed, tamper-proof state parameter containing metadata and expiration
 * @param {object} payload - Custom metadata (e.g. { userId, redirectBack, nonce })
 * @param {string} secret - Secret key (CSRF_SECRET)
 * @param {number} expiresInSeconds - Lifetime in seconds (default 15 minutes = 900s)
 * @returns {Promise<string>} Signed state string in format: payloadBase64.signatureBase64
 */
export async function generateSignedState(payload = {}, secret, expiresInSeconds = 900) {
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const expiresAt = timestamp + expiresInSeconds * 1000;

  const stateData = {
    ...payload,
    nonce,
    timestamp,
    expiresAt,
  };

  const jsonStr = JSON.stringify(stateData);
  const enc = new TextEncoder();
  const payloadBytes = enc.encode(jsonStr);
  const payloadBase64 = base64UrlEncode(payloadBytes);

  const key = await getHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadBase64));
  const signatureBase64 = base64UrlEncode(signatureBuffer);

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies a signed state parameter and returns the original payload if valid
 * @param {string} state - The signed state string
 * @param {string} secret - Secret key (CSRF_SECRET)
 * @returns {Promise<{ valid: boolean, payload?: object, error?: string }>}
 */
export async function verifySignedState(state, secret) {
  if (!state || typeof state !== 'string') {
    return { valid: false, error: 'State parameter is missing or invalid' };
  }

  const parts = state.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid state format. Expected 2 parts separated by a dot.' };
  }

  const [payloadBase64, signatureBase64] = parts;

  try {
    const key = await getHmacKey(secret);
    const enc = new TextEncoder();
    const signatureBuffer = base64UrlDecode(signatureBase64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      enc.encode(payloadBase64)
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid state signature - potential CSRF tampering' };
    }

    const payloadBuffer = base64UrlDecode(payloadBase64);
    const dec = new TextDecoder();
    const payload = JSON.parse(dec.decode(payloadBuffer));

    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return { valid: false, error: 'OAuth state has expired. Please initiate login again.' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: `Failed to decode state: ${err.message}` };
  }
}
