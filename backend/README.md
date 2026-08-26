# DistributionBridge - Monthly Sales Backend (Cloudflare Worker)

Backend service built on **Cloudflare Workers** with **PostgreSQL / Hyperdrive** for **Amazon SP-API (Selling Partner API)** and **Login with Amazon (LWA)** OAuth authentication, automated token management, and scheduled monthly sales data ingestion.

---

## 🏗️ Architecture & Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check, database diagnostics, and cron status |
| `GET` | `/api/auth/amazon` | Initiates Amazon SP-API / LWA consent flow with signed CSRF state and redirects to Amazon |
| `GET` | `/api/auth/amazon/callback` | Handles OAuth code callback, exchanges for LWA tokens, and upserts credentials in PostgreSQL via `src/db.js` |
| `POST` | `/api/auth/amazon/refresh` | Refreshes expired LWA access tokens using long-lived refresh tokens |
| `GET` | `/api/sales/monthly` | Fetches historical monthly sales and ASIN breakdown from PostgreSQL |
| `POST` | `/api/sales/sync` | Syncs and ingests monthly sales reports from Amazon SP-API for a single seller |
| `POST` | `/api/sales/sync-all` | Triggers background synchronization of monthly sales for all active connected sellers |
| `CRON` | `0 2 * * *` | Cloudflare Workers Scheduled Cron Trigger executing daily background SP-API sync runs |

---

## 📦 Key Code Modules

- [`src/amazon_spapi.js`](file:///C:/Users/Asus/.gemini/antigravity/scratch/distributionbridge-sales-backend/src/amazon_spapi.js): Amazon SP-API regional endpoint resolution, access token renewal, order metrics retrieval (`/sales/v1/orderMetrics`), schema parsing, and multi-seller sync orchestrator.
- [`src/db.js`](file:///C:/Users/Asus/.gemini/antigravity/scratch/distributionbridge-sales-backend/src/db.js): PostgreSQL connection caching with Hyperdrive support, seller credential upserts, query helpers, and monthly sales report management.
- [`src/index.js`](file:///C:/Users/Asus/.gemini/antigravity/scratch/distributionbridge-sales-backend/src/index.js): Main Worker router with HTTP `fetch` handler and Cloudflare `scheduled` cron trigger handler.
- [`src/services/lwa.js`](file:///C:/Users/Asus/.gemini/antigravity/scratch/distributionbridge-sales-backend/src/services/lwa.js): LWA OAuth token exchange and refresh operations.
- [`src/utils/crypto.js`](file:///C:/Users/Asus/.gemini/antigravity/scratch/distributionbridge-sales-backend/src/utils/crypto.js): Web Crypto HMAC-SHA256 tamper-proof signed state generation for CSRF protection.

---

## 🔑 Required Secrets & Environment Configuration

Configure production secrets with `wrangler secret put <SECRET_NAME>`:

```powershell
# 1. Login with Amazon Client ID (Amazon Developer Console)
npx wrangler secret put LWA_CLIENT_ID

# 2. Login with Amazon Client Secret
npx wrangler secret put LWA_CLIENT_SECRET

# 3. Amazon SP-API Application ID (Selling Partner App Console)
npx wrangler secret put AMAZON_APP_ID

# 4. PostgreSQL Connection String
npx wrangler secret put DATABASE_URL

# 5. Cryptographic Secret for OAuth CSRF State Signing
npx wrangler secret put CSRF_SECRET
```

---

## 🗄️ Database Setup (PostgreSQL)

Execute [`schema.sql`](file:///C:/Users/Asus/.gemini/antigravity/scratch/distributionbridge-sales-backend/schema.sql) in your PostgreSQL database instance:

```sql
-- Creates amazon_sellers and monthly_sales_reports tables with indexes and triggers
\i schema.sql
```

---

## 🧪 Testing

Run the automated test suite:
```powershell
npm test
```
*(Runs 29 unit tests covering crypto, OAuth URL builders, SP-API regional endpoints, month intervals, metrics parser, and CORS).*

---

## 🚀 Deployment

Deploy live to Cloudflare Workers:
```powershell
npm run deploy
```
