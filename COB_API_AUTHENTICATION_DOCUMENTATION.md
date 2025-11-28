# COB API Authentication Documentation

## Overview
This document provides comprehensive details about the authentication flow, API endpoints, payloads, and responses for the SabPaisa Admin Portal V5. The application uses the **COB (Customer Onboarding) API** for authentication services.

---

## Table of Contents
1. [API Configuration](#api-configuration)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [Payloads & Responses](#payloads--responses)
5. [Encryption Details](#encryption-details)
6. [Token Management](#token-management)
7. [Storage Strategy](#storage-strategy)
8. [Error Handling](#error-handling)

---

## API Configuration

### Base URLs
```typescript
// COB API (Used for ALL Authentication)
NEXT_PUBLIC_COB_API_URL = "https://cobawsapi.sabpaisa.in"
NEXT_PUBLIC_COB_AWS_API_URL = "https://cobawsapi.sabpaisa.in"

// Note: Both env vars point to the same URL for consistency
```

### API Authentication Key
```typescript
NEXT_PUBLIC_COB_AUTH_KEY = "2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69"
```

### Encryption Keys (AES-256-GCM)
```typescript
NEXT_PUBLIC_AUTH_KEY = "JUtMpbgS8tjzGwDwbyQPIrGXe+9/YTOmrVpr5WmzFBg="
NEXT_PUBLIC_AUTH_IV = "ILeUg1bJPLa5fQ5DtB+VfwS28F+5Ee4tw+iDFMbvZwa7wDkR/u/G/oj1sRpb70kq"
```

### Feature Flags
```typescript
NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION = "false"  // Default: disabled
NEXT_PUBLIC_DEBUG_AUTH = "false"               // Default: disabled
```

---

## Authentication Flow

### Complete Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. User enters credentials
   ├── Username (clientUserId)
   └── Password (userPassword)
        ↓
2. Frontend: POST /auth-service/auth/login
   ├── Encrypts payload (optional, controlled by feature flag)
   ├── Sends: { query: JSON or ENCRYPTED_PAYLOAD }
   └── Headers: { Authorization: API_KEY }
        ↓
3. Backend validates credentials
        ↓
4. Backend Response
   ├── status: boolean
   ├── verification_token: string
   └── is_mfa_enabled: boolean
        ↓
        ├─────────────────────────────────────────┐
        │                                          │
   [MFA Disabled]                           [MFA Enabled]
        ↓                                          ↓
5a. Frontend: POST /auth-service/auth/login-verify
    ├── verification_token                 5b. Show OTP Input Screen
    └── otp: "" (empty)                         ↓
        ↓                                    User enters OTP
6a. Backend Response:                            ↓
    ├── accessToken                        POST /auth-service/auth/login-verify
    ├── refreshToken                       ├── verification_token
    ├── userName                           └── otp: "123456"
    ├── email                                   ↓
    └── other user details                 Backend Response (same as 6a)
        ↓                                         ↓
        └─────────────────────────────────────────┘
                          ↓
7. Store tokens in:
   ├── localStorage: accessToken, refreshToken, user, userName
   ├── sessionStorage: bean, loginedUser, RatingUser
   └── cookies: access_token, refresh_token (1-day expiry)
        ↓
8. Fetch user rights/permissions
   ├── GET /menu-service/menu/user-rights
   └── Headers: { Authorization: Bearer {accessToken} }
        ↓
9. Redirect to /dashboard
```

---

## API Endpoints

### 1. Login (Initial Authentication)

**Endpoint**: `/auth-service/auth/login`
**Method**: `POST`
**Base URL**: `https://cobawsapi.sabpaisa.in` ⭐ **PRIMARY - Used for all auth**

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69"
}
```

**Request Payload**:
```typescript
{
  "query": string  // JSON string or encrypted payload
}
```

**Unencrypted Query Content** (when encryption disabled):
```json
{
  "clientUserId": "admin@sabpaisa.com",
  "userPassword": "your_password",
  "is_social": false
}
```

**Encrypted Query Content** (when encryption enabled):
```
// HEX-encoded string containing:
// HMAC (48 bytes) + IV (12 bytes) + Ciphertext + Tag (16 bytes)
```

**Response** (200 OK):
```json
{
  "status": true,
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "is_mfa_enabled": false
}
```

---

### 2. Login Verify (Complete Authentication)

**Endpoint**: `/auth-service/auth/login-verify`
**Method**: `POST`
**Base URL**: `https://cobawsapi.sabpaisa.in`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69"
}
```

**Request Payload**:
```json
{
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "otp": "123456"  // Empty string "" if MFA disabled
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxMjU5NDY2LCJpYXQiOjE3NDEyNTk0NjYsImp0aSI6IjllYjAxNjhlMThlNDRlZWU5YTQwNTRhNzk0OTU0ZThhIiwidXNlcl9pZCI6Im1kcjk2M0BzcCIsInVzZXJuYW1lIjoibWRyOTYzQHNwIiwibmFtZSI6Im1kcmVoYW4ifQ.qJI1RSqz3kBokAta0Dyx78v9FP7CkDM7TcfsJu7U4mE",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userName": "admin@sabpaisa.com",
  "email": "admin@sabpaisa.com",
  "userEmail": "admin@sabpaisa.com",
  "loginId": "admin123",
  "password_updated_at": "2025-01-15T10:30:00Z",
  "firstName": "Admin",
  "lastName": "User",
  "clientUserId": "admin@sabpaisa.com",
  "roles": ["ADMIN"],
  "permissions": ["READ", "WRITE", "DELETE"]
}
```

---

### 3. Token Refresh

**Endpoint**: `/auth-service/auth/refresh-token`
**Method**: `POST`
**Base URL**: `https://cobawsapi.sabpaisa.in`

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Payload**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "access": "NEW_ACCESS_TOKEN",
  "accessToken": "NEW_ACCESS_TOKEN",
  "refresh": "NEW_REFRESH_TOKEN",
  "refreshToken": "NEW_REFRESH_TOKEN"
}
```

---

### 4. Forgot Password (Send OTP)

**Endpoint**: `/auth-service/account/getotp`
**Method**: `POST`
**Base URL**: `https://cobawsapi.sabpaisa.in`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69"
}
```

**Request Payload**:
```json
{
  "email": "admin@sabpaisa.com",
  "otp_type": "both",  // Options: "email", "sms", "both"
  "otp_for": "Forgot Password"
}
```

**Response** (200 OK):
```json
{
  "msg": "OTP sent successfully",
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Verify OTP (Password Reset Flow)

**Endpoint**: `/auth-service/account/verify-otp`
**Method**: `POST`
**Base URL**: `https://cobawsapi.sabpaisa.in`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69"
}
```

**Request Payload**:
```json
{
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "status": true,
  "message": "OTP verified successfully"
}
```

---

### 6. Reset Password

**Endpoint**: `/auth-service/account/forgot-password`
**Method**: `PUT`
**Base URL**: `https://cobawsapi.sabpaisa.in`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69"
}
```

**Request Payload**:
```json
{
  "email": "admin@sabpaisa.com",
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "new_secure_password"
}
```

**Response** (200 OK):
```json
{
  "msg": "Password reset successfully",
  "status": true
}
```

---

### 7. Get User Rights (Post-Login)

**Endpoint**: `/menu-service/menu/user-rights`
**Method**: `GET`
**Base URL**: `https://cobawsapi.sabpaisa.in`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "menus": [
    {
      "id": 1,
      "name": "Dashboard",
      "path": "/dashboard",
      "icon": "dashboard",
      "permissions": ["READ"]
    },
    {
      "id": 2,
      "name": "Transactions",
      "path": "/transactions",
      "icon": "transactions",
      "permissions": ["READ", "WRITE"]
    }
  ]
}
```

---

## Payloads & Responses

### Login Payload (Detailed)

**TypeScript Interface**:
```typescript
interface LoginPayload {
  clientUserId: string;      // Username or email
  userPassword?: string;     // User password (optional for social login)
  is_social?: boolean;       // Social login flag (default: false)
}
```

**Example**:
```json
{
  "clientUserId": "admin@sabpaisa.com",
  "userPassword": "SecurePassword123!",
  "is_social": false
}
```

---

### Login Response (Detailed)

**TypeScript Interface**:
```typescript
interface LoginResponse {
  status: boolean;              // Login success status
  verification_token: string;   // JWT token for verification step
  is_mfa_enabled: boolean;      // Whether MFA is required
}
```

**Example**:
```json
{
  "status": true,
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjE3MDAwMDAwMDB9.signature",
  "is_mfa_enabled": false
}
```

---

### Login Verify Response (Detailed)

**TypeScript Interface**:
```typescript
interface LoginVerifyResponse {
  accessToken: string;           // JWT access token (short-lived)
  refreshToken: string;          // JWT refresh token (long-lived)
  userName: string;              // User's display name
  email?: string;                // User's email
  userEmail?: string;            // Alternative email field
  loginId?: string;              // User's login ID
  password_updated_at?: string;  // Last password update timestamp
  [key: string]: any;            // Additional user fields
}
```

**Example**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userName": "Admin User",
  "email": "admin@sabpaisa.com",
  "userEmail": "admin@sabpaisa.com",
  "loginId": "admin123",
  "password_updated_at": "2025-01-15T10:30:00Z",
  "firstName": "Admin",
  "lastName": "User",
  "clientUserId": "admin@sabpaisa.com",
  "roles": ["ADMIN", "USER"],
  "permissions": ["READ", "WRITE", "DELETE", "ADMIN"],
  "department": "Operations",
  "phone": "+91-1234567890",
  "lastLogin": "2025-01-18T09:00:00Z"
}
```

