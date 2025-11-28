# Login Flow Documentation - SabPaisa Admin V5

## Overview
Complete documentation for the authentication/login flow using the COB API.

---

## API Configuration

### Base URL (ONLY API Used for Login)
```
https://cobawsapi.sabpaisa.in
```

### API Authentication Key
```
2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69
```

### Environment Variables
```bash
NEXT_PUBLIC_COB_API_URL=https://cobawsapi.sabpaisa.in
NEXT_PUBLIC_COB_AWS_API_URL=https://cobawsapi.sabpaisa.in
NEXT_PUBLIC_COB_AUTH_KEY=2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69
```

---

## Complete Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPLETE LOGIN FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. User enters credentials
   ├── Username (clientUserId)
   └── Password (userPassword)
        ↓
2. Frontend: POST https://cobawsapi.sabpaisa.in/auth-service/auth/login
   ├── Headers: Authorization: <API_KEY>
   ├── Body: { query: JSON_STRING }
   └── Returns: { status, verification_token, is_mfa_enabled }
        ↓
        ├─────────────────────────────────────────┐
        │                                          │
   [MFA Disabled]                           [MFA Enabled]
        ↓                                          ↓
3a. POST /auth-service/auth/login-verify    3b. Show OTP Input Screen
    ├── verification_token                       ↓
    └── otp: "" (empty string)              User enters 6-digit OTP
        ↓                                          ↓
        │                                    POST /auth-service/auth/login-verify
        │                                    ├── verification_token
        │                                    └── otp: "123456"
        │                                          ↓
        └─────────────────────────────────────────┘
                          ↓
4. Backend Response:
   ├── accessToken
   ├── refreshToken
   ├── userName
   ├── email
   └── other user details
        ↓
5. Store tokens:
   ├── localStorage: accessToken, refreshToken, user, userName
   ├── sessionStorage: bean, loginedUser, RatingUser
   └── cookies: access_token, refresh_token (1-day expiry)
        ↓
6. Fetch user rights:
   GET https://cobawsapi.sabpaisa.in/menu-service/menu/user-rights
   └── Headers: Authorization: Bearer <accessToken>
        ↓
7. Redirect to /dashboard
```

---

## API Endpoints

### 1. Login (Step 2)

**URL**: `https://cobawsapi.sabpaisa.in/auth-service/auth/login`
**Method**: `POST`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69"
}
```

**Request Payload (Complete)**:
```json
{
  "query": "{\"clientUserId\":\"admin@sabpaisa.com\",\"userPassword\":\"password123\",\"is_social\":false}"
}
```

**What's Inside "query" (Unencrypted JSON String)**:
```json
{
  "clientUserId": "admin@sabpaisa.com",
  "userPassword": "password123",
  "is_social": false
}
```

**Field Descriptions**:
- `query` (string, required): JSON string containing login credentials
  - `clientUserId` (string, required): Username or email address
  - `userPassword` (string, required): User's password
  - `is_social` (boolean, optional): Social login flag (default: false)

**Response (200 OK)**:
```json
{
  "status": true,
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5Ac2FicGFpc2EuY29tIiwiZXhwIjoxNzQxMjU5NDY2fQ.signature",
  "is_mfa_enabled": false
}
```

**Response Field Descriptions**:
- `status` (boolean): Login success status (true = success, false = failure)
- `verification_token` (string): JWT token for the next step (login-verify)
- `is_mfa_enabled` (boolean): Whether MFA/OTP is required
  - `false` → Proceed to login-verify with empty OTP
  - `true` → Show OTP input screen

**Example Responses**:

**Success (MFA Disabled)**:
```json
{
  "status": true,
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5Ac2FicGFpc2EuY29tIiwiZXhwIjoxNzQxMjU5NDY2LCJpYXQiOjE3NDEyNTk0MDB9.dH8vR2xK9_signature",
  "is_mfa_enabled": false
}
```

**Success (MFA Enabled)**:
```json
{
  "status": true,
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5Ac2FicGFpc2EuY29tIiwiZXhwIjoxNzQxMjU5NDY2LCJpYXQiOjE3NDEyNTk0MDB9.dH8vR2xK9_signature",
  "is_mfa_enabled": true
}
```

**Error (Invalid Credentials)**:
```json
{
  "status": false,
  "message": "Invalid username or password",
  "error": "INVALID_CREDENTIALS"
}
```

**TypeScript Interfaces**:
```typescript
interface LoginPayload {
  clientUserId: string;      // Username or email
  userPassword: string;      // User password
  is_social?: boolean;       // Default: false
}

