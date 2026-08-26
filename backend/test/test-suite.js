/**
 * Automated Test Suite for DistributionBridge Unified Backend & RLS Security
 */

import { generateSignedState, verifySignedState } from '../src/utils/crypto.js';
import { buildAmazonAuthUrl } from '../src/services/lwa.js';
import { getCorsHeaders, jsonResponse, withCors } from '../src/utils/cors.js';
import { getSpApiEndpoint, buildMonthInterval, parseOrderMetricsForStorage } from '../src/amazon_spapi.js';
import { evaluateSourcingDeal } from '../src/routes/triage.js';
import { calculateLogisticsQuote } from '../src/routes/logistics.js';
import { handlePortal } from '../src/routes/portal.js';

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

async function runTests() {
  console.log('\n=== RUNNING DISTRIBUTIONBRIDGE UNIFIED BACKEND & RLS TEST SUITE ===\n');

  const mockEnv = {
    AMAZON_APP_ID: 'amzn1.sp.solution.test-app-id-12345',
    LWA_CLIENT_ID: 'amzn1.application-oa2-client.test-client-id-67890',
    LWA_CLIENT_SECRET: 'test-client-secret-xyz',
    LWA_REDIRECT_URI: 'https://distributionbridge.com/api/auth/amazon/callback',
    AMAZON_AUTH_BASE_URL: 'https://sellercentral.amazon.com/apps/authorize/consent',
    FRONTEND_URL: 'https://distributionbridge.com',
    CSRF_SECRET: 'super-secure-test-secret-key-32-chars-minimum',
  };

  // Test 1: Crypto State Generation & Verification
  console.log('1. Testing Crypto HMAC State & CSRF Protection:');
  const payload = { userId: 'user-abc-123', redirectBack: '/brand/dashboard', mode: 'spapi' };
  const state = await generateSignedState(payload, mockEnv.CSRF_SECRET, 900);
  assert(typeof state === 'string' && state.includes('.'), 'State generated with format payload.signature');

  const verification = await verifySignedState(state, mockEnv.CSRF_SECRET);
  assert(verification.valid === true, 'Valid signed state verified successfully');
  assert(verification.payload.userId === 'user-abc-123', 'Payload userId preserved correctly');
  assert(verification.payload.redirectBack === '/brand/dashboard', 'Payload redirectBack preserved');

  // Test 2: Tampered State Detection
  console.log('\n2. Testing Tampered State Detection:');
  const tamperedState = state.slice(0, -5) + 'XXXXX';
  const tamperedVerification = await verifySignedState(tamperedState, mockEnv.CSRF_SECRET);
  assert(tamperedVerification.valid === false, 'Tampered state signature rejected');

  // Test 3: Expired State Detection
  console.log('\n3. Testing Expired State Detection:');
  const expiredState = await generateSignedState(payload, mockEnv.CSRF_SECRET, -10);
  const expiredVerification = await verifySignedState(expiredState, mockEnv.CSRF_SECRET);
  assert(expiredVerification.valid === false && expiredVerification.error.includes('expired'), 'Expired state correctly rejected');

  // Test 4: Amazon SP-API Authorization URL Construction
  console.log('\n4. Testing Amazon SP-API Authorization URL Builder:');
  const authUrl = buildAmazonAuthUrl(mockEnv, { state, version: 'beta', mode: 'spapi' });
  const parsedUrl = new URL(authUrl);
  assert(parsedUrl.origin === 'https://sellercentral.amazon.com', 'URL target is sellercentral.amazon.com');
  assert(parsedUrl.pathname === '/apps/authorize/consent', 'URL path is /apps/authorize/consent');
  assert(parsedUrl.searchParams.get('application_id') === mockEnv.AMAZON_APP_ID, 'application_id matches AMAZON_APP_ID');
  assert(parsedUrl.searchParams.get('state') === state, 'state parameter matches generated state');
  assert(parsedUrl.searchParams.get('version') === 'beta', 'version parameter matches beta');

  // Test 5: Amazon Direct LWA Authorization URL Construction
  console.log('\n5. Testing Amazon Direct LWA URL Builder:');
  const directLwaUrl = buildAmazonAuthUrl(mockEnv, { state, mode: 'lwa_direct' });
  const parsedLwaUrl = new URL(directLwaUrl);
  assert(parsedLwaUrl.origin === 'https://www.amazon.com', 'LWA target is www.amazon.com');
  assert(parsedLwaUrl.searchParams.get('client_id') === mockEnv.LWA_CLIENT_ID, 'client_id matches LWA_CLIENT_ID');
  assert(parsedLwaUrl.searchParams.get('response_type') === 'code', 'response_type is code');

  // Test 6: CORS and Universal withCors Wrapper
  console.log('\n6. Testing Universal CORS Headers (Port 3000 & 5173 support):');
  const nextJsReq = new Request('http://localhost:8787/api/sourcing/triage', {
    headers: { Origin: 'http://localhost:3000' },
  });
  const corsNext = getCorsHeaders(mockEnv, nextJsReq);
  assert(corsNext['Access-Control-Allow-Origin'] === 'http://localhost:3000', 'Port 3000 origin reflected in CORS header');
  assert(corsNext['Access-Control-Allow-Credentials'] === 'true', 'Allow credentials enabled');

  const rawRes = new Response('redirecting', { status: 302, headers: { Location: 'https://amazon.com' } });
  const corsWrapped = withCors(rawRes, nextJsReq, mockEnv);
  assert(corsWrapped.headers.get('Access-Control-Allow-Origin') === 'http://localhost:3000', 'withCors injected CORS on 302 redirect');

  // Test 7: SP-API Regional Endpoints & Month Interval Builder
  console.log('\n7. Testing SP-API Region Resolution & Interval Builder:');
  assert(getSpApiEndpoint('ATVPDKIKX0DER') === 'https://sellingpartnerapi-na.amazon.com', 'US marketplace resolves to NA endpoint');
  assert(getSpApiEndpoint('A1F83G8C2ARO7P') === 'https://sellingpartnerapi-eu.amazon.com', 'UK marketplace resolves to EU endpoint');
  assert(getSpApiEndpoint('A1VC38T7YXB528') === 'https://sellingpartnerapi-fe.amazon.com', 'JP marketplace resolves to FE endpoint');

  const interval = buildMonthInterval(2026, 8);
  assert(interval.startsWith('2026-08-01') && interval.includes('2026-08-31'), 'August 2026 interval covers full month');

  // Test 8: Parsing Order Metrics for PostgreSQL Storage
  console.log('\n8. Testing SP-API Order Metrics Parser for PostgreSQL Schema:');
  const sampleSpApiPayload = {
    payload: [
      {
        interval: interval,
        unitCount: 5000,
        orderItemCount: 4500,
        orderCount: 4200,
        averageUnitPrice: { amount: 35.50, currencyCode: 'USD' },
        totalSales: { amount: 177500.00, currencyCode: 'USD' },
      },
    ],
  };

  const parsedReport = parseOrderMetricsForStorage(sampleSpApiPayload, {
    sellingPartnerId: 'SELLER_TEST_001',
    marketplaceId: 'ATVPDKIKX0DER',
    year: 2026,
    month: 8,
  });

  assert(parsedReport.sellingPartnerId === 'SELLER_TEST_001', 'sellingPartnerId mapped');
  assert(parsedReport.totalOrderedUnits === 5000, 'totalOrderedUnits parsed correctly (5000)');
  assert(parsedReport.totalSalesAmount === 177500.00, 'totalSalesAmount parsed correctly (177500.00)');
  assert(parsedReport.averageSellingPrice === 35.50, 'averageSellingPrice parsed correctly');
  assert(parsedReport.fbaUnitsShipped === 4500, 'FBA units computed (90% = 4500)');
  assert(parsedReport.fbmUnitsShipped === 500, 'FBM units computed (10% = 500)');

  // Test 9: Sourcing Triage Engine
  console.log('\n9. Testing Sourcing Triage Engine Deal Scoring:');
  const profitableDeal = evaluateSourcingDeal({
    asin: 'B08PROFIT01',
    costPrice: 20.00,
    retailPrice: 59.99,
    mapPrice: 59.99,
    fbaCompetitors: 2,
    isAmazonSelling: false,
  });
  assert(profitableDeal.verdict === 'APPROVE_FOR_WHOLESALE', 'High margin deal approved for wholesale');
  assert(profitableDeal.dealScore >= 80, 'Deal score is >= 80');

  const mapViolatingDeal = evaluateSourcingDeal({
    asin: 'B08RISK02',
    costPrice: 40.00,
    retailPrice: 42.00,
    mapPrice: 49.99,
    fbaCompetitors: 12,
    isAmazonSelling: true,
  });
  assert(mapViolatingDeal.verdict === 'REJECT_HIGH_RISK', 'MAP-violating low margin deal rejected as high risk');

  // Test 10: Logistics Engine Quote Calculator
  console.log('\n10. Testing Logistics Engine Quote Calculator:');
  const quote = calculateLogisticsQuote({
    units: 1000,
    warehouseId: 'WH-MIDWEST-01',
    destinationFbaHub: 'IND4',
    requirePolybag: true,
    requireFnskuLabeling: true,
  });
  assert(quote.quoteId.startsWith('QT-'), 'Quote ID generated');
  assert(quote.costBreakdown.totalLogisticsCost > 0, 'Total logistics cost computed');
  assert(quote.warehouse.id === 'WH-MIDWEST-01', 'Midwest warehouse selected');

  // Test 11: PostgreSQL Row-Level Security (RLS) Investor Transactions
  console.log('\n11. Testing PostgreSQL RLS Investor Portfolio Session Transactions:');
  const investorReq = new Request('http://localhost:8787/api/portal/investor/portfolio?investor_id=INV-ALPHA-01', {
    headers: { Origin: 'http://localhost:3000' },
  });
  const rlsResponse = await handlePortal(investorReq, mockEnv);
  assert(rlsResponse.status === 200, 'GET /api/portal/investor/portfolio returns 200 OK');
  
  const rlsData = await rlsResponse.json();
  assert(rlsData.rlsSessionActive === true, 'RLS session is active in transaction wrapper');
  assert(rlsData.sessionParam.includes('app.current_investor_id'), 'Transaction sets app.current_investor_id');
  assert(rlsData.portfolio && rlsData.portfolio.portfolio_status === 'healthy', 'Isolated investor portfolio returned');

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
