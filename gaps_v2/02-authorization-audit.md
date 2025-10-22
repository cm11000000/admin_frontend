# Authorization & Permissions Audit Report

**Date:** 2025-10-10
**Auditor:** Claude Code AI Assistant
**Scope:** SabPaisa Admin V5 (Next.js) vs Angular adminportalfrontend

---

## Executive Summary

This comprehensive audit compares the authorization and permissions implementation between the Angular and Next.js applications. The analysis reveals **critical security gaps** in permission checking and menu filtering mechanisms.

### Summary
- **Auth Mechanism:** ✅ Matching (JWT-based with Bearer tokens)
- **Token Storage:** ✅ Matching (localStorage + sessionStorage)
- **Menu Filtering:** ❌ **NOT IMPLEMENTED** in Next.js
- **Route Guards:** ⚠️ Partially Matching (client-side only)
- **User Rights Checking:** ❌ **NOT PROPERLY IMPLEMENTED**
- **Critical Security Issues:** **3 High Priority**

---

## Angular Implementation

### Auth Flow

1. **Login Request** → `/auth-service/auth/login`
   - Payload encrypted with AES-256-GCM
   - Returns `verification_token` and `is_mfa_enabled`

2. **MFA Verification** (if enabled) → `/auth-service/auth/login-verify`
   - Submits verification_token + OTP
   - Returns `accessToken`, `refreshToken`, user details

3. **Token Storage**
   - `localStorage.setItem('accessToken', token)`
   - `localStorage.setItem('refreshToken', token)`
   - `sessionStorage.setItem('bean', JSON.stringify(user))`
   - `sessionStorage.setItem('RatingUser', username)` ← **Auth check key**

4. **User Rights Check** → `/api/common-data/20/0`
   - Fetches list of authorized admin users
   - Checks if current user exists in rights list
   - Sets `localStorage.setItem('rights', '1')` or '0'
   - **CRITICAL:** Used for menu visibility and feature access

### Token Management

**Storage:**
- Primary: `localStorage.accessToken` (line 193-194 in auth.service.ts)
- Refresh: `localStorage.refreshToken` (line 196-198)
- User Bean: `sessionStorage.bean` (line 109)
- Login Check: `sessionStorage.RatingUser` (line 149-150)

**Refresh Mechanism:**
- Endpoint: `POST /auth-service/auth/refresh-token`
- Body: `{ refresh: refreshToken }`
- Returns new `accessToken`
- Auto-injects via HTTP Interceptor on 401 errors
- **File:** `/adminportalfrontend/src/app/http-interceptors/auth-interceptor.ts:28-45`

**Expiry Handling:**
- Session timeout: 900 seconds (15 minutes idle)
- Uses `BnNgIdleService` library
- Clears all tokens on timeout
- **File:** `/adminportalfrontend/src/app/app.component.ts:14-26`

### Permission Checking

**User Rights API:**
```typescript
// File: /adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:283-286
getRightUSP() {
  return this.http.get<any[]>(`${this.clientApiNewURL}` + '20/0');
}
// Endpoint: https://reportapi.sabpaisa.in/common-data/20/0
```

**Permission Logic:**
```typescript
// File: /adminportalfrontend/src/app/super-admin-portal/super-admin-dash-board/super-admin-dash-board.component.ts:191-234
getRight() {
  this.transService.getRightUSP().subscribe(
    data => {
      this.rightList = JSON.parse(JSON.stringify(data));

      // Check if username exists in rights list
      const checkrights = myParam => this.rightList.some(
        ({clientName}) => clientName === myParam
      );

      let rightReult = checkrights(
        localStorage.getItem('userName').toUpperCase().toString()
      );

      if (rightReult.toString().toUpperCase() === 'TRUE') {
        // Grant elevated permissions
        this.viewUpdateRate = true;
        this.cltActivate = true;
        this.vRateMapping = false;
        this.refundLnk = true;
        this.userActivate = false;
        localStorage.setItem('rights', '1');
      } else {
        // Basic permissions only
        localStorage.setItem('rights', '0');
      }
    }
  );
}
```