interface LoginResponse {
  status: boolean;
  verification_token: string;
  is_mfa_enabled: boolean;
}
```

---

### 2. Login Verify (Step 3a/3b)

**URL**: `https://cobawsapi.sabpaisa.in/auth-service/auth/login-verify`
**Method**: `POST`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69"
}
```

**Request Payload (MFA Disabled)**:
```json
{
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5Ac2FicGFpc2EuY29tIiwiZXhwIjoxNzQxMjU5NDY2fQ.signature",
  "otp": ""
}
```

**Request Payload (MFA Enabled)**:
```json
{
  "verification_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5Ac2FicGFpc2EuY29tIiwiZXhwIjoxNzQxMjU5NDY2fQ.signature",
  "otp": "123456"
}
```

**Field Descriptions**:
- `verification_token` (string, required): Token received from `/auth/login` endpoint
- `otp` (string, required):
  - Empty string `""` if MFA is disabled
  - 6-digit code `"123456"` if MFA is enabled

**Response (200 OK) - Complete User Data**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxMjU5NDY2LCJpYXQiOjE3NDEyNTk0NjYsImp0aSI6IjllYjAxNjhlMThlNDRlZWU5YTQwNTRhNzk0OTU0ZThhIiwidXNlcl9pZCI6ImFkbWluQHNhYnBhaXNhLmNvbSIsInVzZXJuYW1lIjoiYWRtaW5Ac2FicGFpc2EuY29tIiwibmFtZSI6IkFkbWluIFVzZXIifQ.qJI1RSqz3kBokAta0Dyx78v9FP7CkDM7TcfsJu7U4mE",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTM0NTg2NiwiaWF0IjoxNzQxMjU5NDY2LCJqdGkiOiJhYmNkZWYxMjM0NTYiLCJ1c2VyX2lkIjoiYWRtaW5Ac2FicGFpc2EuY29tIn0.dH8vR2xK9_signature",
  "userName": "admin@sabpaisa.com",
  "email": "admin@sabpaisa.com",
  "userEmail": "admin@sabpaisa.com",
  "loginId": "admin123",
  "clientUserId": "admin@sabpaisa.com",
  "firstName": "Admin",
  "lastName": "User",
  "fullName": "Admin User",
  "phone": "+91-9876543210",
  "department": "IT Operations",
  "designation": "System Administrator",
  "password_updated_at": "2025-01-15T10:30:00Z",
  "last_login": "2025-01-18T09:00:00Z",
  "account_status": "active",
  "roles": ["ADMIN", "USER", "SUPER_ADMIN"],
  "permissions": ["READ", "WRITE", "DELETE", "ADMIN_ACCESS", "USER_MANAGEMENT"],
  "settings": {
    "theme": "light",
    "language": "en",
    "notifications_enabled": true
  },
  "metadata": {
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2025-01-18T09:00:00Z"
  }
}
```

**Response Field Descriptions**:

**Authentication Tokens**:
- `accessToken` (string, required): JWT token for API calls (15 min expiry)
- `refreshToken` (string, required): JWT token to refresh access token (1 day expiry)

**User Identity**:
- `userName` (string): User's display name
- `email` (string): User's email address
- `userEmail` (string): Alternative email field (usually same as email)
- `loginId` (string): Unique login identifier
- `clientUserId` (string): Client-facing user ID

**Personal Information**:
- `firstName` (string): User's first name
- `lastName` (string): User's last name
- `fullName` (string): Full name (firstName + lastName)
- `phone` (string): Contact phone number
- `department` (string): Department name
- `designation` (string): Job title/role

