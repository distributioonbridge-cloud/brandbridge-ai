# 🌐 DistributionBridge Central Knowledge Hub

Welcome to the **DistributionBridge Knowledge Vault**. This interactive directory unifies the technical architecture, security covenants, frontend interfaces, and testing infrastructure of Project DistributionBridge.

---

## 🏛️ The 4 Core Technical Pillars

```
+-----------------------------------------------------------------------------------+
|                        DISTRIBUTIONBRIDGE ARCHITECTURE                            |
+-------------------------+-------------------------+-------------------------------+
| 01. AI SOURCING &       | 02. BRAND GOVERNANCE    | 03. SUPPLY CHAIN &           |
|     DEAL TRIAGE         |     & MAP DEFENSE       |     3PL LOGISTICS             |
| [[01.1 AI Sourcing &    | [[01.2 Brand Governance | [[01.3 Supply Chain &         |
|   Triage Engine]]       |   & MAP Defense]]       |   Logistics]]                 |
+-------------------------+-------------------------+-------------------------------+
|                         04. FINANCIAL ANALYTICS & RLS ISOLATION                   |
|                         [[01.4 Financial Analytics & Yield Modeling]]             |
+-----------------------------------------------------------------------------------+
```

---

## 📂 Vault Navigation Map

### 📑 [[00. Project Hub]]
- [[DistributionBridge Central Hub]] — Master system architecture index and interactive node graph.

### 🏛️ [[01. System Pillars]]
- [[01.1 AI Sourcing & Triage Engine]] — Amazon SP-API catalog ingestion, BuyBox margin evaluation, and algorithmic deal scoring.
- [[01.2 Brand Governance & MAP Defense]] — Real-time price undercutting surveillance and automated 1-click legal C&D dispatch.
- [[01.3 Supply Chain & Logistics]] — 3PL cross-docking hub network and dynamic pallet quote engine (linked to [[saas-portal-v3.tsx]]).
- [[01.4 Financial Analytics & Yield Modeling]] — Real-time wholesale APY yields, FBA fee deductions, and syndication liquidity returns.

### 🖥️ [[02. Frontend Portals]]
- [[02.1 Next.js 14 App Architecture]] — React 18 / Next.js 14 App Router layout, Tailwind styling, and dynamic state tracking.
- [[02.2 Landing Page & 3D Projection Matrix]] — HTML5 Canvas perspective projection matrix and state-bound range sliders (see [[landing-page-v5.tsx]]).
- [[02.3 Enterprise SaaS Console & Bento Grid]] — Sidebar-driven SaaS operations portal with live GMV stream (see [[saas-portal-v3.tsx]]).
- [[02.4 Onboarding & Registration Wizard]] — 4-Step onboarding flow with SP-API LWA connection (see [[register-page-v2.tsx]]).
- [[02.5 Organization Settings Portal]] — 5-Tab enterprise configuration center (see [[settings-page-v2.tsx]]).

### 🔒 [[03. Edge Security]]
- [[03.1 Cloudflare Worker Edge Architecture]] — Serverless edge routing on `sales-backend.distributionbridge.com`.
- [[03.2 Session & Auth Controllers]] — PBKDF2 cryptography, cookie serialization, and HMAC-SHA256 OAuth (see [[auth.js]], [[login.js]], and [[amazon-callback.js]]).
- [[03.3 Row-Level Security Schema]] — PostgreSQL tenant isolation covenants and covering indexes (see [[postgresql-rls-migration.sql]] and [[db-index-optimizations.sql]]).
- [[03.4 Amazon LWA & SP-API OAuth Pipeline]] — Login with Amazon (LWA) token exchange and AES-256-GCM token storage.

### 🧪 [[04. Automated Testing & CI-CD]]
- [[04.1 End-to-End Playwright Audits]] — Full end-to-end integration test runners (see [[integration-audit-v2.spec.js]] and [[run-local-audit.sh]]).
- [[04.2 Multi-Viewport Visual Regression & Golden Snapshots]] — Responsive golden snapshot tests across desktop, tablet, and mobile (see [[visual-audit.spec.js]]).
- [[04.3 GitHub Actions & Edge Deployment Pipeline]] — Production CI/CD workflows and automated worker deployments (see [[deploy.yml]] and [[audit_pipeline.py]]).

### 📦 [[05. Codebase Repository]]
- Raw source code nodes for every audited file in the stack.
