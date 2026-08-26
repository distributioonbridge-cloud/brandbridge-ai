-- =============================================================================
-- DistributionBridge: PostgreSQL RLS Seed Data & Isolation Verification Script
-- Seeds Test Investors ('inv_01' and 'inv_02'), Inventory Batches, and Allocations
-- =============================================================================

-- Ensure extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean previous test seed data if present
DELETE FROM allocations WHERE investor_id IN (SELECT id FROM investors WHERE investor_code IN ('inv_01', 'inv_02'));
DELETE FROM investor_portfolios WHERE investor_id IN (SELECT id FROM investors WHERE investor_code IN ('inv_01', 'inv_02'));
DELETE FROM investors WHERE investor_code IN ('inv_01', 'inv_02');
DELETE FROM inventory WHERE lot_number IN ('LOT-2026-08-A', 'LOT-2026-08-B', 'LOT-2026-08-C');

-- 1. Insert Test Investors
INSERT INTO investors (id, investor_code, company_name, contact_email, status)
VALUES 
    ('11111111-1111-4111-a111-111111111111'::UUID, 'inv_01', 'Alpha Capital Partners LLC', 'alpha.capital@distributionbridge.com', 'active'),
    ('22222222-2222-4222-a222-222222222222'::UUID, 'inv_02', 'Vanguard Wholesale Syndicate', 'vanguard.syndicate@distributionbridge.com', 'active')
ON CONFLICT (investor_code) DO NOTHING;

-- 2. Insert Inventory Batches
INSERT INTO inventory (id, sku, asin, lot_number, warehouse_id, units_total, units_allocated, unit_cost, status)
VALUES 
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'::UUID, 'APX-BACKPACK-BLK', 'B08XYZ1234', 'LOT-2026-08-A', 'WH-MIDWEST-01', 2000, 1200, 28.50, 'in_stock'),
    ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'::UUID, 'APX-CARABINER-2PK', 'B09ABC5678', 'LOT-2026-08-B', 'WH-WEST-02', 6000, 5500, 12.00, 'in_stock'),
    ('cccccccc-cccc-4ccc-cccc-cccccccccccc'::UUID, 'APX-SEALANT-500ML', 'B07DEF9012', 'LOT-2026-08-C', 'WH-EAST-03', 1500, 1000, 19.50, 'in_stock')
ON CONFLICT DO NOTHING;

-- 3. Insert Capital Allocations for 'inv_01'
INSERT INTO allocations (id, inventory_id, investor_id, allocated_units, committed_capital, target_roi_percent, status)
VALUES 
    ('a1111111-1111-4111-a111-111111111111'::UUID, 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'::UUID, '11111111-1111-4111-a111-111111111111'::UUID, 1200, 34200.00, 36.50, 'active'),
    ('a2222222-1111-4111-a111-111111111111'::UUID, 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'::UUID, '11111111-1111-4111-a111-111111111111'::UUID, 2000, 24000.00, 28.00, 'active')
ON CONFLICT DO NOTHING;

-- 4. Insert Capital Allocations for 'inv_02'
INSERT INTO allocations (id, inventory_id, investor_id, allocated_units, committed_capital, target_roi_percent, status)
VALUES 
    ('b1111111-2222-4222-a222-222222222222'::UUID, 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'::UUID, '22222222-2222-4222-a222-222222222222'::UUID, 3500, 42000.00, 28.00, 'active'),
    ('b2222222-2222-4222-a222-222222222222'::UUID, 'cccccccc-cccc-4ccc-cccc-cccccccccccc'::UUID, '22222222-2222-4222-a222-222222222222'::UUID, 1000, 19500.00, 32.00, 'active')
ON CONFLICT DO NOTHING;

-- 5. Insert Portfolios Summaries
INSERT INTO investor_portfolios (id, investor_id, total_invested_capital, current_asset_valuation, realized_pnl, active_deals_count, portfolio_status)
VALUES 
    ('p1111111-1111-4111-a111-111111111111'::UUID, '11111111-1111-4111-a111-111111111111'::UUID, 58200.00, 78570.00, 20370.00, 2, 'healthy'),
    ('p2222222-2222-4222-a222-222222222222'::UUID, '22222222-2222-4222-a222-222222222222'::UUID, 61500.00, 81180.00, 19680.00, 2, 'healthy')
ON CONFLICT (investor_id) DO NOTHING;