**Account Information**:
- `password_updated_at` (string, ISO 8601): Last password change timestamp
- `last_login` (string, ISO 8601): Previous login timestamp
- `account_status` (string): Account status ("active", "suspended", "inactive")

**Authorization**:
- `roles` (string[]): Array of user roles
- `permissions` (string[]): Array of permission strings

**Settings & Metadata**:
- `settings` (object): User preferences
- `metadata` (object): Account metadata (timestamps, etc.)

**Example Responses**:

**Success Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userName": "admin@sabpaisa.com",
  "email": "admin@sabpaisa.com",
  "loginId": "admin123",
  "roles": ["ADMIN"],
  "permissions": ["READ", "WRITE", "DELETE"]
}
```

**Error (Invalid OTP)**:
```json
{
  "status": false,
  "message": "Invalid OTP code",
  "error": "INVALID_OTP"
}
```

**Error (Expired Token)**:
```json
{
  "status": false,
  "message": "Verification token has expired",
  "error": "TOKEN_EXPIRED"
}
```

**TypeScript Interfaces**:
```typescript
interface LoginVerifyPayload {
  verification_token: string;
  otp: string;  // Empty string "" if MFA disabled, "123456" if enabled
}

interface LoginVerifyResponse {
  // Authentication
  accessToken: string;
  refreshToken: string;

  // User Identity
  userName: string;
  email?: string;
  userEmail?: string;
  loginId?: string;
  clientUserId?: string;

  // Personal Info
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  department?: string;
  designation?: string;

  // Account Info
  password_updated_at?: string;
  last_login?: string;
  account_status?: string;

  // Authorization
  roles?: string[];
  permissions?: string[];

  // Settings
  settings?: {
    theme?: string;
    language?: string;
    notifications_enabled?: boolean;
  };

  // Metadata
  metadata?: {
    created_at?: string;
    updated_at?: string;
  };

  // Additional fields
  [key: string]: any;
}
```

---

### 3. Token Refresh (Background - Step 7+)

**URL**: `https://cobawsapi.sabpaisa.in/auth-service/auth/refresh-token`
**Method**: `POST`

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Payload**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTM0NTg2NiwiaWF0IjoxNzQxMjU5NDY2LCJqdGkiOiJhYmNkZWYxMjM0NTYiLCJ1c2VyX2lkIjoiYWRtaW5Ac2FicGFpc2EuY29tIn0.signature"
}
```

**Field Descriptions**:
- `refresh` (string, required): Refresh token received from `/auth/login-verify`

**Response (200 OK)**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxMjYwMzY2LCJpYXQiOjE3NDEyNTk0NjYsImp0aSI6Im5ld190b2tlbl9pZCIsInVzZXJfaWQiOiJhZG1pbkBzYWJwYWlzYS5jb20ifQ.new_signature",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxMjYwMzY2LCJpYXQiOjE3NDEyNTk0NjYsImp0aSI6Im5ld190b2tlbl9pZCIsInVzZXJfaWQiOiJhZG1pbkBzYWJwYWlzYS5jb20ifQ.new_signature",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTM0NTg2NiwiaWF0IjoxNzQxMjU5NDY2LCJqdGkiOiJuZXdfcmVmcmVzaF9pZCIsInVzZXJfaWQiOiJhZG1pbkBzYWJwYWlzYS5jb20ifQ.new_signature",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTM0NTg2NiwiaWF0IjoxNzQxMjU5NDY2LCJqdGkiOiJuZXdfcmVmcmVzaF9pZCIsInVzZXJfaWQiOiJhZG1pbkBzYWJwYWlzYS5jb20ifQ.new_signature"
}
```

**Response Field Descriptions**:
- `access` (string): New access token (same as accessToken)
- `accessToken` (string): New access token (15 min expiry)
- `refresh` (string): New refresh token (same as refreshToken)
- `refreshToken` (string): New refresh token (1 day expiry)

**Note**: Backend returns both `access`/`refresh` and `accessToken`/`refreshToken` for compatibility

