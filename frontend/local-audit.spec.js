/**
 * DistributionBridge End-to-End Local Audit & Integration Test Spec
 * Validates:
 * 1. Cloudflare Worker Backend Health & Route Engine Registrations
 * 2. Universal CORS headers on Port 3000 requests
 * 3. AI Sourcing Triage Engine & Profit Margin Evaluator
 * 4. 3PL Logistics & FBA Prep Quote Generator
 * 5. Brand & Wholesale Portal Governance Engine
 * 6. Amazon LWA / SP-API OAuth URL Builder with signed HMAC-SHA256 state
 * 7. Next.js Frontend App Router (/, /seller, /brand)
 */

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8787';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function runLocalAudit() {
  console.log('================================================================');
  console.log('🚀 RUNNING DISTRIBUTIONBRIDGE LOCAL E2E AUDIT TEST RUNNER');
  console.log('================================================================');
  console.log(`📡 Backend Target:  ${BACKEND_URL}`);
  console.log(`💻 Frontend Target: ${FRONTEND_URL}\n`);

  // Block 1: Backend Diagnostics & Route Engine Discovery
  console.log('--- [Block 1] Backend Health & Engine Registrations ---');
  try {
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    assert(healthRes.status === 200, 'GET /health returns HTTP 200 OK');
    
    const healthData = await healthRes.json();
    assert(healthData.status === 'online', 'Backend status is "online"');
    assert(Boolean(healthData.engines?.sourcingTriage), 'Sourcing Triage Engine registered');
    assert(Boolean(healthData.engines?.logistics), 'Logistics Engine registered');
    assert(Boolean(healthData.engines?.portal), 'Portal Governance Engine registered');
    assert(Boolean(healthData.engines?.auth), 'Amazon Auth Engine registered');
  } catch (err) {
    assert(false, `Failed to query Backend Health: ${err.message}`);
  }

  // Block 2: Universal CORS Preflight Verification (Port 3000)
  console.log('\n--- [Block 2] Universal CORS Preflight (Port 3000) ---');
  try {
    const corsRes = await fetch(`${BACKEND_URL}/api/sourcing/triage`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });

    assert(corsRes.status === 204 || corsRes.status === 200, 'OPTIONS preflight returns 204 No Content');
    const allowOrigin = corsRes.headers.get('Access-Control-Allow-Origin');
    assert(allowOrigin === FRONTEND_URL || allowOrigin === '*', `Access-Control-Allow-Origin matches ${FRONTEND_URL}`);
    assert(corsRes.headers.get('Access-Control-Allow-Credentials') === 'true', 'Access-Control-Allow-Credentials is true');
  } catch (err) {
    assert(false, `CORS Preflight failed: ${err.message}`);
  }

  // Block 3: AI Sourcing Triage Engine & Margin Calculation
  console.log('\n--- [Block 3] AI Sourcing Triage Engine & Margin Calculation ---');
  try {
    const triageRes = await fetch(`${BACKEND_URL}/api/sourcing/triage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
      },
      body: JSON.stringify({
        asin: 'B08PROFIT01',
        title: 'ApexGear Tactical Trail Pack',
        costPrice: 25.00,
        retailPrice: 69.99,
        mapPrice: 69.99,
        fbaFeeEstimate: 7.50,
        fbaCompetitors: 3,
        isAmazonSelling: false,
      }),
    });

    assert(triageRes.status === 200, 'POST /api/sourcing/triage returns HTTP 200');
    const triageData = await triageRes.json();
    assert(triageData.success === true, 'Triage execution successful');
    assert(triageData.triage.verdict === 'APPROVE_FOR_WHOLESALE', 'High-margin deal receives APPROVE_FOR_WHOLESALE');
    assert(triageData.triage.financials.netMarginPercent > 20, 'Net margin calculated above 20% threshold');
    assert(triageData.triage.dealScore >= 80, 'Deal score is >= 80');
  } catch (err) {
    assert(false, `Sourcing Triage test failed: ${err.message}`);
  }

  // Block 4: 3PL Logistics & FBA Prep Quote Engine
  console.log('\n--- [Block 4] 3PL Logistics & FBA Prep Quote Engine ---');
  try {
    const whRes = await fetch(`${BACKEND_URL}/api/logistics/warehouses`, {
      headers: { 'Origin': FRONTEND_URL },
    });
    assert(whRes.status === 200, 'GET /api/logistics/warehouses returns HTTP 200');
    const whData = await whRes.json();
    assert(Array.isArray(whData.warehouses) && whData.warehouses.length >= 3, 'Returns at least 3 verified 3PL hubs');

    const quoteRes = await fetch(`${BACKEND_URL}/api/logistics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': FRONTEND_URL },
      body: JSON.stringify({
        units: 500,
        warehouseId: 'WH-MIDWEST-01',
        destinationFbaHub: 'IND4',
        requireFnskuLabeling: true,
        requirePolybag: true,
      }),
    });
    assert(quoteRes.status === 200, 'POST /api/logistics quote returns HTTP 200');
    const quoteData = await quoteRes.json();
    assert(quoteData.quote.quoteId.startsWith('QT-'), 'Quote ID generated properly');
    assert(quoteData.quote.costBreakdown.totalLogisticsCost > 0, 'Total logistics cost computed');
  } catch (err) {
    assert(false, `Logistics engine test failed: ${err.message}`);
  }

  // Block 5: Portal Governance & Distributor Engine
  console.log('\n--- [Block 5] Brand & Seller Portal Governance Engine ---');
  try {
    const portalRes = await fetch(`${BACKEND_URL}/api/portal`, {
      headers: { 'Origin': FRONTEND_URL },
    });
    assert(portalRes.status === 200, 'GET /api/portal returns HTTP 200');
    const portalData = await portalRes.json();
    assert(Boolean(portalData.stats?.activeWholesaleBrands), 'Portal stats report active wholesale brands');
    assert(Array.isArray(portalData.distributors) && portalData.distributors.length > 0, 'Returns master distributor directory');
  } catch (err) {
    assert(false, `Portal engine test failed: ${err.message}`);
  }

  // Block 6: Amazon LWA & SP-API OAuth URL Builder with HMAC-SHA256 State
  console.log('\n--- [Block 6] Amazon OAuth2 & Signed State Generation ---');
  try {
    const authRes = await fetch(`${BACKEND_URL}/api/auth/amazon?format=json&user_id=test_user&redirect_back=/seller`, {
      headers: { 'Origin': FRONTEND_URL },
    });
    assert(authRes.status === 200, 'GET /api/auth/amazon?format=json returns HTTP 200');
    const authData = await authRes.json();
    assert(authData.success === true, 'OAuth payload generation successful');
    assert(typeof authData.state === 'string' && authData.state.includes('.'), 'HMAC state contains signature');
    assert(authData.authorizationUrl.includes('sellercentral.amazon.com'), 'Authorization URL points to Amazon Seller Central');
  } catch (err) {
    assert(false, `Amazon Auth test failed: ${err.message}`);
  }

  // Block 7: Next.js Frontend App Router Pages (/, /seller, /brand)
  console.log('\n--- [Block 7] Next.js Frontend App Router Pages ---');
  try {
    // 1. Home Page
    const homeRes = await fetch(`${FRONTEND_URL}/`);
    assert(homeRes.status === 200, 'GET / (Home Dashboard) returns HTTP 200');
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes('DistributionBridge'), 'Home page includes DistributionBridge brand title');

    // 2. Seller Dashboard Page
    const sellerRes = await fetch(`${FRONTEND_URL}/seller`);
    assert(sellerRes.status === 200, 'GET /seller (Seller Dashboard) returns HTTP 200');
    const sellerHtml = await sellerRes.text();
    assert(sellerHtml.includes('Wholesale Operations') || sellerHtml.includes('SP-API'), 'Seller dashboard contains SP-API controls');

    // 3. Brand Manager Page
    const brandRes = await fetch(`${FRONTEND_URL}/brand`);
    assert(brandRes.status === 200, 'GET /brand (Brand Manager) returns HTTP 200');
    const brandHtml = await brandRes.text();
    assert(brandHtml.includes('Brand Protection') || brandHtml.includes('Wholesale Sourcing'), 'Brand page contains Triage & Protection controls');
  } catch (err) {
    assert(false, `Frontend pages test failed: ${err.message}`);
  }

  // Summary
  console.log('\n================================================================');
  console.log(`📊 E2E AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLocalAudit().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
