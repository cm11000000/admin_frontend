# Quick Start Guide - Authentication System

## 🚀 Get Started in 3 Minutes

### Step 1: Environment Setup
```bash
# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your API keys (if needed, defaults work for dev)
```

### Step 2: Run the Application
```bash
# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

### Step 3: Test the Authentication
Open your browser and navigate to:
- **Login**: http://localhost:3000/login
- **Forgot Password**: http://localhost:3000/login/forgot

## 📱 Test Credentials

Use your existing SabPaisa credentials to test the login flow.

## 🧪 Testing Checklist

### Login Flow
- [ ] Enter email and password
- [ ] Check password strength indicator
- [ ] Toggle password visibility
- [ ] Check caps lock warning (press caps lock)
- [ ] Click "Remember me"
- [ ] Submit and verify OTP (if MFA enabled)
- [ ] Or auto-redirect to dashboard (if MFA disabled)

### Forgot Password Flow
- [ ] Click "Forgot password?" on login page
- [ ] Enter email address
- [ ] Receive OTP via email
- [ ] Enter 6-digit OTP (test paste support)
- [ ] Create new password
- [ ] Check password strength meter
- [ ] Confirm password matches
- [ ] Submit and redirect to login

### Mobile Testing
- [ ] Open on mobile device
- [ ] Test touch targets (should be easy to tap)
- [ ] Test OTP paste from SMS
- [ ] Test keyboard (numeric for OTP)
- [ ] Test animations (should be smooth)

## 🎨 Customization

### Change Brand Colors
Edit `app/login/page.tsx` and `app/login/forgot/page.tsx`:

```typescript
// Change from orange to your brand color
from-orange-500 to-orange-600  →  from-blue-500 to-blue-600
```

### Change Logo
Edit `app/login/page.tsx` line 154:

```typescript
<span className="text-white font-bold text-3xl">S</span>
// Replace with your logo/icon
```

### Modify Validation Rules
Edit `lib/auth.ts`:

```typescript
export function isPasswordValid(password: string): boolean {
  // Add your custom validation
}
```

## 📖 Usage in Your Components

### Check if User is Authenticated
```typescript
'use client'
import { useAuthStore } from '@/stores/authStore'

export default function MyComponent() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <div>Please login</div>
  }

  return <div>Welcome, {user?.userName}!</div>
}
```

### Logout Button
```typescript
'use client'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const { logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

### Protected Page
```typescript
'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return <div>Dashboard Content</div>
}
```

## 🔒 Security Notes

1. **HTTPS in Production**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env.local` to git
3. **Token Expiration**: Implement token refresh for long sessions
4. **Rate Limiting**: Add rate limiting on login endpoint
5. **Audit Logs**: Log authentication attempts

## 🐛 Troubleshooting

### Login Not Working
- Check browser console for errors
- Verify API URL in `.env.local`
- Check network tab in DevTools
- Ensure backend is running

### OTP Not Received
- Check spam folder
- Verify email address
- Check backend OTP service logs

### Redirect Issues
- Clear localStorage: `localStorage.clear()`
- Clear browser cookies
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Animations Laggy
- Check GPU acceleration in browser settings
- Reduce `transition.duration` values
- Disable animations: Remove Framer Motion components

## 📚 Documentation

- **Full Documentation**: See `AUTH_README.md`
- **Implementation Details**: See `AUTHENTICATION_SYSTEM_SUMMARY.md`
- **API Reference**: See inline comments in `services/api/AuthApiService.ts`

## 🆘 Need Help?

1. Check the documentation files
2. Review the example code above
3. Inspect the existing implementation
4. Check browser console for errors

## ✅ Ready for Production

Once tested, you can deploy:

```bash
# Build for production
npm run build

# Start production server
npm start
```

**Enjoy your world-class authentication system!** 🎉
