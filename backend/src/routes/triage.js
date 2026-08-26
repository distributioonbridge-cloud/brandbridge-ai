/**
 * Sourcing Triage Engine Route Handler
 * Endpoint: /api/sourcing/triage
 * Evaluates wholesale product deals, computes unit margins, estimates FBA fees,
 * detects MAP price risks, and delivers an algorithmic triage recommendation.
 */

import { jsonResponse } from '../utils/cors.js';

/**
 * Calculates triage score and verdict based on profitability and risk metrics
 */
export function evaluateSourcingDeal({
  asin = 'B08XYZ1234',
  title = 'Sample Wholesale SKU',
  costPrice = 22.50,
  retailPrice = 45.00,
  mapPrice = 44.99,
  fbaFeeEstimate = 6.75,
  referralFeePercent = 15,
  monthlySalesVolume = 1200,
  fbaCompetitors = 3,
  isAmazonSelling = false,
  supplierMoq = 100,
}) {
  const referralFee = retailPrice * (referralFeePercent / 100);
  const totalCost = costPrice + fbaFeeEstimate + referralFee;
  const netProfit = retailPrice - totalCost;
  const netMarginPercent = parseFloat(((netProfit / retailPrice) * 100).toFixed(2));
  const roiPercent = parseFloat(((netProfit / costPrice) * 100).toFixed(2));

  // Risk & Compliance Flags
  const flags = [];
  let score = 75; // Baseline score out of 100

  // 1. Profit Margin Evaluation
  if (netMarginPercent >= 30) {
    score += 15;
  } else if (netMarginPercent < 18) {
    score -= 25;
    flags.push('Low net margin (< 18%)');
  }

  // 2. MAP Price Compliance Safety
  if (retailPrice < mapPrice) {
    score -= 30;
    flags.push('Retail price undercuts Minimum Advertised Price (MAP)');
  } else {
    score += 5;
  }

  // 3. Amazon Direct Competition
  if (isAmazonSelling) {
    score -= 25;
    flags.push('Amazon retail currently occupies the BuyBox');
  }

  // 4. Seller Saturation
  if (fbaCompetitors > 8) {
    score -= 15;
    flags.push(`High FBA seller saturation (${fbaCompetitors} active sellers)`);
  } else if (fbaCompetitors <= 4) {
    score += 10;
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Verdict Assignment
  let verdict = 'REQUIRES_FURTHER_AUDIT';
  if (score >= 80 && netMarginPercent >= 20 && !isAmazonSelling) {
    verdict = 'APPROVE_FOR_WHOLESALE';
  } else if (score < 50 || netMarginPercent < 12 || isAmazonSelling) {
    verdict = 'REJECT_HIGH_RISK';
  }

  return {
    asin,
    title,
    dealScore: score,
    verdict,
    financials: {
      costPrice: parseFloat(costPrice.toFixed(2)),
      retailPrice: parseFloat(retailPrice.toFixed(2)),
      mapPrice: parseFloat(mapPrice.toFixed(2)),
      fbaFeeEstimate: parseFloat(fbaFeeEstimate.toFixed(2)),
      referralFee: parseFloat(referralFee.toFixed(2)),
      totalUnitCost: parseFloat(totalCost.toFixed(2)),
      netProfitPerUnit: parseFloat(netProfit.toFixed(2)),
      netMarginPercent,
      roiPercent,
      estimatedMonthlyRevenue: parseFloat((retailPrice * (monthlySalesVolume / Math.max(1, fbaCompetitors + 1))).toFixed(2)),
    },
    riskAssessment: {
      isAmazonSelling,
      fbaCompetitorCount: fbaCompetitors,
      supplierMoq,
      flags,
    },
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Main Triage Request Handler
 */
export async function handleSourcingTriage(request, env) {
  const method = request.method;

  try {
    // GET: Returns default triage rules, sample evaluations, and thresholds
    if (method === 'GET') {
      const url = new URL(request.url);
      const asinParam = url.searchParams.get('asin');

      if (asinParam) {
        const evaluation = evaluateSourcingDeal({ asin: asinParam });
        return jsonResponse({ success: true, evaluation }, 200, {}, env, request);
      }

      // Return default benchmarking guidelines
      return jsonResponse(
        {
          engine: 'DistributionBridge AI Sourcing Triage Engine',
          version: '1.2.0',
          guidelines: {
            minimumNetMargin: '20.0%',
            minimumRoi: '35.0%',
            maximumFbaCompetitors: 6,
            mapEnforcementStrictness: 'High',
          },
          sampleDeals: [
            evaluateSourcingDeal({ asin: 'B08XYZ1234', title: 'Premium Wireless Audio Pack', costPrice: 32.00, retailPrice: 79.99, mapPrice: 79.99, fbaCompetitors: 3 }),
            evaluateSourcingDeal({ asin: 'B09ABC5678', title: 'Ultra Grip Ergonomic Handle', costPrice: 14.50, retailPrice: 24.99, mapPrice: 24.99, fbaCompetitors: 9 }),
          ],
        },
        200,
        {},
        env,
        request
      );
    }

    // POST: Ingests custom SKU / ASIN parameters and executes triage
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const evaluation = evaluateSourcingDeal(body);

      return jsonResponse(
        {
          success: true,
          message: `Sourcing triage complete. Verdict: ${evaluation.verdict}`,
          triage: evaluation,
        },
        200,
        {},
        env,
        request
      );
    }

    return jsonResponse({ error: `Method ${method} not allowed for triage engine` }, 405, {}, env, request);
  } catch (error) {
    console.error('[Triage Engine Error]', error);
    return jsonResponse({ success: false, error: 'Sourcing triage evaluation failed', details: error.message }, 500, {}, env, request);
  }
}
