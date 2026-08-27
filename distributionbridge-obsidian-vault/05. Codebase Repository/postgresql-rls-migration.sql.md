# Source Code: `postgresql-rls-migration.sql`

**Path**: `DistributionBridge/postgresql-rls-migration.sql`

```sql
-- =============================================================================
-- DistributionBridge: PostgreSQL Row-Level Security (RLS) Migration
-- Target: Inventory, Allocations, and Investor Portfolios Isolation
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Investors Entity Table
CREATE TABLE IF NOT EXISTS investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_code VARCHAR(64) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Inventory Lots Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(128) NOT NULL,
    asin VARCHAR(32) NOT NULL,
    lot_number VARCHAR(64) NOT NULL,
    warehouse_id VARCHAR(64) NOT NULL,
    units_total INTEGER NOT NULL CHECK (units_total >= 0),
    units_allocated INTEGER NOT NULL DEFAULT 0 CHECK (units_allocated >= 0),
    units_available INTEGER GENERATED ALWAYS AS (units_total - units_allocated) STORED,
    unit_cost NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'in_transit', 'depleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Capital Allocations Table
CREATE TABLE IF NOT EXISTS allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    allocated_units INTEGER NOT NULL CHECK (allocated_units > 0),
    committed_capital NUMERIC(12, 2) NOT NULL CHECK (committed_capital >= 0),
    target_roi_percent NUMERIC(6, 2) NOT NULL DEFAULT 25.00,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'liquidating', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Investor Portfolios Summary Table
CREATE TABLE IF NOT EXISTS investor_portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL UNIQUE REFERENCES investors(id) ON DELETE CASCADE,
    total_invested_capital NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    current_asset_valuation NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    realized_pnl NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    active_deals_count INTEGER NOT NULL DEFAULT 0,
    portfolio_status VARCHAR(32) NOT NULL DEFAULT 'healthy' CHECK (portfolio_status IN ('healthy', 'rebalancing', 'frozen')),
    last_rebalanced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-performance joins and lookups
CREATE INDEX IF NOT EXISTS idx_inventory_asin ON inventory(asin);
CREATE INDEX IF NOT EXISTS idx_allocations_investor ON allocations(investor_id);
CREATE INDEX IF NOT EXISTS idx_allocations_inventory ON allocations(inventory_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_investor ON investor_portfolios(investor_id);

-- =============================================================================
-- ENABLE ROW-LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE investor_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS rls_investor_portfolio_isolation ON investor_portfolios;
DROP POLICY IF EXISTS rls_allocations_isolation ON allocations;
DROP POLICY IF EXISTS rls_inventory_allocation_isolation ON inventory;

-- -----------------------------------------------------------------------------
-- Policy 1: Investor Portfolios Isolation
-- Access permitted if session parameter 'app.current_investor_id' matches or 'app.is_admin' = 'true'
-- -----------------------------------------------------------------------------
CREATE POLICY rls_investor_portfolio_isolation ON investor_portfolios
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_investor_id', true), '')::UUID = investor_id
        OR current_setting('app.is_admin', true) = 'true'
    )
    WITH CHECK (
        NULLIF(current_setting('app.current_investor_id', true), '')::UUID = investor_id
        OR current_setting('app.is_admin', true) = 'true'
    );

-- -----------------------------------------------------------------------------
-- Policy 2: Allocations Isolation
-- Investors can only view/insert allocations where investor_id matches active session
-- -----------------------------------------------------------------------------
CREATE POLICY rls_allocations_isolation ON allocations
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_investor_id', true), '')::UUID = investor_id
        OR current_setting('app.is_admin', true) = 'true'
    )
    WITH CHECK (
        NULLIF(current_setting('app.current_investor_id', true), '')::UUID = investor_id
        OR current_setting('app.is_admin', true) = 'true'
    );

-- -----------------------------------------------------------------------------
-- Policy 3: Inventory Access Isolation
-- Investors can only access inventory records associated with their active allocations
-- -----------------------------------------------------------------------------
CREATE POLICY rls_inventory_allocation_isolation ON inventory
    FOR SELECT
    USING (
        current_setting('app.is_admin', true) = 'true'
        OR id IN (
            SELECT inventory_id FROM allocations
            WHERE NULLIF(current_setting('app.current_investor_id', true), '')::UUID = investor_id
        )
    );

```