**Menu Filtering:**
```typescript
// File: /adminportalfrontend/src/app/super-admin-portal/client-list.service.ts:291-293
getNavUSP() {
  return this.http.get<any[]>(`https://cobawsapi.sabpaisa.in/get-menu-list/`, httpOptions);
}
```

**Key Features:**
- ✅ Calls `/api/common-data/20/0` on dashboard load
- ✅ Checks user against authorized list
- ✅ Sets `rights` flag in localStorage
- ✅ Conditionally shows/hides menu items based on permissions
- ✅ Hardcoded user-specific permissions (e.g., specific email addresses)

### Auth Interceptor

**File:** `/adminportalfrontend/src/app/http-interceptors/auth-interceptor.ts`

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const accessToken = localStorage.getItem('accessToken');
  let clonedReq = req;

  // Auto-inject Bearer token for specific API URLs
  const apiUrls = [
    'https://adminapi.sabpaisa.in',
    'https://reportapi.sabpaisa.in',
    'https://cobawsapi.sabpaisa.in',
    'https://cobkyc.sabpaisa.in',
    'https://cobdocs-prod.s3.amazonaws.com'
  ];

  if (apiUrls.some(url => req.url.startsWith(url))) {
    if (accessToken) {
      clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` }
      });
    }
  }

  return next.handle(clonedReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Auto-refresh token on 401
        return this.authService.refreshToken().pipe(
          switchMap(() => {
            const updatedToken = localStorage.getItem('accessToken');
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${updatedToken}` }
            });
            return next.handle(newReq);
          })
        );
      }
      return throwError(error);
    })
  );
}
```

---

## Next.js Implementation

### Auth Flow

1. **Login Request** → `/auth-service/auth/login`
   - ✅ Payload encrypted with AES-256-GCM (matches Angular)
   - ✅ Returns `verification_token` and `is_mfa_enabled`
   - **File:** `/sabpaisa_admin_v5/services/api/AuthApiService.ts:84-124`

2. **MFA Verification** → `/auth-service/auth/login-verify`
   - ✅ Submits verification_token + OTP
   - ✅ Returns accessToken, refreshToken, user details
   - **File:** `/sabpaisa_admin_v5/services/api/AuthApiService.ts:129-136`

3. **Token Storage**
   - ✅ `localStorage.setItem('accessToken', token)`
   - ✅ `localStorage.setItem('access_token', token)` (dual format)
   - ✅ `localStorage.setItem('refreshToken', token)`
   - ✅ `localStorage.setItem('user', JSON.stringify(user))`
   - ❌ **MISSING:** `sessionStorage.RatingUser` (Angular's auth check key)
   - **File:** `/sabpaisa_admin_v5/services/api/AuthApiService.ts:214-243`

4. **User Rights Check** → ✅ **CALLED** but **NOT USED**
   - ✅ Call exists in login flow: `MenuApiService.getUserRights()`
   - ❌ Results NOT stored or used for permission checks
   - ❌ Menu NOT filtered based on rights
   - **File:** `/sabpaisa_admin_v5/app/login/page.tsx:118-120, 152-154`

### Token Management

**Storage:**
- ✅ Primary: `localStorage.accessToken` + `localStorage.access_token` (dual keys)
- ✅ Refresh: `localStorage.refreshToken` + `localStorage.refresh_token`
- ✅ User: `localStorage.user` (JSON string)
- ⚠️ Also sets cookies for middleware access (but middleware doesn't use them)
- **File:** `/sabpaisa_admin_v5/services/api/AuthApiService.ts:219-242`

**Refresh Mechanism:**
- ❌ **NOT IMPLEMENTED**
- No token refresh endpoint call
- No 401 error handling with auto-refresh
- Tokens expire without renewal

**Expiry Handling:**
- ✅ JWT expiry check in layout: parses `exp` claim
- ✅ Clears tokens and redirects if expired
- ❌ **MISSING:** Idle session timeout (Angular has 15 min)
- ❌ **MISSING:** Background token refresh
- **File:** `/sabpaisa_admin_v5/app/(dashboard)/layout.tsx:48-81`

### Permission Checking

**User Rights API:**
```typescript
// File: /sabpaisa_admin_v5/services/api/MenuApiService.ts:53-77
async getUserRights(): Promise<boolean> {
  try {
    const adminClient = (await import('./AdminApiClient')).createAdminClient()
    const { data } = await adminClient.get<any[]>('/common-data/20/0')

    const userName = localStorage.getItem('userName')?.toUpperCase()
    if (!userName) return false

    // Check if user exists in rights list
    const hasRights = data.some(
      (item: any) => item.clientName === userName
    )

    // Store rights flag for permission checks
    localStorage.setItem('rights', hasRights ? '1' : '0')

    console.log(`[Menu] User ${userName} rights check:`, hasRights)
    return hasRights
  } catch (error) {
    console.error('[Menu] Failed to fetch user rights:', error)
    localStorage.setItem('rights', '0')
    return false
  }
}
```

**Status:** ✅ **API EXISTS** but ❌ **NOT PROPERLY USED**

**Menu Implementation:**
```typescript
// File: /sabpaisa_admin_v5/components/layout/sidebar.tsx:25-202
// HARDCODED: Exact response from https://cobawsapi.sabpaisa.in/get-menu-list/
// All users have full access (no permission checks)
const menuItems: MenuItem[] = [
  { id: 1, name: "Transaction Summary", url: "/dashboard", ... },
  { id: 2, name: "Transaction History", url: "/transactions", ... },
  // ... 20+ menu items
]

// Line 246-247: NO FILTERING
const visibleMenuItems = menuItems
```

**Critical Issues:**
- ❌ Menu is **HARDCODED** instead of dynamic from API
- ❌ NO permission filtering applied
- ❌ ALL users see ALL menu items regardless of rights
- ❌ `getUserRights()` called but result NOT used
- ❌ `localStorage.rights` set but NEVER checked

### API Authorization Headers

**Admin API Client:**
```typescript
// File: /sabpaisa_admin_v5/services/api/AdminApiClient.ts:22-44
private getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

private getRequestHeaders(additionalHeaders = {}): Record<string, string> {
  const headers = { ...this.config.headers, ...additionalHeaders };

  // Auto-inject Bearer token if available
  const token = this.getAuthToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
```

**Status:** ✅ **MATCHES ANGULAR** - Auto-injects Bearer token

**401/403 Error Handling:**
```typescript
// File: /sabpaisa_admin_v5/services/api/AdminApiClient.ts:81-92
if (response.status === 401 || response.status === 403) {
  console.error(`[AdminApiClient] ${response.status} - Clearing auth`);

  // Clear all auth data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');

    // Redirect to login page
    window.location.href = '/login';
  }
}
```

**Status:** ✅ Clears tokens on 401/403, ❌ **BUT NO TOKEN REFRESH ATTEMPT**

### Route Protection

**Middleware:**
```typescript
// File: /sabpaisa_admin_v5/middleware.ts:24-32
export function middleware(request: NextRequest) {
  // Allow all routes to pass through
  // Auth protection is handled client-side in layout.tsx
  return NextResponse.next()
}
```

**Status:** ❌ **NO SERVER-SIDE PROTECTION** (intentional, matches Angular)

**Client-Side Layout Guard:**
```typescript
// File: /sabpaisa_admin_v5/app/(dashboard)/layout.tsx:15-45
useEffect(() => {
  const checkLogin = (): boolean => {
    // Check for accessToken in localStorage
    const accessToken = localStorage.getItem('accessToken')
    const legacyAccessToken = localStorage.getItem('access_token')

    // Check sessionStorage for user bean
    const bean = sessionStorage.getItem('bean')
    const loginedUser = sessionStorage.getItem('loginedUser')

    // User is logged in if they have either token or session data
    return !!(accessToken || legacyAccessToken || bean || loginedUser)
  }

  const isLoggedIn = checkLogin()

  if (!isLoggedIn) {
    // Redirect to login with returnUrl
    const returnUrl = encodeURIComponent(pathname)
    router.push(`/login?returnUrl=${returnUrl}`)
    return
  }

  // Token expiry validation...
}, [router, pathname])
```

**Status:** ✅ **MATCHES ANGULAR PATTERN** - Client-side only

---

## Comparison Matrix

| Feature | Angular | Next.js | Status |
|---------|---------|---------|--------|
| **Authentication** | | | |
| JWT Bearer Tokens | ✅ | ✅ | ✅ Matching |
| AES-256-GCM Login Encryption | ✅ | ✅ | ✅ Matching |
| MFA/OTP Support | ✅ | ✅ | ✅ Matching |
| Token Storage (localStorage) | ✅ | ✅ | ✅ Matching |
| Session Storage (bean) | ✅ | ⚠️ Partial | ⚠️ Incomplete |
| Auto Bearer Token Injection | ✅ | ✅ | ✅ Matching |
| **Token Lifecycle** | | | |
| Token Refresh on 401 | ✅ | ❌ | ❌ **MISSING** |
| Idle Session Timeout | ✅ (15 min) | ❌ | ❌ **MISSING** |
| JWT Expiry Validation | ⚠️ Partial | ✅ | ⚠️ Better in Next.js |
| Background Token Renewal | ❌ | ❌ | ❌ Neither |
| **Authorization** | | | |
| User Rights API Call | ✅ | ✅ | ⚠️ Called but unused |
| Rights Check Logic | ✅ | ❌ | ❌ **NOT IMPLEMENTED** |
| Store `rights` Flag | ✅ | ✅ | ⚠️ Set but never checked |
| **Menu & UI** | | | |
| Dynamic Menu from API | ✅ | ❌ | ❌ **HARDCODED** |
| Permission-Based Filtering | ✅ | ❌ | ❌ **NOT IMPLEMENTED** |
| User-Specific Permissions | ✅ | ❌ | ❌ **NOT IMPLEMENTED** |
| Hide/Show by Rights | ✅ | ❌ | ❌ **ALL USERS SEE ALL** |
| **Route Protection** | | | |
| Client-Side Guards | ✅ | ✅ | ✅ Matching |
| Server-Side Protection | ❌ | ❌ | ✅ Matching (both client-only) |
| Return URL on Redirect | ✅ | ✅ | ✅ Matching |

---

## Gaps & Issues

### 🔴 Critical Security Issues

#### 1. **Menu Permission Bypass - All Users See All Features**

**Impact:** HIGH - Security Breach
**Severity:** CRITICAL

**Current State:**
- Menu is hardcoded with ALL 20+ items
- NO permission filtering applied
- Every logged-in user sees every feature
- Includes sensitive admin functions:
  - "Authorization" (user access management)
  - "Manage Rate Mapping" (financial config)
  - "Upload settlement Report" (financial data)
  - "Add product" (system config)

**Expected Behavior (from Angular):**
```typescript
// Angular checks rights and conditionally shows menu items
if (rightReult === 'TRUE') {
  this.viewUpdateRate = true;
  this.cltActivate = true;
  this.refundLnk = true;
  localStorage.setItem('rights', '1');
} else {
  // Hide sensitive features
  localStorage.setItem('rights', '0');
}
```

**Next.js Current Code:**
```typescript
// File: /sabpaisa_admin_v5/components/layout/sidebar.tsx:246-247
// All users have full access - no permission checks
const visibleMenuItems = menuItems  // ← NO FILTERING!
```

**Fix Required:**
```typescript
// Proposed fix
const visibleMenuItems = useMemo(() => {
  const userRights = localStorage.getItem('rights')
  const userName = localStorage.getItem('userName')

  if (userRights === '1') {
    // Show all menu items for elevated users
    return menuItems
  } else {
    // Filter out admin-only items
    return menuItems.filter(item => {
      const adminOnlyUrls = [
        '/admin/access-urm',        // Authorization
        '/config/rate-mapping/manage', // Manage Rate Mapping
        '/settlements',              // Upload Settlement
        '/admin/product',            // Add Product
        '/admin/generate-key'        // New Enc Keys
      ]
      return !adminOnlyUrls.includes(item.url)
    })
  }
}, [])
```

**Security Risk:**
- Unauthorized users can access admin pages via direct URL
- No backend permission check exists
- Financial and user management features exposed to all

---

#### 2. **Token Refresh Mechanism Missing**

**Impact:** HIGH - User Experience & Security
**Severity:** HIGH

**Current State:**
- No token refresh on 401 errors
- Users logged out immediately when token expires
- No graceful session extension

**Expected Behavior (from Angular):**
```typescript
// Angular auto-refreshes token on 401
catchError(error => {
  if (error.status === 401) {
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        const updatedToken = localStorage.getItem('accessToken');
        const newReq = req.clone({
          setHeaders: { Authorization: `Bearer ${updatedToken}` }
        });
        return next.handle(newReq);
      })
    );
  }
  return throwError(error);
})
```

**Next.js Current Code:**
```typescript
// File: /sabpaisa_admin_v5/services/api/AdminApiClient.ts:81-92
if (response.status === 401 || response.status === 403) {
  // Just clear auth and redirect - NO REFRESH ATTEMPT
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
}
```

**Fix Required:**
1. Implement refresh token endpoint call
2. Retry failed request with new token
3. Only logout if refresh also fails

```typescript
// Proposed fix
if (response.status === 401) {
  // Try to refresh token first
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) {
    try {
      const refreshResponse = await fetch(
        'https://cobawsapi.sabpaisa.in/auth-service/auth/refresh-token',
        {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (refreshResponse.ok) {
        const { access } = await refreshResponse.json()
        localStorage.setItem('accessToken', access)

        // Retry original request with new token
        return this.request(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${access}`
          }
        })
      }
    } catch (err) {
      console.error('Token refresh failed:', err)
    }
  }

  // Only logout if refresh failed
  localStorage.clear()
  window.location.href = '/login'
}
```

**User Impact:**
- Users logged out unnecessarily during active sessions
- Data loss if filling forms when token expires
- Poor UX compared to Angular version

---

#### 3. **Session Timeout Protection Missing**

**Impact:** MEDIUM - Security & UX
**Severity:** MEDIUM-HIGH

**Current State:**
- No idle session timeout
- Users stay logged in indefinitely if token hasn't expired
- Security risk on shared/public computers

**Expected Behavior (from Angular):**
```typescript
// Angular uses BnNgIdleService with 900 second (15 min) timeout
ngOnInit(): void {
  this.bnIdle.startWatching(900).subscribe((isTimedOut: boolean) => {
    if (isTimedOut) {
      if (localStorage.getItem('userName') != null) {
        alert('Session has been expired');
        sessionStorage.removeItem('bean');
        localStorage.removeItem('userName');
        this.router.navigate(['/login']);
      }
    }
  });
}
```

**Next.js Current Code:**
- ❌ No idle detection
- ❌ No session timeout

**Fix Required:**
Implement idle session timeout using browser APIs:

```typescript
// Proposed implementation in layout.tsx
useEffect(() => {
  let idleTimer: NodeJS.Timeout
  const IDLE_TIMEOUT = 900000 // 15 minutes in ms

  const resetIdleTimer = () => {
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      // Session expired due to inactivity
      alert('Session has expired due to inactivity')
      localStorage.clear()
      sessionStorage.clear()
      router.push('/login')
    }, IDLE_TIMEOUT)
  }

  // Reset timer on user activity
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  events.forEach(event => {
    window.addEventListener(event, resetIdleTimer)
  })

  resetIdleTimer() // Start timer

  return () => {
    clearTimeout(idleTimer)
    events.forEach(event => {
      window.removeEventListener(event, resetIdleTimer)
    })
  }
}, [router])
```

**Security Risk:**
- Unattended sessions remain active
- Increased risk of unauthorized access
- Does not match Angular's security posture

---

### 🟡 Medium Priority Issues

#### 4. **Dynamic Menu Not Fetched from API**

**Impact:** MEDIUM - Maintenance & Flexibility
**Current:** Hardcoded menu array
**Expected:** Fetch from `https://cobawsapi.sabpaisa.in/get-menu-list/`

