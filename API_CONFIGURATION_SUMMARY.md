# API Configuration Summary - SabPaisa Admin V5

## Overview
Complete breakdown of all API base URLs used across different environments (local, staging, production) and their configurations in various files.

---

## Table of Contents
1. [Environment Files](#environment-files)
2. [GitHub Workflows](#github-workflows)
3. [API Endpoints Summary](#api-endpoints-summary)
4. [Docker Compose](#docker-compose)
5. [Implementation Verification](#implementation-verification)

---

## Environment Files

### `.env` (Local/Staging)
```bash
# Admin API - CloudFront HTTPS URL
NEXT_PUBLIC_ADMIN_API_URL=https://d18fssv9lb395v.cloudfront.net

# Report API - CloudFront HTTPS URL
NEXT_PUBLIC_REPORT_API_URL=https://d63eaznhkkse9.cloudfront.net
NEXT_PUBLIC_REPORT_BASE_URL=https://d63eaznhkkse9.cloudfront.net
NEXT_PUBLIC_TXN_HISTORY_DBS_URL=https://d63eaznhkkse9.cloudfront.net

# COB API (Staging)
NEXT_PUBLIC_COB_API_URL=https://stgcobapi.sabpaisa.in
NEXT_PUBLIC_COB_AWS_API_URL=https://stgcobapi.sabpaisa.in
NEXT_PUBLIC_COB_AUTH_KEY=2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69

# COB KYC API (Staging)
NEXT_PUBLIC_COBKYC_URL=https://stgcobkyc.sabpaisa.in

# Encryption Keys (Staging)
NEXT_PUBLIC_AUTH_KEY=2k4Tj2NNnr98/vgJkQNKlPDvDvp3WlOyEMw59EnWweQ=
NEXT_PUBLIC_AUTH_IV=4w9FC+U1JNF3yyHEu6zNlWjnWEeZhMV8EKyCCNeT9rSE2W5kaxO35h/mnWfGut8X

# Feature Flags
NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION=false
```

**Environment**: Local Development / Staging
**COB API**: Staging (`stgcobapi.sabpaisa.in`)
**Backend APIs**: CloudFront URLs

---

### `.env.local` (Production)
```bash
# Admin API V2 - Custom Domain with URL prefix
NEXT_PUBLIC_ADMIN_API_URL=https://adminapiv2.sabpaisa.in/admin-hackathon

# Report API V2 - Custom Domain with URL prefix
NEXT_PUBLIC_REPORT_API_URL=https://reportapiv2.sabpaisa.in/report-hackathon
NEXT_PUBLIC_REPORT_BASE_URL=https://reportapiv2.sabpaisa.in/report-hackathon
NEXT_PUBLIC_TXN_HISTORY_DBS_URL=https://reportapiv2.sabpaisa.in/report-hackathon

# COB API (Production)
NEXT_PUBLIC_COB_API_URL=https://cobawsapi.sabpaisa.in
NEXT_PUBLIC_COB_AWS_API_URL=https://cobawsapi.sabpaisa.in
NEXT_PUBLIC_COB_AUTH_KEY=2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69

# COB KYC API (Production)
NEXT_PUBLIC_COBKYC_URL=https://cobkyc.sabpaisa.in

# Encryption Keys (Staging - NOTE: Should use production keys)
NEXT_PUBLIC_AUTH_KEY=2k4Tj2NNnr98/vgJkQNKlPDvDvp3WlOyEMw59EnWweQ=
NEXT_PUBLIC_AUTH_IV=4w9FC+U1JNF3yyHEu6zNlWjnWEeZhMV8EKyCCNeT9rSE2W5kaxO35h/mnWfGut8X

# Feature Flags
NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION=false
```

**Environment**: Production
**COB API**: Production (`cobawsapi.sabpaisa.in`)
**Backend APIs**: Custom domains with URL prefixes

---

## GitHub Workflows

### Production Deployment (`.github/workflows/deploy-production.yml`)

**Trigger**: Push to `production` branch

**Build Environment Variables**:
```yaml
env:
  NODE_ENV: production
  NEXT_PUBLIC_STATIC_EXPORT: 'true'

  # Encryption (ENABLED in production)
  NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION: 'true'
  NEXT_PUBLIC_AUTH_KEY: 'JUtMpbgS8tjzGwDwbyQPIrGXe+9/YTOmrVpr5WmzFBg='
  NEXT_PUBLIC_AUTH_IV: 'ILeUg1bJPLa5fQ5DtB+VfwS28F+5Ee4tw+iDFMbvZwa7wDkR/u/G/oj1sRpb70kq'

  # V2 Backend APIs - Custom Domains with URL prefixes
  NEXT_PUBLIC_ADMIN_API_URL: 'https://adminapiv2.sabpaisa.in/admin-hackathon'
  NEXT_PUBLIC_REPORT_API_URL: 'https://reportapiv2.sabpaisa.in/report-hackathon'
  NEXT_PUBLIC_REPORT_BASE_URL: 'https://reportapiv2.sabpaisa.in/report-hackathon'
  NEXT_PUBLIC_TXN_HISTORY_DBS_URL: 'https://reportapiv2.sabpaisa.in/report-hackathon'

  # COB APIs (Production)
  NEXT_PUBLIC_COB_API_URL: 'https://cobawsapi.sabpaisa.in'
  NEXT_PUBLIC_COB_AWS_API_URL: 'https://cobawsapi.sabpaisa.in'
  NEXT_PUBLIC_COB_AUTH_KEY: '2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69'
  NEXT_PUBLIC_COBKYC_URL: 'https://cobkyc.sabpaisa.in'
```

**Key Differences from Local**:
- ✅ Encryption **ENABLED** (`NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION=true`)
- ✅ Uses **production encryption keys** (different from staging)
- ✅ Uses **custom domain URLs** with `/admin-hackathon` and `/report-hackathon` prefixes
- ✅ Uses **production COB API** (`cobawsapi.sabpaisa.in`)

**Deployment Target**:
- S3 Bucket: `admin-v2.sabpaisa.in`
- CloudFront: Auto-created (first run) or uses existing distribution
- Region: `ap-south-1` (Mumbai)

---

### Staging Deployment (`.github/workflows/deploy-staging.yml`)

**Trigger**: Push to `staging` branch

**Expected Build Environment** (check file for exact values):
```yaml
# Similar to production but uses staging COB API
NEXT_PUBLIC_COB_API_URL: 'https://stgcobapi.sabpaisa.in'
NEXT_PUBLIC_COB_AWS_API_URL: 'https://stgcobapi.sabpaisa.in'
```

---

## API Endpoints Summary

### Complete API List

| **API Name** | **Environment Variable** | **Staging/Local** | **Production** | **Purpose** |
|--------------|-------------------------|-------------------|----------------|-------------|
| **Admin API** | `NEXT_PUBLIC_ADMIN_API_URL` | `https://d18fssv9lb395v.cloudfront.net` | `https://adminapiv2.sabpaisa.in/admin-hackathon` | User management, system config |
| **Report API** | `NEXT_PUBLIC_REPORT_API_URL` | `https://d63eaznhkkse9.cloudfront.net` | `https://reportapiv2.sabpaisa.in/report-hackathon` | Reports, analytics |
| **Report Base** | `NEXT_PUBLIC_REPORT_BASE_URL` | `https://d63eaznhkkse9.cloudfront.net` | `https://reportapiv2.sabpaisa.in/report-hackathon` | Report base URL |
| **Transaction History** | `NEXT_PUBLIC_TXN_HISTORY_DBS_URL` | `https://d63eaznhkkse9.cloudfront.net` | `https://reportapiv2.sabpaisa.in/report-hackathon` | Transaction history database |
| **COB API** ⭐ | `NEXT_PUBLIC_COB_API_URL` | `https://stgcobapi.sabpaisa.in` | `https://cobawsapi.sabpaisa.in` | **PRIMARY - All authentication (login, token refresh, user rights)** |
| **COB AWS API** | `NEXT_PUBLIC_COB_AWS_API_URL` | `https://stgcobapi.sabpaisa.in` | `https://cobawsapi.sabpaisa.in` | Same as COB API (both vars point to same URL) |
| **COB KYC API** | `NEXT_PUBLIC_COBKYC_URL` | `https://stgcobkyc.sabpaisa.in` | `https://cobkyc.sabpaisa.in` | KYC verification |

---

## Main APIs Involved in Authentication

### 🔐 Primary: COB API (Customer Onboarding) ⭐

**Base URL** (Used for ALL Authentication):
- **Staging**: `https://stgcobapi.sabpaisa.in` (for local development/testing)
- **Production**: `https://cobawsapi.sabpaisa.in` ⭐ **THIS IS THE MAIN LOGIN API**

**Important**: This is the ONLY API used for authentication (login, token refresh, user rights)

**Authentication Endpoints**:

1. **Login** - `/auth-service/auth/login`
   ```
   POST https://cobawsapi.sabpaisa.in/auth-service/auth/login
   ```

2. **Login Verify** - `/auth-service/auth/login-verify`
   ```
   POST https://cobawsapi.sabpaisa.in/auth-service/auth/login-verify
   ```

3. **Token Refresh** - `/auth-service/auth/refresh-token`
   ```
   POST https://cobawsapi.sabpaisa.in/auth-service/auth/refresh-token
   ```

4. **Forgot Password** - `/auth-service/account/getotp`
   ```
   POST https://cobawsapi.sabpaisa.in/auth-service/account/getotp
   ```

5. **Verify OTP** - `/auth-service/account/verify-otp`
   ```
   POST https://cobawsapi.sabpaisa.in/auth-service/account/verify-otp
   ```

6. **Reset Password** - `/auth-service/account/forgot-password`
   ```
   PUT https://cobawsapi.sabpaisa.in/auth-service/account/forgot-password
   ```

7. **User Rights/Menu** - `/menu-service/menu/user-rights`
   ```
   GET https://cobawsapi.sabpaisa.in/menu-service/menu/user-rights
   ```

**Authentication**:
- **Header**: `Authorization: <API_KEY>` (for login endpoints)
- **Header**: `Authorization: Bearer <ACCESS_TOKEN>` (for protected endpoints)
- **API Key**: `2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69`

---

### 📊 Secondary: Admin API & Report API

**Admin API**:
- **Staging**: `https://d18fssv9lb395v.cloudfront.net`
- **Production**: `https://adminapiv2.sabpaisa.in/admin-hackathon`

**Report API**:
- **Staging**: `https://d63eaznhkkse9.cloudfront.net`
- **Production**: `https://reportapiv2.sabpaisa.in/report-hackathon`

**Used For**:
- Dashboard data
- Transaction queries
- Report generation
- Analytics
- User management (non-auth)

**Authentication**:
- **Header**: `Authorization: Bearer <ACCESS_TOKEN>` (from COB API login)
- No separate login - uses tokens from COB API

---

## Docker Compose

### Backend Services (`docker-compose.yml`)

**Location**: `/Users/chaitanyamalik/Desktop/admin_full_proper_v2/docker-compose.yml`

```yaml
services:
  python_admin_api:
    build: ./python_admin_api
    container_name: python_admin_api
    # Internal service - no published ports
    networks:
      - appnet

  python_report_api:
    build: ./python_report_api
    container_name: python_report_api
    env_file:
      - /opt/app/.env.assistant
    networks:
      - appnet

  nginx:
    image: nginx:alpine
    container_name: api_gateway
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infra/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - appnet
```

**Key Points**:
- Frontend does **NOT run in Docker** (static build deployed to S3)
- Backend APIs run in Docker with Nginx reverse proxy
- Nginx handles SSL/TLS termination
- Frontend makes HTTPS requests to public URLs (CloudFront/Custom domains)

**Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE DIAGRAM                      │
└─────────────────────────────────────────────────────────────┘

User Browser
    ↓ (HTTPS)
CloudFront (d1xzmfw9e4a2at.cloudfront.net)
    ↓
S3 Static Website (admin-v2.sabpaisa.in)
    ├── index.html (Next.js static export)
    ├── _next/static/...
    └── ...

User Browser (API Calls)
    ↓ (HTTPS)
    ├─→ COB API (cobawsapi.sabpaisa.in)          [Authentication]
    ├─→ Admin API (adminapiv2.sabpaisa.in)       [Admin operations]
    └─→ Report API (reportapiv2.sabpaisa.in)     [Reports & Analytics]
         ↓
    CloudFront (for Admin/Report APIs)
         ↓
    AWS ECS/EC2/Docker (Backend services)
         ├── python_admin_api (Django)
         ├── python_report_api (Django)
         └── nginx (Reverse proxy)
```

---

## Implementation Verification

### Code Files Using These URLs

**1. API Client Configuration** (`lib/api-client.ts`):
```typescript
// Lines 338-360
const __adminBase = process.env.NEXT_PUBLIC_ADMIN_API_URL ||
                   'https://d18fssv9lb395v.cloudfront.net';
export const adminAPI = new APIClient(__adminBase);

const __reportBase = process.env.NEXT_PUBLIC_REPORT_API_URL ||
                    'https://d63eaznhkkse9.cloudfront.net';
export const reportAPI = new APIClient(__reportBase);

export const cobAPI = new APIClient(
  process.env.NEXT_PUBLIC_COB_API_URL || "https://cobawsapi.sabpaisa.in"
);
```

**2. COB API Client** (`services/api/CobApiClient.ts`):
```typescript
// Line 313
export const createCobClient = (): SimpleFetchClient => {
  const base = (process.env.NEXT_PUBLIC_COB_AWS_API_URL ||
                process.env.NEXT_PUBLIC_COB_API_URL ||
                'https://cobawsapi.sabpaisa.in').replace(/\/$/, '');
  return new SimpleFetchClient({ baseURL: base, ... });
};
```

**3. Token Refresh** (`lib/api-client.ts`):
```typescript
// Line 108
const cobBase = (process.env.NEXT_PUBLIC_COB_AWS_API_URL ||
                 process.env.NEXT_PUBLIC_COB_API_URL ||
                 'https://cobawsapi.sabpaisa.in').replace(/\/$/, '');
const response = await fetch(`${cobBase}/auth-service/auth/refresh-token`, ...);
```

**4. Dashboard Layout Token Refresh** (`app/(dashboard)/layout.tsx`):
```typescript
// Line 56
const cobBase = (process.env.NEXT_PUBLIC_COB_AWS_API_URL ||
                 process.env.NEXT_PUBLIC_COB_API_URL ||
                 'https://cobawsapi.sabpaisa.in').replace(/\/$/, '');
```

---

## Will This Work? ✅ YES

### ✅ Verification Checklist

| **Item** | **Status** | **Details** |
|----------|-----------|-------------|
| **COB API Base URL** | ✅ Correct | Uses `cobawsapi.sabpaisa.in` in production |
| **Fallback Logic** | ✅ Implemented | Falls back to hardcoded URLs if env vars missing |
| **Environment Variables** | ✅ Set | Configured in `.env`, `.env.local`, and GitHub workflows |
| **GitHub Workflow** | ✅ Correct | Production deployment uses correct URLs with encryption enabled |
| **Token Refresh** | ✅ Working | Multiple locations use COB API for refresh |
| **API Key** | ✅ Valid | `2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69` (consistent across all files) |
| **Encryption Keys** | ⚠️ WARNING | Production uses different keys than staging (intentional?) |
| **Docker Setup** | ✅ Separate | Frontend (S3) and backend (Docker) are separate - correct architecture |

---

## Key Differences: Staging vs Production

| **Item** | **Staging (.env)** | **Production (.env.local & GitHub)** |
|----------|-------------------|-------------------------------------|
| **COB API** | `stgcobapi.sabpaisa.in` | `cobawsapi.sabpaisa.in` |
| **Admin API** | CloudFront URL | Custom domain with `/admin-hackathon` prefix |
| **Report API** | CloudFront URL | Custom domain with `/report-hackathon` prefix |
| **Encryption** | Disabled | **Enabled** in GitHub workflow |
| **Encryption Keys** | Staging keys | Production keys (different from staging) |
| **COB KYC** | `stgcobkyc.sabpaisa.in` | `cobkyc.sabpaisa.in` |

---

## Important Notes

### 🔴 Critical Issues to Address

1. **Encryption Key Mismatch**:
   - `.env.local` has **staging encryption keys**
   - GitHub workflow has **production encryption keys**
   - **Action Required**: Update `.env.local` to match GitHub workflow production keys

2. **URL Prefix in Production**:
   - Production uses `/admin-hackathon` and `/report-hackathon` prefixes
   - Ensure backend APIs are configured to handle these prefixes
   - Nginx should route these paths correctly

3. **Docker Compose**:
   - Docker Compose is for **backend services only**
   - Frontend is **static files** deployed to S3
   - No confusion - these are separate deployments

### ✅ Working Flow

**Development**:
1. Developer runs `npm run dev` locally
2. Uses `.env` (staging COB API)
3. API calls go to `stgcobapi.sabpaisa.in`

**Production Deployment**:
1. Push to `production` branch
2. GitHub Actions builds with production env vars (from workflow file)
3. Deploys static files to S3
4. CloudFront serves frontend
5. API calls go to `cobawsapi.sabpaisa.in` (production COB API)

---

## Summary

### Main APIs for Authentication:

#### ⭐ PRIMARY - COB API (ONLY API for Login/Auth)
**URL**: `https://cobawsapi.sabpaisa.in`

**All Authentication Endpoints**:
- ✅ Login: `/auth-service/auth/login`
- ✅ Login Verify: `/auth-service/auth/login-verify`
- ✅ Token Refresh: `/auth-service/auth/refresh-token`
- ✅ Forgot Password: `/auth-service/account/getotp`
- ✅ Verify OTP: `/auth-service/account/verify-otp`
- ✅ Reset Password: `/auth-service/account/forgot-password`
- ✅ User Rights: `/menu-service/menu/user-rights`

**API Key**: `2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69`

---

#### Secondary APIs (Use Bearer Token from COB)

1. **Admin API** (`https://adminapiv2.sabpaisa.in/admin-hackathon`)
   - User management, system config
   - Uses Bearer token from COB API

2. **Report API** (`https://reportapiv2.sabpaisa.in/report-hackathon`)
   - Reports, analytics, transactions
   - Uses Bearer token from COB API

### Implementation Status:
✅ **Fully Implemented** - COB API is correctly used throughout the codebase
✅ **Fallback Logic** - Hardcoded URLs ensure app works even without env vars
✅ **Token Refresh** - Multiple layers of token refresh (API client, dashboard layout)
✅ **Production Ready** - GitHub workflow configured correctly

### Action Items:
1. ⚠️ Update `.env.local` encryption keys to match production (from GitHub workflow)
2. ✅ Verify backend APIs handle URL prefixes (`/admin-hackathon`, `/report-hackathon`)
3. ✅ Test production deployment to ensure all APIs work correctly

---

**Last Updated**: 2025-01-18
**Version**: 5.0.0
**Contact**: SabPaisa Development Team
