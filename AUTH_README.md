# SabPaisa Admin v5 - Authentication System

A world-class authentication system built with Next.js 14, featuring mobile-first design, exceptional UX, and enterprise-grade security.

## Features

### Authentication Flow
- **Email + Password Login** with AES-256-GCM encryption
- **Multi-Factor Authentication (MFA)** with OTP verification
- **Forgot Password** flow with email verification
- **Password Reset** with strength validation
- **Remember Me** functionality
- **Auto-redirect** after authentication

### User Experience
- **Mobile-First Design** - Optimized for all screen sizes
- **Touch-Friendly** - All interactive elements are min 44px for easy tapping
- **Smooth Animations** - Framer Motion powered transitions
- **Real-time Validation** - Instant feedback on form inputs
- **Password Strength Indicator** - Visual feedback on password quality
- **Caps Lock Detection** - Warning when caps lock is on
- **Auto-focus** - Smart input focus management (especially for OTP)
- **Paste Support** - OTP inputs support paste from clipboard
- **Loading States** - Beautiful loading animations
- **Error Handling** - Clear, actionable error messages
- **Success Feedback** - Confirmation animations

### Security
- **AES-256-GCM Encryption** - Login credentials encrypted before transmission
- **HMAC-SHA384** - Message authentication for encrypted data
- **Token Management** - Secure storage and refresh handling
- **Route Protection** - Middleware-based authentication guards
- **CSRF Protection** - Built-in Next.js security features
- **Secure Headers** - Best practice security headers

## Architecture

### File Structure
```
sabpaisa_admin_v5/
├── app/
│   └── login/
│       ├── page.tsx              # Main login page
│       └── forgot/
│           └── page.tsx          # Password reset flow
├── services/
│   └── api/
│       ├── CobApiClient.ts       # Fetch-based HTTP client
│       └── AuthApiService.ts     # Authentication API methods
├── stores/
│   └── authStore.ts              # Zustand state management
├── lib/
│   ├── auth.ts                   # Auth helper functions
│   └── encryption.ts             # AES-256-GCM encryption
└── middleware.ts                 # Route protection middleware
```

### State Management (Zustand)

The auth store (`stores/authStore.ts`) manages:
- User data
- Authentication status
- Login/logout actions
- Token management
- Persistent storage (localStorage)

```typescript
const { user, isAuthenticated, login, logout } = useAuthStore()
```

### API Services

**AuthApiService** (`services/api/AuthApiService.ts`) provides:
- `login(email, password)` - Returns verification token
- `loginVerify(token, otp)` - Returns access/refresh tokens
- `logout()` - Clears tokens and user data
- `forgotPassword(email)` - Sends OTP to email
- `verifyOtp(token, otp)` - Verifies OTP code
- `resetPassword(token, password)` - Sets new password

### Encryption

Login credentials are encrypted using AES-256-GCM with HMAC-SHA384 before transmission.

**Format**: `HMAC (48 bytes) + IV (12 bytes) + Ciphertext + Tag (16 bytes)`

The implementation matches the backend decryption in `/cob_api/api/utils/data_masking.py`.

## Usage

### Login Page

```typescript
import { useAuthStore } from '@/stores/authStore'

function MyComponent() {
  const { login, loginVerify, isLoading, error } = useAuthStore()

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password)

      if (!response.is_mfa_enabled) {
        await loginVerify(response.verification_token, '')
        router.push('/dashboard')
      } else {
        // Show OTP input
      }
    } catch (err) {
      console.error(err.message)
    }
  }
}
```

### Protected Routes

Routes are automatically protected by `middleware.ts`. Unauthenticated users are redirected to `/login`.

To protect a route:
1. It's automatically protected by default
2. Add to `PUBLIC_ROUTES` in middleware.ts to make it public

### Check Authentication

```typescript
import { useAuthStore } from '@/stores/authStore'

function MyComponent() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return <div>Welcome, {user?.userName}!</div>
}
```

### Logout

```typescript
import { useAuthStore } from '@/stores/authStore'

function LogoutButton() {
  const { logout } = useAuthStore()

  return (
    <button onClick={() => {
      logout()
      router.push('/login')
    }}>
      Logout
    </button>
  )
}
```

## Configuration

### Environment Variables

Create a `.env.local` file (see `.env.local.example`):

```bash
# API Configuration
NEXT_PUBLIC_COB_AWS_API_URL=https://cobawsapi.sabpaisa.in
NEXT_PUBLIC_COB_AUTH_KEY=your-api-key-here

# Encryption Keys
NEXT_PUBLIC_AUTH_KEY=your-encryption-key-here
NEXT_PUBLIC_AUTH_IV=your-iv-here

# Feature Flags
NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION=true
```

### Customization

**Change Brand Colors**: Update Tailwind classes in login pages
- Primary: `orange-500` → your color
- Backgrounds: `slate-900`, `slate-800` → your colors

**Modify Animation Speed**: Adjust Framer Motion `transition` durations
```typescript
transition={{ duration: 0.3 }} // Make faster or slower
```

**Add Custom Validation**: Extend functions in `lib/auth.ts`
```typescript
export function isPasswordValid(password: string): boolean {
  // Your custom validation logic
}
```

## Mobile Optimization

All interactive elements follow mobile best practices:
- **Minimum Touch Target**: 44px × 44px
- **Responsive Breakpoints**: Mobile-first approach
- **Touch Gestures**: Optimized for tap, swipe, paste
- **Keyboard Support**: Full keyboard navigation
- **Auto-complete**: Email and password fields support browser auto-complete

## Accessibility

- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Screen reader friendly error messages
- High contrast text (WCAG AA compliant)

## Performance

- **Code Splitting**: Automatic with Next.js 14
- **Native Fetch**: Lightweight HTTP client (no axios)
- **Lazy Loading**: Framer Motion animations loaded on demand
- **Optimized Animations**: GPU-accelerated transforms
- **Minimal Bundle**: Zustand (1kb) for state management

## Security Best Practices

1. **Never log tokens** in production
2. **Use HTTPS** in production
3. **Rotate encryption keys** periodically
4. **Set token expiration** appropriately
5. **Implement rate limiting** on login endpoint
6. **Use secure cookies** for token storage (recommended)
7. **Enable CSP headers** in production

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari 14+
- Chrome Android 90+

## Troubleshooting

### Login Not Working
1. Check API URL in `.env.local`
2. Verify encryption keys match backend
3. Check network tab for API errors
4. Ensure cookies are enabled

### OTP Not Received
1. Check email spam folder
2. Verify email address is correct
3. Check backend OTP service status

### Redirect Loop
1. Clear localStorage
2. Clear browser cookies
3. Check middleware configuration

### Animations Laggy
1. Enable GPU acceleration in browser
2. Reduce animation complexity
3. Use `will-change` CSS property

## Contributing

When adding new auth features:
1. Update AuthApiService for new endpoints
2. Add methods to authStore if needed
3. Update this README
4. Follow existing UX patterns
5. Maintain mobile-first approach
6. Add error handling

## License

Proprietary - SabPaisa Technologies