---

## Encryption Details

### Encryption Algorithm: AES-256-GCM with HMAC-SHA384

**Encryption is OPTIONAL** (controlled by `NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION` flag)

### Encryption Process

**Format**: `HMAC (48 bytes) + IV (12 bytes) + Ciphertext + Tag (16 bytes)`

**Steps**:
1. **Prepare Plaintext**: Convert login payload to JSON string
2. **Generate IV**: Use first 12 bytes of `authKeyBytes`
3. **Encrypt with AES-256-GCM**:
   - Algorithm: AES-GCM
   - Key Size: 256 bits (32 bytes)
   - IV Size: 12 bytes
   - Tag Size: 16 bytes (authentication tag)
4. **Calculate HMAC-SHA384**:
   - HMAC Key: `authIvBytes` (Base64 decoded)
   - Input: `IV + Ciphertext + Tag`
   - Output: 48 bytes
5. **Combine Components**: `HMAC + IV + Ciphertext + Tag`
6. **Encode as HEX**: Convert to uppercase hexadecimal string

**Example Code** (TypeScript):
```typescript
// Located in: lib/encryption.ts

async function encryptGCM(
  plaintext: string,
  key: string,        // Base64 encoded
  iv: string          // Base64 encoded
): Promise<string> {
  // 1. Decode Base64 keys
  const authKeyBytes = base64ToBytes(key);
  const authIvBytes = base64ToBytes(iv);

  // 2. Generate IV from first 12 bytes of auth_key
  const ivBytes = authKeyBytes.slice(0, 12);

  // 3. Encrypt with AES-GCM
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBytes, tagLength: 128 },
    cryptoKey,
    plaintextBytes
  );

  // 4. Calculate HMAC-SHA384
  const hmacBuffer = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    encryptedMessage
  );

  // 5. Combine: HMAC + IV + Ciphertext + Tag
  // 6. Return as HEX (uppercase)
  return bytesToHex(finalMessage);
}
```

