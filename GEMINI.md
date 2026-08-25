# DistributionBridge Workspace Guidelines & Instructions

Welcome to **DistributionBridge** (Enterprise Amazon Brand Protection & Wholesale Marketplace).

---

## 📌 Critical Project Identity & Live URLs
- **Project Directory**: `C:\Users\Asus\.gemini\antigravity\scratch\DistributionBridge`
- **Live Primary Domain**: [https://distributionbridge.com/](https://distributionbridge.com/)
- **Workers Dev URL**: [https://brandbridge-ai.distributioonbridge.workers.dev/](https://brandbridge-ai.distributioonbridge.workers.dev/)
- **GitHub Repository**: [https://github.com/distributioonbridge-cloud/brandbridge-ai](https://github.com/distributioonbridge-cloud/brandbridge-ai)
- **Cloudflare Account**: `distributioonbridge@gmail.com`

---

## ⛔ Naming Enforcement Rule
- **Mandatory Brand Name**: Always use **Distribution Bridge** (or **DistributionBridge** / **DistributionBridge AI**).
- **Never Revert**: Do NOT use or re-introduce the legacy name `BrandBridge` anywhere in the website titles, logos, headers, footers, legal notices, or code.

---

## 🚀 Automated Build & Deployment Playbook

### 1. Build Production Bundle
```powershell
cd C:\Users\Asus\.gemini\antigravity\scratch\DistributionBridge
npm run build
```

### 2. Commit and Push to GitHub
```powershell
git add .
git commit -m "Describe your changes"
git push origin main
```

### 3. Deploy Live to Cloudflare (distributionbridge.com)
```powershell
# Worker Assets Deployment (routes to distributionbridge.com and workers.dev)
npx wrangler deploy -c worker-wrangler.json

# Cloudflare Pages Deployment (distributionbridge.pages.dev)
npx wrangler pages deploy dist --project-name distributionbridge --branch main
```

---

## 📁 Key Architecture Locations
- Navbar & Header Logo: `src/components/common/Navbar.tsx`
- Footer & Copyright: `src/components/common/Footer.tsx`
- Legal Case Generator: `src/components/ai/LegalCaseModal.tsx`
- Agentic MAP Scanner: `src/components/ai/AgenticScannerWidget.tsx`
- Admin Governance Portal: `src/pages/AdminDashboard.tsx`
- B2B Marketplace & Distributors: `src/pages/MarketplacePage.tsx`, `src/pages/DistributorPage.tsx`
- Logistics Directory: `src/pages/WarehousePage.tsx`
- Project Memory Document: `PROJECT_MEMORY.md`
