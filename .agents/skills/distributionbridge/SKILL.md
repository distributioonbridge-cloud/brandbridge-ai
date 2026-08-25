---
name: distributionbridge
description: >-
  Automates the development, verification, git synchronization, and live Cloudflare deployment workflow for the DistributionBridge web application. Use whenever working on, building, testing, or deploying DistributionBridge (distributionbridge.com).
---

# DistributionBridge Workflow & Deployment Skill

## Overview
This skill encapsulates the complete end-to-end workflow for developing, validating, committing, and deploying updates for **DistributionBridge** ([https://distributionbridge.com/](https://distributionbridge.com/)).

---

## Workspace & Project Location
- **Directory**: `C:\Users\Asus\.gemini\antigravity\scratch\DistributionBridge`
- **Primary Domain**: `https://distributionbridge.com/`
- **Workers Dev URL**: `https://brandbridge-ai.distributioonbridge.workers.dev/`
- **GitHub Repository**: `https://github.com/distributioonbridge-cloud/brandbridge-ai.git`

---

## Workflow Steps

### Step 1: Code Verification & Naming Audit
Before building or committing, verify that no legacy references exist:
```powershell
# Verify zero occurrences of legacy BrandBridge string in source code
grep -i "BrandBridge" src/*
```
Ensure all titles, headers, logos, and legal notices maintain **Distribution Bridge** branding.

### Step 2: Production Build
Compile the TypeScript and Vite assets:
```powershell
cd C:\Users\Asus\.gemini\antigravity\scratch\DistributionBridge
npm run build
```
Verify that `npm run build` completes cleanly with exit code 0.

### Step 3: Git Synchronization
Commit changes and push to GitHub:
```powershell
git add .
git commit -m "Update site features and assets"
git push origin main
```

### Step 4: Live Cloudflare Deployment
Deploy the compiled `dist/` directory to live Cloudflare Worker Assets & Pages:
```powershell
# Deploy to Cloudflare Worker Assets (distributionbridge.com)
npx wrangler deploy -c worker-wrangler.json

# Deploy to Cloudflare Pages (distributionbridge.pages.dev)
npx wrangler pages deploy dist --project-name distributionbridge --branch main
```

---

## Verification Protocol
After deploying, fetch and verify the live title and content from `https://distributionbridge.com/`:
```powershell
curl.exe -s -H "Cache-Control: no-cache" https://distributionbridge.com/ | Select-String -Pattern "title"
```
Expect output:
`<title>Distribution Bridge | Enterprise Amazon Brand Protection & Wholesale Marketplace</title>`