### Backend Decryption

**Backend Location**: `/cob_api/api/utils/data_masking.py` (lines 111-131)

**Decryption Logic**:
1. Parse HEX string to bytes
2. Extract HMAC (first 48 bytes)
3. Verify HMAC-SHA384 over remaining data
4. Extract IV (12 bytes), Ciphertext, and Tag (16 bytes)
5. Decrypt with AES-256-GCM
6. **Fallback**: If decryption fails, return input as-is (accepts plain JSON)

**Why Fallback Exists**:
- Allows flexible deployment (encrypted or plain)
- Matches Angular admin portal behavior (plain JSON by default)
- Enables gradual migration to encrypted payloads

---

## Token Management

### Access Token

**Format**: JWT (JSON Web Token)

**Typical Payload**:
```json
{
  "token_type": "access",
  "exp": 1741259466,           // Expiry timestamp (Unix)
  "iat": 1741259466,           // Issued at timestamp
  "jti": "9eb0168e18e44eee9a4054a794954e8a",
  "user_id": "admin@sabpaisa.com",
  "username": "admin@sabpaisa.com",
  "name": "Admin User"
}
```

**Typical Expiry**: 15 minutes (900 seconds)

**Usage**: Sent in `Authorization: Bearer {token}` header for all protected API calls

---

### Refresh Token

**Format**: JWT (JSON Web Token)

**Typical Expiry**: 1 day (86400 seconds)

**Usage**: Used to obtain new access token when current one expires

