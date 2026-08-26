/**
 * Monthly Sales Routes for DistributionBridge
 * Implements:
 * - GET /api/sales/monthly (Retrieve monthly sales aggregates from PostgreSQL)
 * - POST /api/sales/sync (Sync sales data from Amazon SP-API for a seller)
 */

import { getSellerByPartnerId, getMonthlySales } from '../db.js';
import { syncSellerMonthlySales } from '../amazon_spapi.js';
import { jsonResponse } from '../utils/cors.js';

/**
 * Route: GET /api/sales/monthly
 * Fetches monthly sales data for a specific selling partner from PostgreSQL
 */
export async function handleGetMonthlySales(request, env) {
  try {
    const url = new URL(request.url);
    const sellingPartnerId = url.searchParams.get('selling_partner_id');
    const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year'), 10) : null;

    if (!sellingPartnerId) {
      return jsonResponse({ success: false, error: 'selling_partner_id query parameter is required' }, 400, {}, env, request);
    }

    const salesRecords = await getMonthlySales(env, sellingPartnerId, year);

    return jsonResponse(
      {
        success: true,
        sellingPartnerId,
        count: salesRecords.length,
        data: salesRecords,
      },
      200,
      {},
      env,
      request
    );
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    return jsonResponse(
      { success: false, error: 'Failed to retrieve monthly sales data', details: error.message },
      500,
      {},
      env,
      request
    );
  }
}

/**
 * Route: POST /api/sales/sync
 * Syncs monthly sales from Amazon SP-API for a seller and persists in PostgreSQL
 */
export async function handleSyncMonthlySales(request, env) {
  try {
    const body = await request.json();
    const { selling_partner_id, year, month, marketplace_id = 'ATVPDKIKX0DER' } = body;

    if (!selling_partner_id) {
      return jsonResponse({ success: false, error: 'selling_partner_id is required' }, 400, {}, env, request);
    }

    const seller = await getSellerByPartnerId(env, selling_partner_id);
    if (!seller) {
      return jsonResponse(
        { success: false, error: `Seller ${selling_partner_id} not found in database.` },
        404,
        {},
        env,
        request
      );
    }

    const syncResult = await syncSellerMonthlySales(env, seller, {
      marketplaceId: marketplace_id,
      year: year || new Date().getFullYear(),
      month: month || (new Date().getMonth() + 1),
    });

    if (!syncResult.success) {
      return jsonResponse(
        { success: false, error: syncResult.error || 'Sync failed' },
        500,
        {},
        env,
        request
      );
    }

    return jsonResponse(
      {
        success: true,
        message: 'Monthly sales synced successfully from Amazon SP-API.',
        report: syncResult.report,
      },
      200,
      {},
      env,
      request
    );
  } catch (error) {
    console.error('Error in handleSyncMonthlySales:', error);
    return jsonResponse(
      { success: false, error: 'Failed to sync monthly sales with Amazon SP-API', details: error.message },
      500,
      {},
      env,
      request
    );
  }
}
