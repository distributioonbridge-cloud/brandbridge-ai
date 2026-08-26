/**
 * DistributionBridge PostgreSQL Database Connection Utility & Model Operations
 * Compatible with Cloudflare Workers, Cloudflare Hyperdrive, and standard PostgreSQL
 */

import postgres from 'postgres';

let sqlClient = null;
let cachedConnectionString = null;

/**
 * Initializes and returns a cached PostgreSQL client instance for Cloudflare Workers
 * @param {object} env - Cloudflare Worker environment bindings
 * @returns {postgres.Sql} postgres client instance
 */
export function getDb(env) {
  const connectionString = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'Database connection string not found. Please bind HYPERDRIVE or set DATABASE_URL secret via wrangler secret put DATABASE_URL.'
    );
  }

  if (!sqlClient || cachedConnectionString !== connectionString) {
    cachedConnectionString = connectionString;
    sqlClient = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: connectionString.includes('sslmode=disable') ? false : 'require',
    });
  }

  return sqlClient;
}

/**
 * Tests database connectivity and returns diagnostic information
 * @param {object} env - Cloudflare Worker environment
 */
export async function testDbConnection(env) {
  try {
    const connectionString = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
    if (!connectionString) {
      return { status: 'not_configured', message: 'DATABASE_URL or HYPERDRIVE not provided' };
    }

    const sql = getDb(env);
    const [result] = await sql`SELECT 1 as is_connected, current_database() as db_name, version() as pg_version`;
    return {
      status: 'connected',
      database: result?.db_name || 'postgres',
      version: result?.pg_version?.split(' ')?.[0] || 'PostgreSQL',
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error.message,
    };
  }
}

/**
 * Upserts Amazon Selling Partner OAuth tokens and credentials into PostgreSQL
 * @param {object} env - Cloudflare Worker environment
 * @param {object} params - Seller details and token payloads
 * @returns {Promise<object>} Saved seller record
 */
export async function upsertSellerTokens(env, {
  sellingPartnerId,
  userId = null,
  accountName = null,
  refreshToken,
  accessToken = null,
  expiresIn = 3600,
  tokenType = 'bearer',
  marketplaceIds = ['ATVPDKIKX0DER'],
  metadata = {},
}) {
  if (!sellingPartnerId) {
    throw new Error('sellingPartnerId is required to persist seller tokens');
  }
  if (!refreshToken) {
    throw new Error('refreshToken is required to persist seller tokens');
  }

  const sql = getDb(env);

  const expiresAt = accessToken
    ? new Date(Date.now() + (expiresIn - 60) * 1000) // 1 minute safety buffer
    : null;

  const [record] = await sql`
    INSERT INTO amazon_sellers (
      selling_partner_id,
      user_id,
      account_name,
      refresh_token,
      access_token,
      access_token_expires_at,
      token_type,
      marketplace_ids,
      is_active,
      auth_status,
      metadata,
      updated_at
    )
    VALUES (
      ${sellingPartnerId},
      ${userId},
      ${accountName},
      ${refreshToken},
      ${accessToken},
      ${expiresAt},
      ${tokenType},
      ${marketplaceIds},
      TRUE,
      'connected',
      ${JSON.stringify(metadata)},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (selling_partner_id)
    DO UPDATE SET
      refresh_token = EXCLUDED.refresh_token,
      access_token = COALESCE(EXCLUDED.access_token, amazon_sellers.access_token),
      access_token_expires_at = COALESCE(EXCLUDED.access_token_expires_at, amazon_sellers.access_token_expires_at),
      token_type = EXCLUDED.token_type,
      marketplace_ids = EXCLUDED.marketplace_ids,
      is_active = TRUE,
      auth_status = 'connected',
      metadata = amazon_sellers.metadata || EXCLUDED.metadata,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, selling_partner_id, account_name, auth_status, is_active, marketplace_ids, created_at, updated_at
  `;

  return record;
}

/**
 * Retrieves seller credentials by selling_partner_id
 * @param {object} env - Cloudflare Worker environment
 * @param {string} sellingPartnerId - Amazon Seller Merchant ID
 */
export async function getSellerByPartnerId(env, sellingPartnerId) {
  const sql = getDb(env);
  const rows = await sql`
    SELECT *
    FROM amazon_sellers
    WHERE selling_partner_id = ${sellingPartnerId} AND is_active = TRUE
    LIMIT 1
  `;
  return rows[0] || null;
}

/**
 * Retrieves all active connected sellers for scheduled background synchronization
 * @param {object} env - Cloudflare Worker environment
 */
export async function getAllActiveSellers(env) {
  const sql = getDb(env);
  return await sql`
    SELECT *
    FROM amazon_sellers
    WHERE is_active = TRUE AND auth_status = 'connected'
    ORDER BY created_at ASC
  `;
}

