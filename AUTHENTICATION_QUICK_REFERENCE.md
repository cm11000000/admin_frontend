# Authentication Quick Reference - SabPaisa Admin V5

## 🔐 Main Login API

### Base URL
```
https://cobawsapi.sabpaisa.in
```

⭐ **This is the ONLY API used for authentication (login, token refresh, user rights)**

---

## Authentication Endpoints

### 1. Login
```bash
POST https://cobawsapi.sabpaisa.in/auth-service/auth/login

Headers:
  Content-Type: application/json
  Authorization: 2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69

Body:
{
  "query": "{\"clientUserId\":\"admin@sabpaisa.com\",\"userPassword\":\"password\",\"is_social\":false}"
}

Response:
{
  "status": true,
  "verification_token": "eyJhbGci...",
  "is_mfa_enabled": false
}
```

### 2. Login Verify
```bash
POST https://cobawsapi.sabpaisa.in/auth-service/auth/login-verify

Headers:
  Content-Type: application/json
  Authorization: 2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69

Body:
{
  "verification_token": "eyJhbGci...",
  "otp": "123456"  // Empty string "" if MFA disabled
}

Response:
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "userName": "admin@sabpaisa.com",
  "email": "admin@sabpaisa.com",
  ...
}
```

### 3. Token Refresh
```bash
POST https://cobawsapi.sabpaisa.in/auth-service/auth/refresh-token

Headers:
  Content-Type: application/json

Body:
{
  "refresh": "eyJhbGci..."
}

Response:
{
  "access": "NEW_ACCESS_TOKEN",
  "refresh": "NEW_REFRESH_TOKEN"
}
```

### 4. User Rights/Menu
```bash
GET https://cobawsapi.sabpaisa.in/menu-service/menu/user-rights

Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGci...
```

---

## Environment Variables

### Production
```bash
NEXT_PUBLIC_COB_API_URL=https://cobawsapi.sabpaisa.in
NEXT_PUBLIC_COB_AWS_API_URL=https://cobawsapi.sabpaisa.in
NEXT_PUBLIC_COB_AUTH_KEY=2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69
```

### Staging (for local development)
```bash
NEXT_PUBLIC_COB_API_URL=https://stgcobapi.sabpaisa.in
NEXT_PUBLIC_COB_AWS_API_URL=https://stgcobapi.sabpaisa.in
NEXT_PUBLIC_COB_AUTH_KEY=2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69
```

---

## Complete Login Flow

```
1. User enters credentials
   ↓
2. POST /auth-service/auth/login
   → Returns verification_token + is_mfa_enabled
   ↓
3. If MFA disabled:
   → POST /auth-service/auth/login-verify (with empty OTP)
   → Returns accessToken + refreshToken
   ↓
4. If MFA enabled:
   → Show OTP input
   → POST /auth-service/auth/login-verify (with 6-digit OTP)
   → Returns accessToken + refreshToken
   ↓
5. Store tokens in localStorage + sessionStorage + cookies
   ↓
6. GET /menu-service/menu/user-rights
   → Fetch user permissions
   ↓
7. Redirect to /dashboard
```

---

## Token Storage

### localStorage (Primary)
```javascript
localStorage.setItem('accessToken', token);
localStorage.setItem('access_token', token);  // Duplicate for compatibility
localStorage.setItem('refreshToken', token);
localStorage.setItem('refresh_token', token);
localStorage.setItem('user', JSON.stringify(userObject));
localStorage.setItem('userName', 'admin@sabpaisa.com');
```

### sessionStorage (Secondary)
```javascript
sessionStorage.setItem('bean', JSON.stringify(userObject));
sessionStorage.setItem('loginedUser', 'SabPaisa Admin');
sessionStorage.setItem('RatingUser', 'admin@sabpaisa.com');
```

### Cookies (1-day expiry)
```javascript
document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
document.cookie = `refresh_token=${token}; path=/; max-age=86400; SameSite=Lax`;
```

---

## API Key

```
2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69
```

Used in `Authorization` header for:
- Login
- Login Verify
- Forgot Password
- Verify OTP
- Reset Password

---

## Bearer Token

After successful login, use the `accessToken` in `Authorization: Bearer` header for:
- User Rights/Menu
- All Admin API calls
- All Report API calls

---

## Code References

### Creating COB Client
```typescript
// services/api/CobApiClient.ts
export const createCobClient = (): SimpleFetchClient => {
  const base = (
    process.env.NEXT_PUBLIC_COB_AWS_API_URL ||
    process.env.NEXT_PUBLIC_COB_API_URL ||
    'https://cobawsapi.sabpaisa.in'
  ).replace(/\/$/, '');

  return new SimpleFetchClient({ baseURL: base, ... });
};
```

### Using COB API Service
```typescript
// services/api/AuthApiService.ts
import AuthApiService from '@/services/api/AuthApiService';

// Login
const response = await AuthApiService.login({
  clientUserId: 'admin@sabpaisa.com',
  userPassword: 'password'
});

// Login Verify
const tokens = await AuthApiService.loginVerify(
  response.verification_token,
  '123456'  // OTP, or empty string if MFA disabled
);

// Store tokens
AuthApiService.storeTokensFromVerify(tokens);
```

---

## Testing

### cURL Test
```bash
# Login
curl -X POST https://cobawsapi.sabpaisa.in/auth-service/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: 2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69" \
  -d '{
    "query": "{\"clientUserId\":\"admin@sabpaisa.com\",\"userPassword\":\"password\",\"is_social\":false}"
  }'

# Token Refresh
curl -X POST https://cobawsapi.sabpaisa.in/auth-service/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Quick Troubleshooting

| **Issue** | **Solution** |
|-----------|-------------|
| Login fails | Verify credentials with backend team |
| 401 on API call | Token expired → automatic refresh triggered |
| 403 Forbidden | User lacks permissions → contact admin |
| CORS error | Backend CORS not configured for frontend domain |
| Token refresh fails | Refresh token expired → user must re-login |

---

**Last Updated**: 2025-01-18
**Version**: 5.0.0
**Primary API**: `https://cobawsapi.sabpaisa.in` ⭐
