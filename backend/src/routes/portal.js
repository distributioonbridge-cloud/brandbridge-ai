/**
 * Portal Engine Route Handler
 * Endpoint: /api/portal
 * Manages brand & wholesale seller portals, application workflows,
 * gating requests, and master distributor network data.
 */

import { jsonResponse } from '../utils/cors.js';

// Master Distributors Network
const DISTRIBUTORS = [
  {
    id: 'DST-01',
    name: 'Apex Wholesale Distribution Group',
    categories: ['Consumer Electronics', 'Audio', 'Smart Home'],
    region: 'North America',
    minOrderAmount: 2500,
    exclusiveFbaAuthorized: true,
    activeBrandsCount: 18,
    leadTimeDays: 3,
  },
  {
    id: 'DST-02',
    name: 'Vanguard Nutrition & Wellness Supply',
    categories: ['Health & Household', 'Dietary Supplements', 'Sports Nutrition'],
    region: 'North America & Europe',
    minOrderAmount: 1500,
    exclusiveFbaAuthorized: true,
    activeBrandsCount: 12,
    leadTimeDays: 2,
  },
  {
    id: 'DST-03',
    name: 'OmniGlobal Industrial & Hardware Logistics',
    categories: ['Tools & Home Improvement', 'Automotive', 'Industrial'],
    region: 'North America',
    minOrderAmount: 5000,
    exclusiveFbaAuthorized: true,
    activeBrandsCount: 24,
    leadTimeDays: 5,
  },
];

// Sample Applications
const APPLICATIONS = [
  {
    id: 'APP-101',
    brandName: 'PureBlend Nutrition',
    sellerId: 'SEL-892401',
    monthlyOrderPromise: '$25,000 / month',
    status: 'Approved',
    appliedDate: '2026-08-20',
  },
  {
    id: 'APP-102',
    brandName: 'ApexGear Tech',
    sellerId: 'SEL-892401',
    monthlyOrderPromise: '$50,000 / month',
    status: 'Approved',
    appliedDate: '2026-08-15',
  },
  {
    id: 'APP-103',
    brandName: 'Guardian Safety Labs',
    sellerId: 'SEL-892401',
    monthlyOrderPromise: '$15,000 / month',
    status: 'Pending',
    appliedDate: '2026-08-25',
  },
];

/**
 * Main Portal Request Handler
 */
export async function handlePortal(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const subpath = url.pathname.replace(/^\/api\/portal/, '');

  try {
    // GET: Returns portal overview, distributor lists, or application status
    if (method === 'GET') {
      if (subpath === '/distributors') {
        return jsonResponse(
          {
            success: true,
            distributors: DISTRIBUTORS,
            count: DISTRIBUTORS.length,
          },
          200,
          {},
          env,
          request
        );
      }

      if (subpath === '/applications') {
        return jsonResponse(
          {
            success: true,
            applications: APPLICATIONS,
            count: APPLICATIONS.length,
          },
          200,
          {},
          env,
          request
        );
      }

      // Default portal summary
      return jsonResponse(
        {
          portal: 'DistributionBridge Enterprise Portal Engine',
          version: '1.0.0',
          stats: {
            totalMasterDistributors: DISTRIBUTORS.length,
            totalActiveApplications: APPLICATIONS.length,
            activeWholesaleBrands: 54,
            enrolledBrandRegistryCount: 38,
          },
          distributors: DISTRIBUTORS,
          recentApplications: APPLICATIONS,
        },
        200,
        {},
        env,
        request
      );
    }

    // POST: Ingests new applications or gating requests
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const newApp = {
        id: `APP-${Date.now().toString(36).toUpperCase()}`,
        brandName: body.brandName || 'Brand Partner',
        sellerId: body.sellerId || 'SEL-892401',
        monthlyOrderPromise: body.monthlyOrderPromise || '$10,000 / month',
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0],
      };

      return jsonResponse(
        {
          success: true,
          message: 'Wholesale brand application submitted successfully.',
          application: newApp,
        },
        201,
        {},
        env,
        request
      );
    }

    return jsonResponse({ error: `Method ${method} not allowed for portal engine` }, 405, {}, env, request);
  } catch (error) {
    console.error('[Portal Engine Error]', error);
    return jsonResponse({ success: false, error: 'Portal request failed', details: error.message }, 500, {}, env, request);
  }
}