**Error (Invalid Refresh Token)**:
```json
{
  "status": false,
  "message": "Invalid or expired refresh token",
  "error": "INVALID_REFRESH_TOKEN"
}
```

**Error (Refresh Token Expired)**:
```json
{
  "status": false,
  "message": "Refresh token has expired. Please login again.",
  "error": "REFRESH_TOKEN_EXPIRED"
}
```

**When It Happens**:
- Automatically triggered on 401 Unauthorized responses
- Proactive refresh: 2 minutes before access token expiry
- User stays logged in without re-entering credentials
- Max session: 1 day (when refresh token expires, user must re-login)

**TypeScript Interfaces**:
```typescript
interface TokenRefreshPayload {
  refresh: string;  // Refresh token
}

interface TokenRefreshResponse {
  access: string;         // New access token
  accessToken: string;    // New access token (duplicate)
  refresh: string;        // New refresh token
  refreshToken: string;   // New refresh token (duplicate)
}
```

---

### 4. Get User Rights (Step 6)

**URL**: `https://cobawsapi.sabpaisa.in/menu-service/menu/user-rights`
**Method**: `GET`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxMjU5NDY2LCJpYXQiOjE3NDEyNTk0NjYsImp0aSI6IjllYjAxNjhlMThlNDRlZWU5YTQwNTRhNzk0OTU0ZThhIiwidXNlcl9pZCI6ImFkbWluQHNhYnBhaXNhLmNvbSJ9.signature"
}
```

**Request Payload**: None (GET request)

**Response (200 OK) - Complete Menu Structure**:
```json
{
  "menus": [
    {
      "id": 1,
      "name": "Dashboard",
      "displayName": "Dashboard",
      "path": "/dashboard",
      "route": "/dashboard",
      "icon": "dashboard",
      "iconType": "lucide",
      "order": 1,
      "isActive": true,
      "isVisible": true,
      "permissions": ["READ"],
      "children": []
    },
    {
      "id": 2,
      "name": "Transactions",
      "displayName": "Transactions",
      "path": "/transactions",
      "route": "/transactions",
      "icon": "receipt",
      "iconType": "lucide",
      "order": 2,
      "isActive": true,
      "isVisible": true,
      "permissions": ["READ", "WRITE"],
      "children": [
        {
          "id": 21,
          "name": "Transaction List",
          "displayName": "All Transactions",
          "path": "/transactions/list",
          "route": "/transactions/list",
          "icon": "list",
          "order": 1,
          "permissions": ["READ"]
        },
        {
          "id": 22,
          "name": "Transaction Enquiry",
          "displayName": "Search Transactions",
          "path": "/transactions/enquiry",
          "route": "/transactions/enquiry",
          "icon": "search",
          "order": 2,
          "permissions": ["READ"]
        }
      ]
    },
    {
      "id": 3,
      "name": "Refunds",
      "displayName": "Refunds",
      "path": "/refunds",
      "route": "/refunds",
      "icon": "rotate-ccw",
      "iconType": "lucide",
      "order": 3,
      "isActive": true,
      "isVisible": true,
      "permissions": ["READ", "WRITE", "APPROVE"],
      "children": [
        {
          "id": 31,
          "name": "Refund List",
          "displayName": "All Refunds",
          "path": "/refunds/list",
          "route": "/refunds/list",
          "icon": "list",
          "order": 1,
          "permissions": ["READ"]
        },
        {
          "id": 32,
          "name": "Initiate Refund",
          "displayName": "New Refund",
          "path": "/refunds/initiate",
          "route": "/refunds/initiate",
          "icon": "plus-circle",
          "order": 2,
          "permissions": ["WRITE"]
        }
      ]
    },
    {
      "id": 4,
      "name": "Reports",
      "displayName": "Reports",
      "path": "/reports",
      "route": "/reports",
      "icon": "file-text",
      "iconType": "lucide",
      "order": 4,
      "isActive": true,
      "isVisible": true,
      "permissions": ["READ"],
      "children": []
    },
    {
      "id": 5,
      "name": "Administration",
      "displayName": "Admin",
      "path": "/admin",
      "route": "/admin",
      "icon": "settings",
      "iconType": "lucide",
      "order": 5,
      "isActive": true,
      "isVisible": true,
      "permissions": ["ADMIN"],
      "children": [
        {
          "id": 51,
          "name": "User Management",
          "displayName": "Users",
          "path": "/admin/users",
          "route": "/admin/users",
          "icon": "users",
          "order": 1,
          "permissions": ["ADMIN", "USER_MANAGEMENT"]
        },
        {
          "id": 52,
          "name": "System Config",
          "displayName": "Configuration",
          "path": "/admin/config",
          "route": "/admin/config",
          "icon": "sliders",
          "order": 2,
          "permissions": ["ADMIN", "SYSTEM_CONFIG"]
        }
      ]
    }
  ],
  "userPermissions": [
    "READ",
    "WRITE",
    "DELETE",
    "ADMIN",
    "USER_MANAGEMENT",
    "SYSTEM_CONFIG",
    "APPROVE"
  ],
  "userRoles": [
    "ADMIN",
    "SUPER_ADMIN"
  ]
}
```

**Response Field Descriptions**:

**Menu Item**:
- `id` (number): Unique menu identifier
- `name` (string): Internal menu name
- `displayName` (string): Display name for UI
- `path` (string): URL path
- `route` (string): Router path (same as path)
- `icon` (string): Icon name (Lucide React icon)
- `iconType` (string): Icon library ("lucide", "material", etc.)
- `order` (number): Display order (sorting)
- `isActive` (boolean): Whether menu is active
- `isVisible` (boolean): Whether menu is visible to user
- `permissions` (string[]): Required permissions to access
- `children` (array): Nested sub-menu items

**Top-Level Response**:
- `menus` (array): Array of menu items with nested children
- `userPermissions` (string[]): All permissions granted to user
- `userRoles` (string[]): All roles assigned to user

**Error (Unauthorized)**:
```json
{
  "status": false,
  "message": "Invalid or expired access token",
  "error": "UNAUTHORIZED"
}
```

**Error (No Permissions)**:
```json
{
  "menus": [],
  "userPermissions": [],
  "userRoles": [],
  "message": "User has no permissions assigned"
}
```

**TypeScript Interfaces**:
```typescript
interface MenuItem {
  id: number;
  name: string;
  displayName: string;
  path: string;
  route: string;
  icon: string;
  iconType?: string;
  order: number;
  isActive?: boolean;
  isVisible?: boolean;
  permissions: string[];
  children?: MenuItem[];
}

