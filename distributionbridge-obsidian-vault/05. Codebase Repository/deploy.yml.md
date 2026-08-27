# Source Code: `deploy.yml`

**Path**: `DistributionBridge/deploy.yml`

```yaml
name: DistributionBridge Production CI/CD Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

concurrency:
  group: production-deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ============================================================================
  # 1. TEST & AUDIT SUITE
  # ============================================================================
  test-and-audit:
    name: Unit Tests & Security Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: |
            backend/package.json
            package.json

      # Backend Unit Tests
      - name: Install Backend Dependencies
        working-directory: backend
        run: npm ci || npm install

      - name: Run Backend 33-Case Unit & Security Test Suite
        working-directory: backend
        run: npm test

      # Frontend Build Verification
      - name: Install Frontend Dependencies
        run: npm ci || npm install

      - name: Build Web Application Bundle
        run: npm run build

  # ============================================================================
  # 2. DEPLOY BACKEND CLOUDFLARE WORKER
  # ============================================================================
  deploy-backend:
    name: Deploy Backend Worker API
    needs: test-and-audit
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Backend Dependencies
        working-directory: backend
        run: npm ci || npm install

      - name: Deploy Cloudflare Worker to Production
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: 'backend'
          command: deploy

  # ============================================================================
  # 3. DEPLOY FRONTEND WEB APPLICATION
  # ============================================================================
  deploy-frontend:
    name: Deploy DistributionBridge Web Application
    needs: [test-and-audit, deploy-backend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Frontend Dependencies
        run: npm ci || npm install

      - name: Build Production Distribution
        run: npm run build

      - name: Deploy to Cloudflare Pages (distributionbridge.com)
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name distributionbridge --branch main

      - name: Deploy Worker Assets Fallback
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy -c worker-wrangler.json

```