**Angular Implementation:**
```typescript
getNavUSP() {
  return this.http.get<any[]>(`https://cobawsapi.sabpaisa.in/get-menu-list/`, httpOptions);
}
```

**Next.js Current:**
```typescript
// Hardcoded menu in sidebar.tsx:25-202
const menuItems: MenuItem[] = [ /* 20+ items */ ]
```

**Fix:** Fetch menu dynamically on sidebar mount

```typescript
const [menuItems, setMenuItems] = useState<MenuItem[]>([])

useEffect(() => {
  MenuApiService.getMenuList()
    .then(response => setMenuItems(response.menu_list))
    .catch(err => console.error('Failed to load menu:', err))
}, [])
```

---

#### 5. **Missing sessionStorage Bean Pattern**

**Impact:** MEDIUM - Auth State Consistency

**Angular Pattern:**
```typescript
// Stores full user bean in sessionStorage
sessionStorage.setItem('bean', JSON.stringify(user));
sessionStorage.setItem('loginedUser', 'SabPaisa Admin');
sessionStorage.setItem('RatingUser', username);
```

**Next.js Current:**
```typescript
// Only uses localStorage
localStorage.setItem('user', JSON.stringify(user))
```

**Recommendation:**
Add sessionStorage synchronization for backward compatibility:

```typescript
// In AuthApiService.storeTokensFromVerify()
sessionStorage.setItem('bean', JSON.stringify(resp))
sessionStorage.setItem('loginedUser', 'SabPaisa Admin')
sessionStorage.setItem('RatingUser', resp.userName || resp.email)
```

---

#### 6. **User Rights Check Not Enforced**

**Impact:** HIGH - Authorization Bypass

**Current State:**
- `getUserRights()` called in login flow
- Result stored in `localStorage.rights`
- **BUT:** Value never checked anywhere in app
- Menu shows all items regardless

**Fix Required:**
1. Check `localStorage.rights` in sidebar
2. Filter menu based on permissions
3. Add page-level permission checks

```typescript
// In each protected page (e.g., admin pages)
useEffect(() => {
  const userRights = localStorage.getItem('rights')
  const userName = localStorage.getItem('userName')

  if (userRights !== '1') {
    // User doesn't have admin rights
    router.push('/dashboard')
    toast.error('Access denied. You do not have permission to view this page.')
  }
}, [])
```

---

### 🟢 Low Priority / Improvements

#### 7. **No Background Token Refresh**

**Both Angular and Next.js lack this.**

**Recommendation:** Implement proactive token refresh before expiry

```typescript
useEffect(() => {
  const checkAndRefreshToken = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      // Parse JWT to get expiry
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiryTime = payload.exp * 1000
      const now = Date.now()
      const timeUntilExpiry = expiryTime - now

      // Refresh if token expires in less than 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Call refresh endpoint
          const response = await fetch(
            'https://cobawsapi.sabpaisa.in/auth-service/auth/refresh-token',
            {
              method: 'POST',
              body: JSON.stringify({ refresh: refreshToken }),
              headers: { 'Content-Type': 'application/json' }
            }
          )

          if (response.ok) {
            const { access } = await response.json()
            localStorage.setItem('accessToken', access)
            console.log('[Auth] Token refreshed proactively')
          }
        }
      }
    } catch (err) {
      console.error('[Auth] Background refresh failed:', err)
    }
  }

  // Check every minute
  const interval = setInterval(checkAndRefreshToken, 60000)
  checkAndRefreshToken() // Check immediately

  return () => clearInterval(interval)
}, [])
```

---

#### 8. **Hardcoded User Permissions in Angular**

**Angular Issue (for reference):**
```typescript
// Lines 56-95 in super-admin-dash-board.component.ts
if (this.RoleId === '1' && this.uName === 'abhas.kumar@sabpaisa.in') {
  this.vRateMapping = true;
  this.userActivate = true;
} else if (this.RoleId === '1' && this.uName === 'bhabesh.jha@sabpaisa.in') {
  this.viewUpdateRate = true;
  this.vRateMapping = true;
  // ... many more hardcoded checks
}
```

**Issue:** Permissions hardcoded per email address instead of role-based

**Recommendation for Next.js:** Use role-based permissions, not hardcoded emails

---

## Recommendations

### Immediate Actions (Before Production)

1. **🔴 CRITICAL: Implement Menu Permission Filtering**
   - Read `localStorage.rights` flag
   - Filter menu items based on user permissions
   - Hide admin features from non-admin users
   - **Timeline:** Before ANY production deployment

2. **🔴 CRITICAL: Add Token Refresh Mechanism**
   - Implement 401 error handling with token refresh
   - Retry failed requests after refresh
   - Only logout if refresh fails
   - **Timeline:** Week 1

3. **🟡 HIGH: Implement Session Timeout**
   - Add 15-minute idle timeout (matching Angular)
   - Show warning before logout
   - Clear all storage on timeout
   - **Timeline:** Week 1-2

4. **🟡 HIGH: Add Page-Level Permission Guards**
   - Check `localStorage.rights` on protected pages
   - Redirect unauthorized users to dashboard
   - Show error toast for access denied
   - **Timeline:** Week 2

### Short-Term Improvements (Next Sprint)

5. **Dynamic Menu from API**
   - Fetch menu from `/get-menu-list/` endpoint
   - Remove hardcoded menu array
   - Enable menu updates without code changes

6. **sessionStorage Synchronization**
   - Store user bean in sessionStorage (matching Angular)
   - Add `RatingUser` key for auth checks
   - Improve cross-tab consistency

7. **Background Token Refresh**
   - Proactively refresh tokens before expiry
   - Reduce 401 errors and interruptions
   - Improve user experience

### Long-Term Enhancements

8. **Role-Based Access Control (RBAC)**
   - Move away from hardcoded email checks
   - Implement proper role-based permissions
   - Create permission matrix in database

9. **Centralized Permission Service**
   - Create `PermissionService` similar to Angular
   - Provide hooks like `usePermission('admin')`
   - Consistent permission checks across app

10. **Server-Side API Authorization**
    - Add permission checks on backend APIs
    - Don't rely solely on frontend hiding
    - Implement proper backend RBAC

---

## Security Best Practices Checklist

- [x] JWT tokens stored in localStorage (acceptable for this app)
- [x] Bearer token auto-injected in API calls
- [x] 401/403 errors clear tokens and redirect
- [x] JWT expiry validation on protected routes
- [ ] **Token refresh on 401 errors**
- [ ] **Idle session timeout (15 minutes)**
- [ ] **Menu filtered by user permissions**
- [ ] **Page-level permission guards**
- [ ] **User rights API results enforced**
- [ ] Background token refresh
- [ ] Server-side permission validation
- [ ] CSRF protection (not required for API-only backend)

---

## Testing Requirements

### Unit Tests Required

1. **Permission Service Tests**
   ```typescript
   describe('PermissionService', () => {
     it('should filter menu for non-admin users', () => {
       localStorage.setItem('rights', '0')
       const filtered = filterMenuByPermissions(allMenuItems)
       expect(filtered).not.toContainUrl('/admin/access-urm')
     })

     it('should show all menu for admin users', () => {
       localStorage.setItem('rights', '1')
       const filtered = filterMenuByPermissions(allMenuItems)
       expect(filtered).toHaveLength(allMenuItems.length)
     })
   })
   ```

2. **Token Refresh Tests**
   ```typescript
   describe('AdminApiClient', () => {
     it('should refresh token on 401 and retry', async () => {
       // Mock 401 response, then successful refresh, then successful retry
     })

     it('should logout if refresh fails', async () => {
       // Mock 401 response, then failed refresh
     })
   })
   ```

3. **Session Timeout Tests**
   ```typescript
   describe('Session Timeout', () => {
     it('should logout after 15 minutes idle', () => {
       // Simulate 15 minutes of inactivity
     })

     it('should reset timer on user activity', () => {
       // Simulate mouse/keyboard events
     })
   })
   ```

### Integration Tests Required

1. **Login Flow with Permissions**
   - Login as admin user
   - Verify `rights=1` set
   - Verify all menu items visible

2. **Login Flow without Permissions**
   - Login as normal user
   - Verify `rights=0` set
   - Verify admin menu items hidden

3. **Token Expiry Handling**
   - Make API call with expired token
   - Verify token refresh triggered
   - Verify request succeeds after refresh

4. **Session Timeout**
   - Login and wait 15 minutes
   - Verify automatic logout
   - Verify redirect to login page

---

## Code References

### Angular Files
- Auth Service: `/adminportalfrontend/src/app/auth/auth.service.ts`
- Auth Guard: `/adminportalfrontend/src/app/auth/auth-guard.guard.ts`
- Auth Interceptor: `/adminportalfrontend/src/app/http-interceptors/auth-interceptor.ts`
- Client Service: `/adminportalfrontend/src/app/super-admin-portal/client-list.service.ts`
- Dashboard Component: `/adminportalfrontend/src/app/super-admin-portal/super-admin-dash-board/super-admin-dash-board.component.ts`
- App Component: `/adminportalfrontend/src/app/app.component.ts`

### Next.js Files
- Auth Service: `/sabpaisa_admin_v5/services/api/AuthApiService.ts`
- Menu Service: `/sabpaisa_admin_v5/services/api/MenuApiService.ts`
- Admin API Client: `/sabpaisa_admin_v5/services/api/AdminApiClient.ts`
- COB API Client: `/sabpaisa_admin_v5/services/api/CobApiClient.ts`
- Dashboard Layout: `/sabpaisa_admin_v5/app/(dashboard)/layout.tsx`
- Sidebar Component: `/sabpaisa_admin_v5/components/layout/sidebar.tsx`
- Login Page: `/sabpaisa_admin_v5/app/login/page.tsx`
- Middleware: `/sabpaisa_admin_v5/middleware.ts`

---

## Conclusion

The Next.js application has **strong authentication** implementation matching Angular, but **critical gaps in authorization**:

### ✅ **Working Well:**
- JWT authentication flow
- AES-256-GCM encryption
- MFA/OTP support
- Token storage
- Auto Bearer token injection
- 401/403 error handling
- JWT expiry validation

### ❌ **Critical Gaps:**
- **Menu permission filtering NOT implemented**
- **User rights checks NOT enforced**
- **Token refresh mechanism missing**
- **Session timeout missing**
- **Dynamic menu not fetched**

### 🎯 **Priority Fix Order:**
1. **Menu permission filtering** (blocking security issue)
2. **Token refresh on 401** (user experience + security)
3. **Session timeout** (security compliance)
4. **Page-level guards** (defense in depth)
5. **Dynamic menu** (maintainability)

**Estimated Fix Time:** 2-3 days for critical issues, 1 week for all recommendations

---

**Report Generated:** 2025-10-10
**Next Review:** After implementing critical fixes