interface UserRightsResponse {
  menus: MenuItem[];
  userPermissions: string[];
  userRoles: string[];
}
```

---

## Token Storage (Step 5)

### localStorage (Primary - Persistent across sessions)
```javascript
// Access Token (dual format for compatibility)
localStorage.setItem('accessToken', token);
localStorage.setItem('access_token', token);

// Refresh Token (dual format)
localStorage.setItem('refreshToken', token);
localStorage.setItem('refresh_token', token);

// User Data
localStorage.setItem('user', JSON.stringify(userObject));
localStorage.setItem('userName', 'admin@sabpaisa.com');
localStorage.setItem('loginId', 'admin123');
```

### sessionStorage (Cleared on browser close)
```javascript
sessionStorage.setItem('bean', JSON.stringify(userObject));
sessionStorage.setItem('loginedUser', 'SabPaisa Admin');
sessionStorage.setItem('RatingUser', 'admin@sabpaisa.com');
```

### Cookies (1-day expiry, used for middleware)
```javascript
// Max-Age: 86400 seconds (1 day)
document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
document.cookie = `refresh_token=${token}; path=/; max-age=86400; SameSite=Lax`;
```

**Storage Hierarchy**:
```
Priority for token retrieval:
1. localStorage.getItem('accessToken')
2. localStorage.getItem('access_token')
3. sessionStorage.getItem('bean') (parsed for token)
```

---

## Encryption (Optional)

### Feature Flag
```bash
NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION=false  # Default: disabled
```

### Encryption Keys (if enabled)
```bash
# Production Keys
NEXT_PUBLIC_AUTH_KEY=JUtMpbgS8tjzGwDwbyQPIrGXe+9/YTOmrVpr5WmzFBg=
NEXT_PUBLIC_AUTH_IV=ILeUg1bJPLa5fQ5DtB+VfwS28F+5Ee4tw+iDFMbvZwa7wDkR/u/G/oj1sRpb70kq
```

### How It Works
- **Disabled**: Sends plain JSON (default)
- **Enabled**: Encrypts payload with AES-256-GCM + HMAC-SHA384
- **Backend**: Accepts both encrypted and plain JSON (fallback support)

**Encrypted Payload Format**:
```
HEX(HMAC-48bytes + IV-12bytes + Ciphertext + Tag-16bytes)
```

---

## Code Implementation

### 1. AuthApiService (`services/api/AuthApiService.ts`)

```typescript
import AuthApiService from '@/services/api/AuthApiService';