/**
 * Updates access token for a seller
 * @param {object} env - Cloudflare Worker environment
 * @param {string} sellingPartnerId - Amazon Seller Merchant ID
 * @param {string} accessToken - New LWA access token
 * @param {number} expiresIn - Token validity in seconds
 */
export async function updateSellerAccessToken(env, sellingPartnerId, accessToken, expiresIn = 3600) {
  const sql = getDb(env);
  const expiresAt = new Date(Date.now() + (expiresIn - 60) * 1000);

  const [result] = await sql`
    UPDATE amazon_sellers
    SET
      access_token = ${accessToken},
      access_token_expires_at = ${expiresAt},
      updated_at = CURRENT_TIMESTAMP
    WHERE selling_partner_id = ${sellingPartnerId}
    RETURNING id, selling_partner_id, access_token_expires_at, updated_at
  `;

  return result || null;
}

/**
 * Updates last_sync_at timestamp and sync status for a seller
 * @param {object} env - Cloudflare Worker environment
 * @param {string} sellingPartnerId - Amazon Seller Merchant ID
 * @param {string} status - Sync status ('connected', 'sync_error', etc.)
 */
export async function updateSellerLastSync(env, sellingPartnerId, status = 'connected') {
  const sql = getDb(env);
  const [result] = await sql`
    UPDATE amazon_sellers
    SET
      last_sync_at = CURRENT_TIMESTAMP,
      auth_status = ${status},
      updated_at = CURRENT_TIMESTAMP
    WHERE selling_partner_id = ${sellingPartnerId}
    RETURNING id, selling_partner_id, last_sync_at, auth_status
  `;
  return result || null;
}

/**
 * Upserts monthly sales report data for a seller
 */
export async function upsertMonthlySalesReport(env, {
  sellingPartnerId,
  marketplaceId = 'ATVPDKIKX0DER',
  year,
  month,
  totalOrderedUnits = 0,
  totalOrderedItems = 0,
  totalSalesAmount = 0.00,
  currencyCode = 'USD',
  averageSellingPrice = 0.00,
  totalOrdersCount = 0,
  fbaUnitsShipped = 0,
  fbmUnitsShipped = 0,
  asinBreakdown = [],
  reportStatus = 'completed',
  rawPayload = {},
}) {
  const sql = getDb(env);

  const [result] = await sql`
    INSERT INTO monthly_sales_reports (
      selling_partner_id,
      marketplace_id,
      year,
      month,
      total_ordered_units,
      total_ordered_items,
      total_sales_amount,
      currency_code,
      average_selling_price,
      total_orders_count,
      fba_units_shipped,
      fbm_units_shipped,
      asin_breakdown,
      report_status,
      raw_payload,
      synced_at,
      updated_at
    )
    VALUES (
      ${sellingPartnerId},
      ${marketplaceId},
      ${year},
      ${month},
      ${totalOrderedUnits},
      ${totalOrderedItems},
      ${totalSalesAmount},
      ${currencyCode},
      ${averageSellingPrice},
      ${totalOrdersCount},
      ${fbaUnitsShipped},
      ${fbmUnitsShipped},
      ${JSON.stringify(asinBreakdown)},
      ${reportStatus},
      ${JSON.stringify(rawPayload)},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (selling_partner_id, marketplace_id, year, month)
    DO UPDATE SET
      total_ordered_units = EXCLUDED.total_ordered_units,
      total_ordered_items = EXCLUDED.total_ordered_items,
      total_sales_amount = EXCLUDED.total_sales_amount,
      currency_code = EXCLUDED.currency_code,
      average_selling_price = EXCLUDED.average_selling_price,
      total_orders_count = EXCLUDED.total_orders_count,
      fba_units_shipped = EXCLUDED.fba_units_shipped,
      fbm_units_shipped = EXCLUDED.fbm_units_shipped,
      asin_breakdown = EXCLUDED.asin_breakdown,
      report_status = EXCLUDED.report_status,
      raw_payload = EXCLUDED.raw_payload,
      synced_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return result;
}

/**
 * Fetches monthly sales reports for a seller
 */
export async function getMonthlySales(env, sellingPartnerId, year = null) {
  const sql = getDb(env);

  if (year) {
    return await sql`
      SELECT *
      FROM monthly_sales_reports
      WHERE selling_partner_id = ${sellingPartnerId} AND year = ${year}
      ORDER BY month ASC
    `;
  }

  return await sql`
    SELECT *
    FROM monthly_sales_reports
    WHERE selling_partner_id = ${sellingPartnerId}
    ORDER BY year DESC, month DESC
    LIMIT 24
  `;
}
