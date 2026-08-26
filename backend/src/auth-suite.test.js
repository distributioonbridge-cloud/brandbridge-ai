/**
 * DistributionBridge Cryptographic & Authentication Test Suite
 * Executed via Vitest to verify all Web Crypto primitives, password hashing,
 * token serialization, tampering guards, and RLS session extractors.
 */

import { describe, it, expect } from 'vitest';
import { generateSignedState, verifySignedState } from './utils/crypto.js';
import { 
  hashPasswordPbkdf2, 
  hashPassword, 
  verifyPassword, 
  constantTimeEqual, 
  serializeAuthToken, 
  deserializeAuthToken 
} from './login.js';
import { auth, resolveInvestorUuid, getAuthenticatedInvestorId, isRequestAdmin } from './auth.js';
import { handleLogin } from './routes/login.js';
import { authLogout } from './logout.js';

describe('1. Cryptographic Primitives & HMAC State Verification', () => {
  const secretKey = 'super-secure-distributionbridge-test-secret-key-32-chars';

  it('should generate a valid HMAC-SHA256 signed state string with payload.signature structure', async () => {
    const payload = { userId: 'usr-9812', email: 'investor@distributionbridge.com', role: 'investor' };
    const state = await generateSignedState(payload, secretKey, 600);

    expect(state).toBeTypeOf('string');
    expect(state).toContain('.');
    
    const [encodedPayload, signature] = state.split('.');
    expect(encodedPayload.length).toBeGreaterThan(10);
    expect(signature.length).toBeGreaterThan(20);
  });

  it('should successfully verify and decode a legitimate signed state payload', async () => {
    const payload = { investorId: '11111111-1111-4111-a111-111111111111', role: 'investor' };
    const state = await generateSignedState(payload, secretKey, 900);
    const result = await verifySignedState(state, secretKey);

    expect(result.valid).toBe(true);
    expect(result.payload.investorId).toBe('11111111-1111-4111-a111-111111111111');
    expect(result.payload.role).toBe('investor');
  });

  it('should immediately reject tampered signatures or modified payloads', async () => {
    const payload = { investorId: '11111111-1111-4111-a111-111111111111', role: 'investor' };
    const state = await generateSignedState(payload, secretKey, 900);
    const tampered = state.slice(0, -6) + 'ABCDEF';

    const result = await verifySignedState(tampered, secretKey);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/signature/i);
  });

  it('should reject expired signed state tokens', async () => {
    const payload = { test: true };
    // Create token with negative TTL
    const expiredState = await generateSignedState(payload, secretKey, -30);
    const result = await verifySignedState(expiredState, secretKey);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/expired/i);
  });
});

describe('2. PBKDF2 Password Hashing & Constant-Time Security', () => {
  const plainPassword = 'EnterpriseSecurePassword2026!';

  it('should generate salted PBKDF2 hashes with 100,000 iterations', async () => {
    const hash = await hashPassword(plainPassword);

    expect(hash).toBeTypeOf('string');
    expect(hash.startsWith('100000$')).toBe(true);
    const parts = hash.split('$');
    expect(parts).toHaveLength(3);
    expect(parts[1].length).toBe(32); // 16 bytes salt in hex
    expect(parts[2].length).toBe(64); // SHA-256 hash in hex
  });

  it('should successfully verify identical plain passwords against stored salted hashes', async () => {
    const hash = await hashPassword(plainPassword);
    const isValid = await verifyPassword(plainPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password candidates against stored hashes', async () => {
    const hash = await hashPassword(plainPassword);
    const isValid = await verifyPassword('IncorrectPassword123!', hash);
    expect(isValid).toBe(false);
  });

  it('should safely execute constant-time comparison on varying string lengths', () => {
    expect(constantTimeEqual('matching-string-hash', 'matching-string-hash')).toBe(true);
    expect(constantTimeEqual('matching-string-hash', 'different-string-hash')).toBe(false);
    expect(constantTimeEqual('short', 'much-longer-string')).toBe(false);
  });
});

describe('3. Token Serialization & Deserialization Utilities', () => {
  const secretKey = 'token-encryption-secret-key-32-chars';

  it('should serialize user payloads into URL-safe signed session tokens', async () => {
    const userPayload = {
      userId: 'usr-101',
      email: 'alex@distributionbridge.com',
      role: 'investor',
      investorId: '11111111-1111-4111-a111-111111111111',
    };

    const token = await serializeAuthToken(userPayload, secretKey, 86400);
    expect(token).toBeTypeOf('string');
    expect(token).toContain('.');

    const verified = await deserializeAuthToken(token, secretKey);
    expect(verified.valid).toBe(true);
    expect(verified.payload.userId).toBe('usr-101');
    expect(verified.payload.email).toBe('alex@distributionbridge.com');
    expect(verified.payload.investorId).toBe('11111111-1111-4111-a111-111111111111');
  });
});

describe('4. Investor Identity & RLS Session Extractor', () => {
  const secretKey = 'test-secret';
  const mockEnv = { CSRF_SECRET: secretKey };

  it('should resolve investor codes into PostgreSQL UUIDs', () => {
    expect(resolveInvestorUuid('inv_01')).toBe('11111111-1111-4111-a111-111111111111');
    expect(resolveInvestorUuid('inv_02')).toBe('22222222-2222-4222-a222-222222222222');
    expect(resolveInvestorUuid('33333333-3333-3333-3333-333333333333')).toBe('33333333-3333-3333-3333-333333333333');
  });

  it('should extract investor ID from Authorization Bearer token header', async () => {
    const token = await serializeAuthToken({ investorId: '22222222-2222-4222-a222-222222222222' }, secretKey);
    const req = new Request('http://localhost:8787/api/portal/investor/portfolio', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const investorId = await getAuthenticatedInvestorId(req, mockEnv);
    expect(investorId).toBe('22222222-2222-4222-a222-222222222222');
  });

  it('should extract investor ID from X-Investor-Id header', async () => {
    const req = new Request('http://localhost:8787/api/portal/investor/portfolio', {
      headers: { 'X-Investor-Id': 'inv_01' },
    });

    const investorId = await getAuthenticatedInvestorId(req, mockEnv);
    expect(investorId).toBe('11111111-1111-4111-a111-111111111111');
  });
});

describe('5. Login & Logout API Endpoint Handlers', () => {
  const mockEnv = { CSRF_SECRET: 'test-secret-key-32-chars-long' };

  it('should authenticate valid demo credentials and return signed token', async () => {
    const req = new Request('http://localhost:8787/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alpha.capital@distributionbridge.com',
        password: 'password123',
      }),
    });

    const res = await handleLogin(req, mockEnv);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeTypeOf('string');
    expect(body.user.email).toBe('alpha.capital@distributionbridge.com');
  });

  it('should reject invalid credentials with HTTP 401 Unauthorized', async () => {
    const req = new Request('http://localhost:8787/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alpha.capital@distributionbridge.com',
        password: 'wrongpassword',
      }),
    });

    const res = await handleLogin(req, mockEnv);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('should cleanly invalidate sessions with cookie clearance headers on logout', async () => {
    const req = new Request('http://localhost:8787/api/auth/logout', { method: 'POST' });
    const res = await authLogout.handleLogout(req, mockEnv);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const cookieHeader = res.headers.get('Set-Cookie');
    expect(cookieHeader).toContain('Expires=Thu, 01 Jan 1970');
  });
});