// Step 2: Login
const loginResponse = await AuthApiService.login({
  clientUserId: 'admin@sabpaisa.com',
  userPassword: 'password123',
  is_social: false
});

// Step 3: Login Verify
const tokens = await AuthApiService.loginVerify(
  loginResponse.verification_token,
  ''  // Empty string if MFA disabled, or "123456" if enabled
);

// Step 5: Store Tokens
AuthApiService.storeTokensFromVerify(tokens);

// Step 6: Get User Rights
const rights = await MenuApiService.getUserRights();
```

### 2. Login Page Component (`app/login/page.tsx`)

```typescript
'use client'
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const { login, loginVerify } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 2: Login
    const response = await login(email, password);

    if (!response.is_mfa_enabled) {
      // Step 3a: Verify without OTP
      await loginVerify(response.verification_token, '');

      // Step 6: Fetch user rights
      await MenuApiService.getUserRights();

      // Step 7: Redirect
      router.push('/dashboard');
    } else {
      // Step 3b: Show OTP input
      setStep('otp');
    }
  };
}
```

### 3. Auth Store (`stores/authStore.ts`)

```typescript
import { create } from 'zustand';
import AuthApiService from '@/services/api/AuthApiService';

export const useAuthStore = create<AuthState>((set) => ({
  login: async (email: string, password: string) => {
    const response = await AuthApiService.login({
      clientUserId: email,
      userPassword: password,
      is_social: false
    });
    return response;
  },

  loginVerify: async (verificationToken: string, otp: string) => {
    const resp = await AuthApiService.loginVerify(verificationToken, otp);
    AuthApiService.storeTokensFromVerify(resp);
    return resp;
  }
}));
```

### 4. COB API Client (`services/api/CobApiClient.ts`)

```typescript
export const createCobClient = (): SimpleFetchClient => {
  const base = (
    process.env.NEXT_PUBLIC_COB_AWS_API_URL ||
    process.env.NEXT_PUBLIC_COB_API_URL ||
    'https://cobawsapi.sabpaisa.in'
  ).replace(/\/$/, '');

  return new SimpleFetchClient({
    baseURL: base,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000
  });
};
```

---

## Testing

### cURL Examples

**1. Test Login**:
```bash
curl -X POST https://cobawsapi.sabpaisa.in/auth-service/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: 2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69" \
  -d '{
    "query": "{\"clientUserId\":\"admin@sabpaisa.com\",\"userPassword\":\"password\",\"is_social\":false}"
  }'
```

**Expected Response**:
```json
{
  "status": true,
  "verification_token": "eyJhbGci...",
  "is_mfa_enabled": false
}
```

**2. Test Login Verify (No MFA)**:
```bash
curl -X POST https://cobawsapi.sabpaisa.in/auth-service/auth/login-verify \
  -H "Content-Type: application/json" \
  -H "Authorization: 2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69" \
  -d '{
    "verification_token": "eyJhbGci...",
    "otp": ""
  }'
```

**3. Test Token Refresh**:
```bash
curl -X POST https://cobawsapi.sabpaisa.in/auth-service/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJhbGci..."
  }'
