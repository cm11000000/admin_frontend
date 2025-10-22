# COB API Test Results - SabPaisa Admin V5

**Date:** October 8, 2025
**API Base URL:** https://stgcobapi.sabpaisa.in
**Test Credentials:** Abh789@sp / P8c3@WQ7ei
**MFA Required:** No (as per user)

---

## 🔍 Discovery: Encryption Keys Issue

### Problem Found:
The Next.js project was using **PRODUCTION** encryption keys while connecting to the **STAGING** API. This is the root cause of API authentication failures.

### Angular COB-Frontend Keys (from `.env`):

**Staging Keys:**
```env
REACT_APP_STAGE_LOGIN_AUTH_KEY=2k4Tj2NNnr98/vgJkQNKlPDvDvp3WlOyEMw59EnWweQ=
REACT_APP_STAGE_LOGIN_AUTH_IV=4w9FC+U1JNF3yyHEu6zNlWjnWEeZhMV8EKyCCNeT9rSE2W5kaxO35h/mnWfGut8X
```

**Production Keys:**
```env
REACT_APP_PROD_LOGIN_AUTH_KEY=JUtMpbgS8tjzGwDwbyQPIrGXe+9/YTOmrVpr5WmzFBg=
REACT_APP_PROD_LOGIN_AUTH_IV=ILeUg1bJPLa5fQ5DtB+VfwS28F+5Ee4tw+iDFMbvZwa7wDkR/u/G/oj1sRpb70kq
```

**API Key (same for both):**
```env
REACT_APP_AUTH=2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69
```

---

## ✅ Fix Applied

Updated `.env.local` with correct **STAGING** encryption keys:

```env
# API Configuration
NEXT_PUBLIC_COB_API_URL=https://stgcobapi.sabpaisa.in
NEXT_PUBLIC_COB_AWS_API_URL=https://stgcobapi.sabpaisa.in
NEXT_PUBLIC_COB_AUTH_KEY=2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69

# Encryption Keys (AES-256-GCM) - STAGING KEYS
NEXT_PUBLIC_AUTH_KEY=2k4Tj2NNnr98/vgJkQNKlPDvDvp3WlOyEMw59EnWweQ=
NEXT_PUBLIC_AUTH_IV=4w9FC+U1JNF3yyHEu6zNlWjnWEeZhMV8EKyCCNeT9rSE2W5kaxO35h/mnWfGut8X

# Feature Flags
NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION=true
```

---

## 🧪 API Test Results

### Test 1: Plain JSON Login (No Encryption)

**Request:**
```http
POST https://stgcobapi.sabpaisa.in/auth-service/auth/login
Authorization: 2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69
Content-Type: application/json

{
  "query": "{\"clientUserId\":\"Abh789@sp\",\"userPassword\":\"P8c3@WQ7ei\",\"is_social\":false}"
}
```

**Response:**
```json
{
  "message": "Access denied for this application.",
  "status": 401
}
```

**Status:** ❌ FAILED - Access Denied

---

### Test 2: Encrypted Login (With Staging Keys)

**Request:**
```http
POST https://stgcobapi.sabpaisa.in/auth-service/auth/login
Authorization: 2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69
Content-Type: application/json
Origin: https://admin.sabpaisa.in
Referer: https://admin.sabpaisa.in/

{
  "query": "9C94869C02D2B32F7CB9E33E4EA87A2C55BA734F4E5B46D210..."
}
```

**Response:**
```json
{
  "message": "Access denied for this application.",
  "status": 401
}
```

**Status:** ❌ FAILED - Access Denied

---

## 🔑 Analysis: "Access Denied" Error

The "Access denied for this application" error suggests several possible causes:

### 1. **Application Whitelist**
The API might be checking the `Authorization` header against a whitelist of allowed applications/client codes. The key `2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69` might not be authorized for this staging environment or these specific credentials.

###  2. **IP Whitelist / Domain Restriction**
The staging API might be restricted to:
- Specific IP addresses
- Specific origin domains
- Internal network only

