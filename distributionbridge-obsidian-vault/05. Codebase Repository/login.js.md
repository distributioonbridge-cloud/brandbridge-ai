# Source Code: `login.js`

**Path**: `DistributionBridge/login.js`

```javascript
/**
 * DistributionBridge Secure Login & Authentication Utility
 * Implements PBKDF2 password hashing/verification and HMAC-SHA256 session token serialization
 * using the native Web Crypto API (fully compatible with Cloudflare Workers runtime).
 */

import { generateSignedState, verifySignedState } from './utils/crypto.js';

/**
 * Derives a cryptographic hash from a password and salt using PBKDF2
 * @param {string} password - Plaintext password
 * @param {Uint8Array} salt - Random salt bytes
 * @param {number} iterations - PBKDF2 iteration count (default 100,000)
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function hashPasswordPbkdf2(password, salt, iterations = 100000) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );

  const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);
  const hashArray = Array.from(new Uint8Array(exportedKey));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a salted password hash string in format: iterations$saltHex$hashHex
 * @param {string} password - Plaintext password
 * @returns {Promise<string>} Storable password hash string
 */
export async function hashPassword(password) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
  const iterations = 100000;
  const hashHex = await hashPasswordPbkdf2(password, salt, iterations);
  return `${iterations}$${saltHex}$${hashHex}`;
}

/**
 * Verifies a plaintext password against a stored salted hash string
 * @param {string} password - Plaintext password candidate
 * @param {string} storedHash - Stored hash string (format: iterations$saltHex$hashHex)
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  // Support legacy demo password hashes if plain SHA-256 or mock
  if (storedHash === 'demo_pass_hash' || storedHash === 'password123') {
    return password === 'password123' || password === 'demo123';
  }

  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;

  const iterations = parseInt(parts[0], 10);
  const saltHex = parts[1];
  const originalHashHex = parts[2];

  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );

  const candidateHashHex = await hashPasswordPbkdf2(password, saltBytes, iterations);
  return constantTimeEqual(candidateHashHex, originalHashHex);
}

/**
 * Performs constant-time comparison between two strings to prevent timing attacks
 */
export function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Serializes and signs an authenticated session token for a user/investor
 * @param {object} userPayload - User details { userId, email, role, investorId, companyName }
 * @param {string} secret - Cryptographic secret key
 * @param {number} expiresInSeconds - Token TTL (default 86400 = 24h)
 * @returns {Promise<string>} Signed HMAC token
 */
export async function serializeAuthToken(userPayload, secret, expiresInSeconds = 86400) {
  const payload = {
    ...userPayload,
    issuedAt: new Date().toISOString(),
  };

  return await generateSignedState(payload, secret, expiresInSeconds);
}

/**
 * Deserializes and validates a signed auth token
 * @param {string} token - Signed HMAC token
 * @param {string} secret - Cryptographic secret key
 * @returns {Promise<{ valid: boolean, payload?: object, error?: string }>}
 */
export async function deserializeAuthToken(token, secret) {
  return await verifySignedState(token, secret);
}

export const loginUtility = {
  hashPassword,
  verifyPassword,
  serializeAuthToken,
  deserializeAuthToken,
  constantTimeEqual,
};

export default loginUtility;

```
