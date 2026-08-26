/**
 * DistributionBridge Integration & E2E Audit Spec
 * File: frontend/tests/integration-audit.spec.js
 *
 * Validates complete end-to-end user workflows:
 * 1. Health Diagnostics & Central Routing
 * 2. Next.js Frontend Rendering (/, /seller, /brand)
 * 3. Secure Login & PBKDF2 Token Serialization
 * 4. Tenant-Isolated RLS Data Extraction for inv_01 and inv_02
 * 5. Authenticated Capital Allocations
 * 6. Session Invalidation & Logout Cookie Clearance
 */

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✅ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`  \x1b[31m❌ FAIL:\x1b[0m ${message}`);
    failed++;
  }
}

const BACKEND_URL = process.env.BACKEND_URL || 'https://sales-backend.distributionbridge.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://distributionbridge.com';

async function runIntegrationAudit() {
  console.log('================================================================');
  console.log('🚀 DISTRIBUTIONBRIDGE INTEGRATION & E2E AUDIT RUNNER');
  console.log('================================================================');
  console.log(`📡 Backend Target:  ${BACKEND_URL}`);
  console.log(`💻 Frontend Target: ${FRONTEND_URL}\n`);

  let tokenInv01 = null;
  let tokenInv02 = null;

  // ---------------------------------------------------------------------------
  // Block 1: System Health & Diagnostic Endpoints
  // ---------------------------------------------------------------------------
  console.log('--- [Block 1] System Diagnostics & Central Engine Routing ---');
  try {
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    assert(healthRes.status === 200, 'GET /health returns HTTP 200 OK');
    const healthData = await healthRes.json();
    assert(healthData.status === 'online', 'Backend worker status is "online"');
    assert(Boolean(healthData.engines?.sourcingTriage), 'Sourcing Triage Engine active');
    assert(Boolean(healthData.engines?.portal), 'Portal Engine active');
    assert(Boolean(healthData.engines?.auth), 'Auth & Login Engine active');
  } catch (err) {
    assert(false, `Diagnostics request failed: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // Block 2: Frontend App Router Page Endpoints
  // ---------------------------------------------------------------------------
  console.log('\n--- [Block 2] Next.js App Router Page Rendering ---');
  try {
    const homeRes = await fetch(`${FRONTEND_URL}/`);
    assert(homeRes.status === 200, 'GET / (Home Dashboard) returns HTTP 200 OK');
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes('DistributionBridge') || homeHtml.includes('html'), 'Home page contains valid HTML bundle');

    const sellerRes = await fetch(`${FRONTEND_URL}/seller`);
    assert(sellerRes.status === 200, 'GET /seller (Seller Dashboard) returns HTTP 200 OK');

    const brandRes = await fetch(`${FRONTEND_URL}/brand`);
    assert(brandRes.status === 200, 'GET /brand (Brand Manager) returns HTTP 200 OK');
  } catch (err) {
    assert(false, `Frontend fetch failed: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // Block 3: User Authentication & Login Sequence
  // ---------------------------------------------------------------------------
  console.log('\n--- [Block 3] Secure Login & Token Serialization Sequence ---');
  try {
    // 1. Successful Login for 'inv_01' (Alpha Capital)
    const loginRes1 = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': FRONTEND_URL },
      body: JSON.stringify({
        email: 'alpha.capital@distributionbridge.com',
        password: 'password123',
      }),
    });
    assert(loginRes1.status === 200, 'POST /api/auth/login (inv_01) returns HTTP 200 OK');
    const loginData1 = await loginRes1.json();
    assert(loginData1.success === true, 'Authentication successful for inv_01');
    assert(Boolean(loginData1.token), 'Bearer token generated and signed');
    assert(loginData1.user?.role === 'investor', 'User role correctly assigned as "investor"');
    tokenInv01 = loginData1.token;

    // 2. Successful Login for 'inv_02' (Vanguard Syndicate)
    const loginRes2 = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': FRONTEND_URL },
      body: JSON.stringify({
        email: 'vanguard.syndicate@distributionbridge.com',
        password: 'password123',
      }),
    });
    assert(loginRes2.status === 200, 'POST /api/auth/login (inv_02) returns HTTP 200 OK');
    const loginData2 = await loginRes2.json();
    assert(loginData2.success === true, 'Authentication successful for inv_02');
    tokenInv02 = loginData2.token;

    // 3. Rejected Login with Invalid Password
    const badLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': FRONTEND_URL },
      body: JSON.stringify({
        email: 'alpha.capital@distributionbridge.com',
        password: 'wrong_password_xyz',
      }),
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login with bad password rejected with HTTP 401 Unauthorized');
  } catch (err) {
    assert(false, `Login sequence failed: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // Block 4: Tenant-Isolated RLS Data Extraction (inv_01 vs. inv_02)
  // ---------------------------------------------------------------------------
  console.log('\n--- [Block 4] Tenant-Isolated RLS Data Extraction ---');
  try {
    // 1. Query Portfolio for inv_01
    const rlsRes1 = await fetch(`${BACKEND_URL}/api/portal/investor/portfolio`, {
      headers: {
        'Authorization': `Bearer ${tokenInv01}`,
        'Origin': FRONTEND_URL,
      },
    });
    assert(rlsRes1.status === 200, 'GET /api/portal/investor/portfolio (inv_01) returns HTTP 200 OK');
    const rlsData1 = await rlsRes1.json();
    assert(rlsData1.rlsSessionActive === true, 'RLS session is active inside transaction wrapper');
    assert(rlsData1.investorId === '11111111-1111-4111-a111-111111111111', 'Data scoped strictly to inv_01');
    assert(rlsData1.allocations.every(a => a.asin !== 'B07DEF9012'), 'Zero data leakage: inv_01 cannot view inv_02 exclusive ASIN B07DEF9012');

    // 2. Query Portfolio for inv_02
    const rlsRes2 = await fetch(`${BACKEND_URL}/api/portal/investor/portfolio`, {
      headers: {
        'Authorization': `Bearer ${tokenInv02}`,
        'Origin': FRONTEND_URL,
      },
    });
    assert(rlsRes2.status === 200, 'GET /api/portal/investor/portfolio (inv_02) returns HTTP 200 OK');
    const rlsData2 = await rlsRes2.json();
    assert(rlsData2.investorId === '22222222-2222-4222-a222-222222222222', 'Data scoped strictly to inv_02');
    assert(rlsData2.allocations.every(a => a.asin !== 'B08XYZ1234'), 'Zero data leakage: inv_02 cannot view inv_01 exclusive ASIN B08XYZ1234');
  } catch (err) {
    assert(false, `RLS Data extraction failed: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // Block 5: Authenticated Capital Allocation
  // ---------------------------------------------------------------------------
  console.log('\n--- [Block 5] Authenticated Capital Allocation within RLS Context ---');
  try {
    const allocRes = await fetch(`${BACKEND_URL}/api/portal/investor/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenInv01}`,
        'Origin': FRONTEND_URL,
      },
      body: JSON.stringify({
        inventoryId: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
        allocatedUnits: 500,
        committedCapital: 14250.00,
        targetRoiPercent: 35.00,
      }),
    });
    assert(allocRes.status === 201, 'POST /api/portal/investor/allocate returns HTTP 201 Created');
    const allocData = await allocRes.json();
    assert(allocData.success === true, 'Capital allocation committed within RLS transaction');
    assert(Boolean(allocData.allocation?.id), 'Returned unique allocation record ID');
  } catch (err) {
    assert(false, `Capital allocation failed: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // Block 6: Session Invalidation & Logout Clearance
  // ---------------------------------------------------------------------------
  console.log('\n--- [Block 6] Session Invalidation & Logout Clearance ---');
  try {
    const logoutRes = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenInv01}`,
        'Origin': FRONTEND_URL,
      },
    });
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns HTTP 200 OK');
    const logoutData = await logoutRes.json();
    assert(logoutData.success === true, 'Logout confirmation received');
    const setCookie = logoutRes.headers.get('Set-Cookie') || '';
    assert(setCookie.includes('Expires=Thu, 01 Jan 1970'), 'Cookie clearance header returned with epoch expiration');
  } catch (err) {
    assert(false, `Logout request failed: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 INTEGRATION AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\x1b[32m🎉 ALL INTEGRATION & RLS DATA EXTRACTION TESTS PASSED!\x1b[0m\n');
  }
}

runIntegrationAudit().catch((err) => {
  console.error('Fatal Integration Test Error:', err);
  process.exit(1);
});