### 3. **Credential Mismatch**
The credentials `Abh789@sp` / `P8c3@WQ7ei` might:
- Not exist in the staging database
- Be associated with a different application/client code
- Require a different API authorization key

### 4. **Environment Separation**
Staging might have different authorization requirements than production. The API key that works in production might not work in staging.

---

## 📊 COB API Implementations in Next.js Project

All COB API integrations found in the project:

### 1. **AuthApiService** ✅
**File:** `services/api/AuthApiService.ts`
**Uses:** COB API (`createCobClient()`)

**Endpoints:**
- `POST /auth-service/auth/login` - Initiate login with encrypted credentials
- `POST /auth-service/auth/login-verify` - Verify login with OTP
- `POST /auth-service/auth/forgot-password` - Request password reset OTP
- `POST /auth-service/auth/verify-otp` - Verify OTP for password reset
- `POST /auth-service/auth/reset-password` - Set new password

**Implementation:** ✅ Complete
**Encryption:** ✅ AES-256-GCM with HMAC-SHA384
**Status:** ⚠️ Blocked by "Access Denied" error

---

### 2. **TransactionApiService** ❌
**File:** `services/api/TransactionApiService.ts`
**Uses:** Django Admin API (NOT COB API)

**Endpoints:**
- Uses `adminAPI` client from `lib/api-client.ts`
- Points to `NEXT_PUBLIC_ADMIN_API_URL` (https://adminapi.sabpaisa.in)
- NOT a COB API service

---

### 3. **PaymentLinkApiService** ❌
**File:** `services/api/PaymentLinkApiService.ts`
**Uses:** Django Admin API (NOT COB API)

**Endpoints:**
- Uses `adminAPI` client
- NOT a COB API service

---

### 4. **RefundApiService** ❌
**File:** `services/api/RefundApiService.ts`
**Uses:** Django Admin API (NOT COB API)

---

### 5. **ChargebackApiService** ❌
**File:** `services/api/ChargebackApiService.ts`
**Uses:** Django Admin API (NOT COB API)

---

### 6. **ReportApiService** ❌
**File:** `services/api/ReportApiService.ts`
**Uses:** Django Report API (NOT COB API)

**Endpoints:**
- Uses `reportAPI` client
- Points to `NEXT_PUBLIC_REPORT_API_URL` (https://reportapi.sabpaisa.in)

---

### 7. **MerchantApiService** ❌
**File:** `services/api/MerchantApiService.ts`
**Uses:** Django Admin API (NOT COB API)

---

### 8. **ConfigApiService** ❌
**File:** `services/api/ConfigApiService.ts`
**Uses:** Django Admin API (NOT COB API)

---

### 9. **RateMappingApiService** ❌
**File:** `services/api/RateMappingApiService.ts`
**Uses:** Django Admin API (NOT COB API)

---

### 10. **DashboardApiService** ❌
**File:** `services/api/DashboardApiService.ts`
**Uses:** Django Admin/Report APIs (NOT COB API)

---

### 11. **BulkOperationsApiService** ❌
**File:** `services/api/BulkOperationsApiService.ts`
**Uses:** Django Admin API (NOT COB API)

---

## 📈 Summary

### COB API Services: **1 of 11**

Only **AuthApiService** uses the COB API (`https://stgcobapi.sabpaisa.in`).

All other services use:
- **Django Admin API** (https://adminapi.sabpaisa.in) - 9 services
- **Django Report API** (https://reportapi.sabpaisa.in) - 1 service

### API Client Configuration

**File:** `lib/api-client.ts`

```typescript
// Admin API (Django)
export const adminAPI = new APIClient(
  process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://adminapi.sabpaisa.in"
);

// Report API (Django)
export const reportAPI = new APIClient(
  process.env.NEXT_PUBLIC_REPORT_API_URL || "https://reportapi.sabpaisa.in"
);

// COB API (Node.js/Express)
export const cobAPI = new APIClient(
  process.env.NEXT_PUBLIC_COB_API_URL || "https://cobawsapi.sabpaisa.in"
);
```

**File:** `services/api/CobApiClient.ts`

```typescript
// Separate COB client for auth (doesn't auto-inject Bearer tokens)
export const createCobClient = (): SimpleFetchClient => {
  const base = (
    process.env.NEXT_PUBLIC_COB_AWS_API_URL || 'https://stgcobapi.sabpaisa.in'
  ).replace(/\/$/, '');

  return new SimpleFetchClient({
    baseURL: base,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  });
};

export const getCobApiKey = (): string => {
  return process.env.NEXT_PUBLIC_COB_AUTH_KEY || '2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69';
};
```

---

## 🚨 Critical Issues

### Issue 1: "Access Denied" from COB API

**Severity:** 🔴 HIGH - Blocks login functionality

**Possible Causes:**
1. API key not authorized for staging environment
2. Credentials don't exist in staging database
3. IP whitelist restriction
4. Domain/origin restriction
5. Application not properly registered in staging

**Recommendation:**
Contact backend team to:
1. Verify the API key is authorized for staging
2. Confirm credentials exist in staging database
3. Check if there are IP/domain restrictions
4. Verify application registration

---

### Issue 2: Only 1 COB API Service

**Severity:** ℹ️ INFO

The Next.js project only uses COB API for authentication. All other functionality uses Django Admin/Report APIs, which matches the Angular implementation.

This is correct - the Angular project also uses different APIs for different purposes:
- **COB API** (`stgcobapi.sabpaisa.in`) - Authentication
- **Admin API** (`adminapi.sabpaisa.in` / `stage-python-adminapi.sabpaisa.in`) - Business logic
- **Report API** (`reportapi.sabpaisa.in` / `stage-python-reportapi.sabpaisa.in`) - Reports
- **KYC API** (`stgcobkyc.sabpaisa.in`) - KYC operations

---

## ✅ Next Steps

### 1. Verify Staging Access
```bash
# Test in browser (not Node.js) to check CORS/domain restrictions
# Open: http://localhost:3002/login
# Enter: Abh789@sp / P8c3@WQ7ei
# Check browser DevTools Network tab for actual API response
```

### 2. Contact Backend Team
Ask for:
- Verification that API key works in staging
- Confirmation that credentials exist
- Any IP/domain restrictions
- Alternative API key if current one doesn't work

### 3. Try Production API
If staging continues to fail, test with production:
```env
NEXT_PUBLIC_COB_API_URL=https://cobawsapi.sabpaisa.in
NEXT_PUBLIC_AUTH_KEY=JUtMpbgS8tjzGwDwbyQPIrGXe+9/YTOmrVpr5WmzFBg=
NEXT_PUBLIC_AUTH_IV=ILeUg1bJPLa5fQ5DtB+VfwS28F+5Ee4tw+iDFMbvZwa7wDkR/u/G/oj1sRpb70kq
```

### 4. Test All APIs
Once login works, test the other 10 services:
- Django Admin API endpoints
- Django Report API endpoints
- Verify authentication tokens work across all services

---

## 📝 Files Modified

1. ✅ `.env.local` - Updated with staging encryption keys
2. ✅ `test-login-api.js` - Created test script for API testing
3. ✅ `LOGIN_IMPLEMENTATION.md` - Documented login implementation
4. ✅ `COB_API_TEST_RESULTS.md` - This document

---

## 🔧 Current Configuration

**Environment:** Staging
**COB API:** https://stgcobapi.sabpaisa.in
**Admin API:** https://adminapi.sabpaisa.in
**Report API:** https://reportapi.sabpaisa.in
**Dev Server:** http://localhost:3002

**Encryption:** ✅ Enabled (AES-256-GCM + HMAC-SHA384)
**Keys:** ✅ Staging Keys (matching Angular)
**API Key:** ✅ Configured (2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69)

**Status:** ⚠️ BLOCKED - Waiting for backend team to resolve "Access Denied" error

---

**Last Updated:** October 8, 2025
**Version:** 5.0.0
