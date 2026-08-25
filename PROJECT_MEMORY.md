# DistributionBridge - Project Memory & Knowledge Base

This document serves as the authoritative, persistent memory for the **DistributionBridge** project in Google Antigravity.

---

## 📌 Project Overview & Identity
- **Project Name**: DistributionBridge (Distribution Bridge)
- **Directory Path**: `C:\Users\Asus\.gemini\antigravity\scratch\DistributionBridge`
- **Primary Domain**: [https://distributionbridge.com/](https://distributionbridge.com/)
- **Workers Dev URL**: [https://brandbridge-ai.distributioonbridge.workers.dev/](https://brandbridge-ai.distributioonbridge.workers.dev/)
- **GitHub Repository**: [https://github.com/distributioonbridge-cloud/brandbridge-ai](https://github.com/distributioonbridge-cloud/brandbridge-ai)
- **Cloudflare Account**: `distributioonbridge@gmail.com`

---

## ⚙️ Tech Stack & Dependencies
- **Frontend Framework**: React 18 + TypeScript + Vite 5
- **Styling & UI**: Tailwind CSS + Lucide Icons + Inter Font
- **State Management**: React Context (`AuthContext`, `DataContext`)
- **Deployment Platform**: Cloudflare Workers Assets + Cloudflare Pages (`Wrangler 4.x`)
- **Version Control**: Git (`main` branch)

---

## 🛡️ Core Capabilities & Architecture

### 1. Brand Protection & Agentic MAP Enforcement
- **Continuous AI Scanner** (`AgenticScannerWidget.tsx`): 24/7 scanning of Amazon ASINs for MAP price undercutting, unauthorized sellers, and BuyBox hijacking.
- **Legal C&D Case Generator** (`LegalCaseModal.tsx`): Generates formal Amazon IP violation notices & Cease and Desist demands with evidence logs.

### 2. B2B Wholesale Marketplace & Distributor Network
- **Brand-Seller Agreements** (`MarketplacePage.tsx`): Directly connects verified wholesale sellers with Amazon Brand Registry owners.
- **Distributor Network** (`DistributorPage.tsx`): Searchable database of authorized master distributors with MOQs and regional filters.

### 3. Multi-Role Governance Dashboards
- **Brand Mode** (`BrandDashboard.tsx`): Monitor ASIN health scores, MAP violation alerts, seller authorization approvals.
- **Seller Mode** (`SellerDashboard.tsx`): Catalog access, order requests, margin calculations, MAP compliance ratings.
- **Admin Governance** (`AdminDashboard.tsx`): Platform-wide analytics, platform fees, user verification controls, system MRR.

### 4. 3PL Logistics & Warehouse Network
- **Logistics Directory** (`WarehousePage.tsx`): Directory of 3PL fulfillment centers, prep & ship services, Amazon FBA prep, hazmat, and cold storage hubs.

### 5. Billing & Subscription Integrations
- **Stripe Integration** (`StripeModal.tsx`, `PricingPage.tsx`): Built-in Stripe checkout modal supporting plan upgrades and AI scanning credit top-ups.

---

## 🚀 Deployment & Operating Playbook

### Development Commands
```powershell
# Navigate to project
cd C:\Users\Asus\.gemini\antigravity\scratch\DistributionBridge

# Start dev server
npm run dev

# Build production bundle
npm run build
```

### Git Sync Commands
```powershell
git add .
git commit -m "Your commit message"
git push origin main
```

### Cloudflare Production Deployment
```powershell
# Deploy live to Cloudflare Worker Assets (distributionbridge.com)
npx wrangler deploy -c worker-wrangler.json

# Deploy live to Cloudflare Pages (distributionbridge.pages.dev)
npx wrangler pages deploy dist --project-name distributionbridge --branch main
```

---

## 📂 Key Configuration Files
- [`package.json`](file:///C:/Users/Asus/.gemini/antigravity/scratch/DistributionBridge/package.json): Package dependencies & build scripts (`distributionbridge-ai`).
- [`worker-wrangler.json`](file:///C:/Users/Asus/.gemini/antigravity/scratch/DistributionBridge/worker-wrangler.json): Cloudflare Worker Assets configuration (`not_found_handling: "single-page-application"`).
- [`wrangler.json`](file:///C:/Users/Asus/.gemini/antigravity/scratch/DistributionBridge/wrangler.json): Cloudflare Pages project configuration (`name: "distributionbridge"`).
- [`.gitignore`](file:///C:/Users/Asus/.gemini/antigravity/scratch/DistributionBridge/.gitignore): Excludes `node_modules/`, `dist/`, `.env`, `.wrangler/`.