**Refresh Flow**:
```typescript
// Automatically triggered on 401 Unauthorized responses
// Located in: services/api/CobApiClient.ts

async refreshAccessToken() {
  const response = await fetch('/auth-service/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken })
  });

  const { access, refresh } = await response.json();

  // Update stored tokens
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);

  // Retry original request
  return access;
}
```

---

### Proactive Token Refresh

**Strategy**: Refresh access token **2 minutes before expiry**

**Implementation** (located in `app/(dashboard)/layout.tsx`):
```typescript
function scheduleProactiveRefresh() {
  const token = localStorage.getItem('accessToken');
  const payload = decodeJwt(token);

  const expMs = payload.exp * 1000;
  const now = Date.now();
  const bufferMs = 2 * 60 * 1000; // 2 minutes

  const delay = Math.max(expMs - now - bufferMs, 5000);

  setTimeout(async () => {
    // Refresh token
    const response = await fetch('/auth-service/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken })
    });

    const { access, refresh } = await response.json();

    // Update tokens WITHOUT extending cookie expiry
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);

    // Schedule next refresh
    scheduleProactiveRefresh();
  }, delay);
}
```

**Key Points**:
- Runs in background (no user interaction required)
- Maintains 1-day session window (doesn't extend cookie expiry)
- Prevents token expiry during active usage
- Cleans up on component unmount

---

## Storage Strategy

### localStorage (Persistent)

**Purpose**: Store tokens and user data across browser sessions

**Keys Used**:
```typescript
// Access Tokens (dual keys for compatibility)
localStorage.setItem('accessToken', token);      // Angular format
localStorage.setItem('access_token', token);     // Legacy format

// Refresh Tokens (dual keys)
localStorage.setItem('refreshToken', token);
localStorage.setItem('refresh_token', token);

// User Data
localStorage.setItem('user', JSON.stringify(userObject));
localStorage.setItem('userName', 'admin@sabpaisa.com');
localStorage.setItem('loginId', 'admin123');

// Preferences
localStorage.setItem('remember_me', 'true');
```

---

### sessionStorage (Session Only)

**Purpose**: Store temporary auth data (cleared on tab close)

**Keys Used**:
```typescript
// Authentication Markers
sessionStorage.setItem('bean', JSON.stringify(userObject));
sessionStorage.setItem('loginedUser', 'SabPaisa Admin');
sessionStorage.setItem('RatingUser', 'admin@sabpaisa.com');
```

---

### Cookies (HTTP-Accessible)

**Purpose**: Enable middleware/server-side auth checks

**Format**:
```typescript
// Access Token Cookie
document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;

// Refresh Token Cookie
document.cookie = `refresh_token=${token}; path=/; max-age=86400; SameSite=Lax`;
```

**Properties**:
- **Max-Age**: 86400 seconds (1 day)
- **Path**: `/` (available to all routes)
- **SameSite**: `Lax` (CSRF protection)
- **Secure**: Not set (works on HTTP for development)

---

### Storage Hierarchy

```
┌────────────────────────────────────────────────────────┐
│                   Auth Data Storage                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│  localStorage (Primary - Persistent)                   │
│  ├── accessToken, access_token                        │
│  ├── refreshToken, refresh_token                      │
│  ├── user (full JSON)                                 │
│  ├── userName, loginId                                │
│  └── remember_me                                      │
│                                                         │
│  sessionStorage (Secondary - Session Only)             │
│  ├── bean (user JSON)                                 │
│  ├── loginedUser                                      │
│  └── RatingUser                                       │
│                                                         │
│  Cookies (Middleware Access - 1 Day)                   │
│  ├── access_token                                     │
│  └── refresh_token                                    │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## Error Handling

### 401 Unauthorized (Token Expired)

**Behavior**: Automatic token refresh

**Flow**:
```typescript
// Located in: services/api/CobApiClient.ts

if (response.status === 401) {
  // 1. Attempt token refresh
  const newToken = await refreshAccessToken();

  if (newToken) {
    // 2. Retry original request with new token
    return retryRequest(originalRequest);
  } else {
    // 3. Refresh failed - logout and redirect
    clearAuthAndRedirect();
  }
}
```

---

### 403 Forbidden (Access Denied)

**Behavior**: Immediate logout and redirect

**Flow**:
```typescript
if (response.status === 403) {
  console.error('403 Forbidden - Access denied, clearing auth');
  clearAuthAndRedirect();
}
```

---

### Request Timeout

**Default Timeout**: 30 seconds

**Behavior**: Abort request and throw timeout error

**Configuration**:
```typescript
// Located in: services/api/CobApiClient.ts

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

fetch(url, { signal: controller.signal });
```

---

### Network Errors

**Behavior**: Display user-friendly error message

**Common Errors**:
- `Network Error`: No internet connection
- `Request Timeout`: Server took too long to respond
- `Invalid Credentials`: Username or password incorrect
- `MFA Required`: OTP verification needed
- `Token Expired`: Session expired (triggers auto-refresh)

---

## Security Considerations

### 1. Encryption (Optional)
- **Algorithm**: AES-256-GCM with HMAC-SHA384
- **Default**: Disabled (matches Angular admin portal)
- **Enable**: Set `NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION=true`

### 2. Token Security
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Medium-lived (1 day)
- **Storage**: localStorage + sessionStorage + HTTP-only cookies
- **Transmission**: HTTPS only

### 3. Session Management
- **Max Session**: 1 day (enforced by cookie expiry)
- **Idle Timeout**: Not implemented (rely on token expiry)
- **Concurrent Sessions**: Allowed (no session invalidation)

### 4. CSRF Protection
- **SameSite Cookies**: `Lax` (prevents CSRF attacks)
- **API Key**: Sent in Authorization header (not in cookies)

### 5. XSS Protection
- **Content Security Policy**: Enabled in Next.js config
- **Input Sanitization**: Not implemented (rely on backend)
- **Output Encoding**: React handles automatically

---

## Implementation Files

### Core Authentication Files

1. **AuthApiService.ts** (`services/api/AuthApiService.ts`)
   - Login, login-verify, logout, forgot password, reset password
   - Token storage and retrieval

2. **CobApiClient.ts** (`services/api/CobApiClient.ts`)
   - Custom fetch client for COB API
   - Token refresh logic (401 handling)
   - Request/response interceptors

3. **encryption.ts** (`lib/encryption.ts`)
   - AES-256-GCM encryption/decryption
   - HMAC-SHA384 calculation

4. **authStore.ts** (`stores/authStore.ts`)
   - Zustand state management
   - Login/logout actions
   - Error state management

5. **login/page.tsx** (`app/login/page.tsx`)
   - Login UI component
   - OTP verification flow

6. **layout.tsx** (`app/(dashboard)/layout.tsx`)
   - Auth guard (checks tokens on mount)
   - Proactive token refresh
   - Loading states

---

## Testing

### Test Login Credentials

**Default User** (configure in backend):
```
Username: admin@sabpaisa.com
Password: [Configure in COB API backend]
```

### Test Endpoints

**Health Check**:
```bash
curl https://cobawsapi.sabpaisa.in/health
```

**Login Test** (without encryption):
```bash
curl -X POST https://cobawsapi.sabpaisa.in/auth-service/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: 2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69" \
  -d '{
    "query": "{\"clientUserId\":\"admin@sabpaisa.com\",\"userPassword\":\"password\",\"is_social\":false}"
  }'
