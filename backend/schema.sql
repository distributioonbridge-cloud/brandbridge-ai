-- =============================================================================
-- DistributionBridge: Monthly Sales Backend & Amazon SP-API Integration
-- PostgreSQL Database Schema
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Table: amazon_sellers (Stores Selling Partner Authorization & Credentials)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS amazon_sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    selling_partner_id VARCHAR(64) UNIQUE NOT NULL,       -- Amazon Seller Merchant ID
    user_id UUID,                                          -- DistributionBridge platform user reference
    account_name VARCHAR(255),                             -- Optional friendly name or store name
    refresh_token TEXT NOT NULL,                           -- LWA Refresh Token (long-lived)
    access_token TEXT,                                     -- Cached LWA Access Token
    access_token_expires_at TIMESTAMP WITH TIME ZONE,      -- Expiration timestamp of access_token
    token_type VARCHAR(32) DEFAULT 'bearer',
    marketplace_ids TEXT[] DEFAULT ARRAY['ATVPDKIKX0DER'], -- Array of authorized marketplaces (e.g. US, CA, UK)
    is_active BOOLEAN DEFAULT TRUE,
    auth_status VARCHAR(32) DEFAULT 'connected',           -- 'connected', 'revoked', 'expired', 'error'
    metadata JSONB DEFAULT '{}'::jsonb,                    -- Custom metadata, seller profile details
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on selling_partner_id and user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_amazon_sellers_partner_id ON amazon_sellers(selling_partner_id);
CREATE INDEX IF NOT EXISTS idx_amazon_sellers_user_id ON amazon_sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_amazon_sellers_is_active ON amazon_sellers(is_active);

-- -----------------------------------------------------------------------------
-- Table: monthly_sales_reports (Stores Aggregated Monthly SP-API Sales Data)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monthly_sales_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    selling_partner_id VARCHAR(64) NOT NULL REFERENCES amazon_sellers(selling_partner_id) ON DELETE CASCADE,
    marketplace_id VARCHAR(32) NOT NULL DEFAULT 'ATVPDKIKX0DER',
    year INT NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    total_ordered_units INT DEFAULT 0,
    total_ordered_items INT DEFAULT 0,
    total_sales_amount NUMERIC(14, 2) DEFAULT 0.00,
    currency_code VARCHAR(10) DEFAULT 'USD',
    average_selling_price NUMERIC(10, 2) DEFAULT 0.00,
    total_orders_count INT DEFAULT 0,
    fba_units_shipped INT DEFAULT 0,
    fbm_units_shipped INT DEFAULT 0,
    asin_breakdown JSONB DEFAULT '[]'::jsonb,              -- ASIN-level granular sales breakdown
    report_status VARCHAR(32) DEFAULT 'completed',         -- 'pending', 'processing', 'completed', 'failed'
    raw_payload JSONB DEFAULT '{}'::jsonb,                 -- Raw SP-API response data
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_seller_month_year_market UNIQUE (selling_partner_id, marketplace_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_sales_seller_date ON monthly_sales_reports(selling_partner_id, year, month);

-- -----------------------------------------------------------------------------
-- Trigger for updating updated_at timestamp automatically
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_amazon_sellers_updated_at ON amazon_sellers;
CREATE TRIGGER trg_amazon_sellers_updated_at
    BEFORE UPDATE ON amazon_sellers
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_monthly_sales_reports_updated_at ON monthly_sales_reports;
CREATE TRIGGER trg_monthly_sales_reports_updated_at
    BEFORE UPDATE ON monthly_sales_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
