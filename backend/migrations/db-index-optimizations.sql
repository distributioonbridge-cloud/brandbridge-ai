-- =============================================================================
-- DistributionBridge: Database Index & RLS Covering Optimizations
-- Optimizes Foreign Keys, Encrypted Lookups, JSONB Search, and RLS Filtering
-- =============================================================================

-- 1. Investor & User Fast Authentication Lookups
CREATE INDEX IF NOT EXISTS idx_investors_investor_code_lower 
    ON investors (LOWER(investor_code));

CREATE INDEX IF NOT EXISTS idx_investors_email_lower 
    ON investors (LOWER(contact_email));

CREATE INDEX IF NOT EXISTS idx_investors_status_active 
    ON investors (status) 
    WHERE status = 'active';

-- 2. RLS Covering Composite Indexes for Allocations
-- Drastically accelerates RLS session queries (WHERE investor_id = app.current_investor_id)
CREATE INDEX IF NOT EXISTS idx_allocations_investor_rls_covering 
    ON allocations (investor_id, inventory_id, status) 
    INCLUDE (allocated_units, committed_capital, target_roi_percent, created_at);

CREATE INDEX IF NOT EXISTS idx_allocations_inventory_fk 
    ON allocations (inventory_id);

CREATE INDEX IF NOT EXISTS idx_allocations_status 
    ON allocations (status);

-- 3. RLS Covering Composite Indexes for Inventory Lots
-- Enables zero-cost index-only scans for investor lot inspections
CREATE INDEX IF NOT EXISTS idx_inventory_id_status_covering 
    ON inventory (id, status) 
    INCLUDE (sku, asin, lot_number, warehouse_id, units_total, units_allocated, unit_cost, currency);

CREATE INDEX IF NOT EXISTS idx_inventory_asin 
    ON inventory (asin);

CREATE INDEX IF NOT EXISTS idx_inventory_sku 
    ON inventory (sku);

CREATE INDEX IF NOT EXISTS idx_inventory_warehouse 
    ON inventory (warehouse_id);

-- 4. Investor Portfolios Fast Lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_investor_portfolios_investor_id 
    ON investor_portfolios (investor_id) 
    INCLUDE (total_invested_capital, current_asset_valuation, realized_pnl, active_deals_count, portfolio_status);

-- 5. Amazon Sellers & LWA OAuth Token Indexes
CREATE INDEX IF NOT EXISTS idx_amazon_sellers_partner_id 
    ON amazon_sellers (selling_partner_id);

CREATE INDEX IF NOT EXISTS idx_amazon_sellers_active_sync 
    ON amazon_sellers (is_active, last_sync_at ASC NULLS FIRST) 
    WHERE is_active = TRUE AND auth_status = 'connected';

CREATE INDEX IF NOT EXISTS idx_amazon_sellers_user_id 
    ON amazon_sellers (user_id) 
    WHERE user_id IS NOT NULL;

-- 6. Monthly Sales Reports Partitioned Indexing & Time Series Lookups
CREATE INDEX IF NOT EXISTS idx_monthly_sales_seller_time 
    ON monthly_sales_reports (selling_partner_id, marketplace_id, year DESC, month DESC);

CREATE INDEX IF NOT EXISTS idx_monthly_sales_status 
    ON monthly_sales_reports (report_status);

-- 7. JSONB Document Inverted Indexes (GIN) for Fast ASIN & Metadata Queries
CREATE INDEX IF NOT EXISTS idx_monthly_sales_asin_breakdown_gin 
    ON monthly_sales_reports USING GIN (asin_breakdown jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_amazon_sellers_metadata_gin 
    ON amazon_sellers USING GIN (metadata jsonb_path_ops);