```

**Token Refresh Test**:
```bash
curl -X POST https://cobawsapi.sabpaisa.in/auth-service/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Troubleshooting

### Issue: Login fails with "Invalid Credentials"
**Solution**: Verify username/password with backend team

### Issue: Token refresh fails (401)
**Solution**: Refresh token expired (user must re-login)

### Issue: 403 Forbidden after login
**Solution**: User lacks required permissions (contact admin)

### Issue: Encryption error
**Solution**: Disable encryption or verify `NEXT_PUBLIC_AUTH_KEY` and `NEXT_PUBLIC_AUTH_IV` match backend

### Issue: CORS errors
**Solution**: Ensure backend has correct CORS headers for `https://admin.sabpaisa.in`

---

## Summary

This document covers:
✅ Complete authentication flow (login → verify → refresh)
✅ All API endpoints with exact payloads and responses
✅ Encryption details (AES-256-GCM with HMAC-SHA384)
✅ Token management (access, refresh, proactive refresh)
✅ Storage strategy (localStorage, sessionStorage, cookies)
✅ Error handling (401, 403, timeouts)
✅ Security considerations
✅ Implementation file locations
✅ Testing instructions
✅ Troubleshooting guide

**Last Updated**: 2025-01-18
**Version**: 5.0.0
**Contact**: SabPaisa Development Team