```

**4. Test User Rights**:
```bash
curl -X GET https://cobawsapi.sabpaisa.in/menu-service/menu/user-rights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGci..."
```

---

## Error Handling

### 401 Unauthorized (Token Expired)
**Behavior**: Automatic token refresh

**Flow**:
```
API returns 401
    ↓
Try to refresh token using refresh_token
    ↓
If refresh succeeds:
    → Store new tokens
    → Retry original request
    ↓
If refresh fails:
    → Clear all auth data
    → Redirect to /login
```

### 403 Forbidden (Access Denied)
**Behavior**: Immediate logout

**Flow**:
```
API returns 403
    ↓
Clear localStorage + sessionStorage + cookies
    ↓
Redirect to /login
```

### Request Timeout (30 seconds)
**Behavior**: Show timeout error

```javascript
{
  status: 408,
  success: false,
  error: "Request timeout"
}
```

---

## Token Details

### Access Token
**Format**: JWT (JSON Web Token)

**Payload Example**:
```json
{
  "token_type": "access",
  "exp": 1741259466,
  "iat": 1741259466,
  "jti": "9eb0168e18e44eee9a4054a794954e8a",
  "user_id": "admin@sabpaisa.com",
  "username": "admin@sabpaisa.com",
  "name": "Admin User"
}
```

**Typical Expiry**: 15 minutes (900 seconds)

**Usage**: `Authorization: Bearer <token>` header

### Refresh Token
**Format**: JWT

**Typical Expiry**: 1 day (86400 seconds)

**Usage**: Refresh access token when it expires

---

## Security

### 1. HTTPS Only
All requests use HTTPS (`https://cobawsapi.sabpaisa.in`)

### 2. API Key
Sent in `Authorization` header for login endpoints

### 3. Bearer Token
Sent in `Authorization: Bearer` header for protected endpoints

### 4. Token Expiry
- Access Token: 15 minutes (prevents long-lived access)
- Refresh Token: 1 day (max session duration)
- Cookies: 1 day (frontend session control)

### 5. CSRF Protection
- SameSite=Lax cookies
- No CSRF token needed (API uses Bearer auth, not cookies for auth)

### 6. Storage Security
- localStorage: Accessible by JavaScript (XSS risk - mitigated by CSP)
- sessionStorage: Cleared on tab close
- Cookies: SameSite protection

---

## Troubleshooting

| **Issue** | **Cause** | **Solution** |
|-----------|----------|--------------|
| Login fails with "Invalid Credentials" | Wrong username/password | Verify credentials with backend team |
| 401 after login | Token expired immediately | Check system clock, verify token expiry in backend |
| Token refresh fails | Refresh token expired | User must re-login (session > 1 day) |
| 403 Forbidden | User lacks permissions | Contact admin to grant permissions |
| CORS error | Backend CORS not configured | Backend must allow `https://admin-v2.sabpaisa.in` origin |
| White screen after login | Frontend redirect issue | Check console logs, verify `/dashboard` route exists |
| OTP not received | Email/SMS service issue | Check backend logs, verify email/SMS service |

---

## Summary

### ✅ Single API for Login
```
https://cobawsapi.sabpaisa.in
```

### ✅ 4 Endpoints
1. **Login**: `/auth-service/auth/login`
2. **Login Verify**: `/auth-service/auth/login-verify`
3. **Token Refresh**: `/auth-service/auth/refresh-token`
4. **User Rights**: `/menu-service/menu/user-rights`

### ✅ Authentication Flow
```
Login → Login Verify → Store Tokens → Get User Rights → Redirect to Dashboard
```

### ✅ Token Management
- Access Token: 15 min expiry (auto-refresh)
- Refresh Token: 1 day expiry (re-login required)
- Storage: localStorage + sessionStorage + cookies

### ✅ Security
- HTTPS only
- API Key for login
- Bearer token for protected endpoints
- Automatic token refresh on 401

---

**Last Updated**: 2025-01-18
**Version**: 5.0.0
**API**: `https://cobawsapi.sabpaisa.in`
