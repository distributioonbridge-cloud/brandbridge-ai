/**
 * Logistics Engine Route Handler
 * Endpoint: /api/logistics
 * Handles 3PL fulfillment network directory, FBA prep quote generation,
 * freight routing calculations, and warehouse turnaround estimations.
 */

import { jsonResponse } from '../utils/cors.js';

// Verified 3PL Warehouses & Prep Hubs
const VERIFIED_WAREHOUSES = [
  {
    id: 'WH-MIDWEST-01',
    name: 'Midwest Rapid Prep & Ship Center',
    region: 'Midwest (Plainfield, IN)',
    supportedFbaHubs: ['IND4', 'MDW2', 'CVG3', 'ORD2'],
    services: ['FNSKU Labeling', 'Polybagging', 'Palletization', '24h Cross-docking'],
    capacityStatus: 'Optimal',
    rates: { perUnitLabeling: 0.25, perUnitPolybag: 0.35, perPalletCrossDock: 14.50 },
    avgTurnaroundHours: 24,
    rating: 4.9,
  },
  {
    id: 'WH-WEST-02',
    name: 'Pacific Hazmat & Cold Storage Logistics',
    region: 'West Coast (Ontario, CA)',
    supportedFbaHubs: ['ONT8', 'LGB3', 'SMF3', 'SBD1'],
    services: ['Cold Storage', 'Hazmat Handling', 'Bundling / Multipack', 'Carton Forwarding'],
    capacityStatus: 'Available',
    rates: { perUnitLabeling: 0.30, perUnitPolybag: 0.40, perPalletCrossDock: 18.00 },
    avgTurnaroundHours: 36,
    rating: 4.8,
  },
  {
    id: 'WH-EAST-03',
    name: 'Northeast Express Fulfillment Hub',
    region: 'East Coast (Robbinsville, NJ)',
    supportedFbaHubs: ['EWR4', 'TEB9', 'PHL7', 'BOS7'],
    services: ['LTL Freight Consolidation', 'Amazon Direct Injection', 'Custom Packaging'],
    capacityStatus: 'Optimal',
    rates: { perUnitLabeling: 0.28, perUnitPolybag: 0.38, perPalletCrossDock: 15.00 },
    avgTurnaroundHours: 24,
    rating: 4.9,
  },
];

/**
 * Computes estimated logistics, prep, and freight costs
 */
export function calculateLogisticsQuote({
  units = 500,
  weightLbsPerUnit = 1.2,
  warehouseId = 'WH-MIDWEST-01',
  destinationFbaHub = 'IND4',
  requirePolybag = true,
  requireFnskuLabeling = true,
  requirePalletization = false,
}) {
  const selectedWarehouse = VERIFIED_WAREHOUSES.find((w) => w.id === warehouseId) || VERIFIED_WAREHOUSES[0];

  const labelingCost = requireFnskuLabeling ? units * selectedWarehouse.rates.perUnitLabeling : 0;
  const polybagCost = requirePolybag ? units * selectedWarehouse.rates.perUnitPolybag : 0;
  
  const totalWeightLbs = units * weightLbsPerUnit;
  const estimatedPallets = Math.max(1, Math.ceil(units / 450));
  const palletCost = requirePalletization ? estimatedPallets * selectedWarehouse.rates.perPalletCrossDock : 0;

  // Estimated LTL / SPD carrier shipping rate from 3PL to Amazon FBA
  const baseRatePerLb = 0.45;
  const estimatedCarrierFreight = totalWeightLbs * baseRatePerLb + (estimatedPallets * 25.00);

  const totalLogisticsCost = labelingCost + polybagCost + palletCost + estimatedCarrierFreight;
  const perUnitLogisticsCost = parseFloat((totalLogisticsCost / units).toFixed(2));

  return {
    quoteId: `QT-${Date.now().toString(36).toUpperCase()}`,
    warehouse: {
      id: selectedWarehouse.id,
      name: selectedWarehouse.name,
      region: selectedWarehouse.region,
    },
    destinationFbaHub,
    inputSummary: {
      units,
      totalWeightLbs: parseFloat(totalWeightLbs.toFixed(1)),
      estimatedPallets,
    },
    costBreakdown: {
      labelingCost: parseFloat(labelingCost.toFixed(2)),
      polybagCost: parseFloat(polybagCost.toFixed(2)),
      palletCrossDockCost: parseFloat(palletCost.toFixed(2)),
      estimatedCarrierFreight: parseFloat(estimatedCarrierFreight.toFixed(2)),
      totalLogisticsCost: parseFloat(totalLogisticsCost.toFixed(2)),
      perUnitLogisticsCost,
    },
    estimatedTurnaround: `${selectedWarehouse.avgTurnaroundHours} hours from dock arrival`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Main Logistics Request Handler
 */
export async function handleLogistics(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const subpath = url.pathname.replace(/^\/api\/logistics/, '');

  try {
    // GET: Returns warehouse directory or quote calculation
    if (method === 'GET') {
      if (subpath === '/warehouses' || subpath === '' || subpath === '/') {
        return jsonResponse(
          {
            success: true,
            network: 'DistributionBridge 3PL Logistics & FBA Prep Network',
            count: VERIFIED_WAREHOUSES.length,
            warehouses: VERIFIED_WAREHOUSES,
          },
          200,
          {},
          env,
          request
        );
      }
    }

    // POST: Ingests quote or routing requests
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const quote = calculateLogisticsQuote(body);

      return jsonResponse(
        {
          success: true,
          message: 'Logistics quote calculated successfully.',
          quote,
        },
        200,
        {},
        env,
        request
      );
    }

    return jsonResponse({ error: `Method ${method} not allowed for logistics engine` }, 405, {}, env, request);
  } catch (error) {
    console.error('[Logistics Engine Error]', error);
    return jsonResponse({ success: false, error: 'Logistics calculation failed', details: error.message }, 500, {}, env, request);
  }
}
