/**
 * DistributionBridge PostgreSQL Database Connection Utility & Model Operations
 * Compatible with Cloudflare Workers, Cloudflare Hyperdrive, and standard PostgreSQL
 * Features Row-Level Security (RLS) session transaction wrappers for multi-tenant investor portfolios.
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
 * Executes the PostgreSQL RLS Migration DDL
 */
export async function runRlsMigration(env) {
  const sql = getDb(env);
  return await sql.begin(async (tx) => {
    await tx`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await tx`
      CREATE TABLE IF NOT EXISTS investors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        investor_code VARCHAR(64) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sku VARCHAR(128) NOT NULL,
        asin VARCHAR(32) NOT NULL,
        lot_number VARCHAR(64) NOT NULL,
        warehouse_id VARCHAR(64) NOT NULL,
        units_total INTEGER NOT NULL CHECK (units_total >= 0),
        units_allocated INTEGER NOT NULL DEFAULT 0 CHECK (units_allocated >= 0),
        unit_cost NUMERIC(10, 2) NOT NULL,
        currency VARCHAR(8) NOT NULL DEFAULT 'USD',
        status VARCHAR(32) NOT NULL DEFAULT 'in_stock',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS allocations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
        investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
        allocated_units INTEGER NOT NULL CHECK (allocated_units > 0),
        committed_capital NUMERIC(12, 2) NOT NULL CHECK (committed_capital >= 0),
        target_roi_percent NUMERIC(6, 2) NOT NULL DEFAULT 25.00,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS investor_portfolios (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        investor_id UUID NOT NULL UNIQUE REFERENCES investors(id) ON DELETE CASCADE,
        total_invested_capital NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
        current_asset_valuation NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
        realized_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
        active_deals_count INTEGER NOT NULL DEFAULT 0,
        portfolio_status VARCHAR(32) NOT NULL DEFAULT 'healthy',
        last_rebalanced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // Enable RLS
    await tx`ALTER TABLE investor_portfolios ENABLE ROW LEVEL SECURITY`;
    await tx`ALTER TABLE allocations ENABLE ROW LEVEL SECURITY`;
    await tx`ALTER TABLE inventory ENABLE ROW LEVEL SECURITY`;

    return { success: true, message: 'Row-Level Security migration completed.' };
  });
}

/**
 * Fetches an investor portfolio wrapped inside a transaction that sets `app.current_investor_id` session parameter
 * Enforces strict PostgreSQL Row-Level Security (RLS) isolation.
 *
 * @param {object} env - Cloudflare Worker environment
 * @param {string} investorId - UUID of the investor
 * @returns {Promise<object>} Portfolio summary, active allocations, and isolated inventory lots
 */
export async function getInvestorPortfolioWithRls(env, investorId) {
  const sql = getDb(env);

  // Wrap query inside transaction with session context
  return await sql.begin(async (tx) => {
    // 1. Set local session parameter for RLS evaluation in this transaction
    await tx`SELECT set_config('app.current_investor_id', ${investorId}, true)`;

    // 2. Query investor portfolio summary (protected by rls_investor_portfolio_isolation)
    const [portfolio] = await tx`
      SELECT 
        p.*,
        i.company_name,
        i.investor_code,
        i.contact_email
      FROM investor_portfolios p
      JOIN investors i ON p.investor_id = i.id
      WHERE p.investor_id = ${investorId}::UUID
    `;

    // 3. Query capital allocations (protected by rls_allocations_isolation)
    const allocations = await tx`
      SELECT 
        a.*,
        inv.sku,
        inv.asin,
        inv.warehouse_id,
        inv.lot_number
      FROM allocations a
      JOIN inventory inv ON a.inventory_id = inv.id
      WHERE a.investor_id = ${investorId}::UUID
      ORDER BY a.created_at DESC
    `;

    return {
      investorId,
      sessionRlsActive: true,
      portfolio: portfolio || {
        investor_id: investorId,
        total_invested_capital: '0.00',
        current_asset_valuation: '0.00',
        realized_pnl: '0.00',
        active_deals_count: 0,
        portfolio_status: 'healthy',
      },
      allocations: allocations || [],
      totalAllocationsCount: allocations ? allocations.length : 0,
    };
  });
}

/**
 * Upserts an inventory capital allocation inside an RLS transaction
 */
export async function upsertInvestorAllocationWithRls(env, investorId, {
  inventoryId,
  allocatedUnits,
  committedCapital,
  targetRoiPercent = 25.00,
}) {
  const sql = getDb(env);

  return await sql.begin(async (tx) => {
    // Set RLS session context
    await tx`SELECT set_config('app.current_investor_id', ${investorId}, true)`;

    const [allocation] = await tx`
      INSERT INTO allocations (
        inventory_id,
        investor_id,
        allocated_units,
        committed_capital,
        target_roi_percent,
        status
      )
      VALUES (
        ${inventoryId}::UUID,
        ${investorId}::UUID,
        ${allocatedUnits},
        ${committedCapital},
        ${targetRoiPercent},
        'active'
      )
      RETURNING *
    `;

    // Refresh portfolio totals
    await tx`
      INSERT INTO investor_portfolios (
        investor_id,
        total_invested_capital,
        current_asset_valuation,
        active_deals_count,
        updated_at
      )
      VALUES (
        ${investorId}::UUID,
        ${committedCapital},
        ${committedCapital},
        1,
        NOW()
      )
      ON CONFLICT (investor_id)
      DO UPDATE SET
        total_invested_capital = investor_portfolios.total_invested_capital + ${committedCapital},
        current_asset_valuation = investor_portfolios.current_asset_valuation + ${committedCapital},
        active_deals_count = investor_portfolios.active_deals_count + 1,
        updated_at = NOW()
    `;

    return allocation;
  });
}

/**
 * Upserts Amazon Selling Partner OAuth tokens and credentials into PostgreSQL
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
  const sql = getDb(env);
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const [result] = await sql`
    INSERT INTO amazon_sellers (
      selling_partner_id,
      user_id,
      account_name,
      refresh_token,
      access_token,
      access_token_expires_at,
      token_type,
      marketplace_ids,
      auth_status,
      is_active,
      metadata,
      updated_at
    )
    VALUES (
      ${sellingPartnerId},
      ${userId ? sql`${userId}::uuid` : null},
      ${accountName},
      ${refreshToken},
      ${accessToken},
      ${expiresAt}::timestamptz,
      ${tokenType},
      ${marketplaceIds},
      'connected',
      true,
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
      auth_status = 'connected',
      is_active = true,
      metadata = amazon_sellers.metadata || EXCLUDED.metadata,
      updated_at = CURRENT_TIMESTAMP
    RETURNING 
      id,
      selling_partner_id,
      user_id,
      account_name,
      token_type,
      marketplace_ids,
      auth_status,
      is_active,
      last_sync_at,
      created_at,
      updated_at
  `;

  return result;
}

/**
 * Retrieves a single active seller by selling_partner_id
 */
export async function getSellerByPartnerId(env, sellingPartnerId) {
  const sql = getDb(env);
  const [seller] = await sql`
    SELECT *
    FROM amazon_sellers
    WHERE selling_partner_id = ${sellingPartnerId} AND is_active = TRUE
    LIMIT 1
  `;
  return seller || null;
}

/**
 * Fetches all active sellers for automated background synchronization
 */
export async function getAllActiveSellers(env) {
  const sql = getDb(env);
  return await sql`
    SELECT id, selling_partner_id, user_id, account_name, refresh_token, access_token, access_token_expires_at, marketplace_ids, last_sync_at
    FROM amazon_sellers
    WHERE is_active = TRUE AND auth_status = 'connected'
    ORDER BY last_sync_at ASC NULLS FIRST
  `;
}

/**
 * Updates an active seller's cached access token
 */
export async function updateSellerAccessToken(env, sellingPartnerId, accessToken, expiresIn = 3600) {
  const sql = getDb(env);
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const [result] = await sql`
    UPDATE amazon_sellers
    SET 
      access_token = ${accessToken},
      access_token_expires_at = ${expiresAt}::timestamptz,
      updated_at = CURRENT_TIMESTAMP
    WHERE selling_partner_id = ${sellingPartnerId}
    RETURNING id, selling_partner_id, access_token_expires_at
  `;

  return result;
}

/**
 * Updates seller's last sync timestamp
 */
export async function updateSellerLastSync(env, sellingPartnerId, syncStatus = 'completed') {
  const sql = getDb(env);
  const [result] = await sql`
    UPDATE amazon_sellers
    SET 
      last_sync_at = CURRENT_TIMESTAMP,
      auth_status = ${syncStatus === 'failed' ? 'sync_error' : 'connected'},
      updated_at = CURRENT_TIMESTAMP
    WHERE selling_partner_id = ${sellingPartnerId}
    RETURNING id, selling_partner_id, last_sync_at, auth_status
  `;
  return result;
}

/**
 * Upserts a monthly sales report record
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
