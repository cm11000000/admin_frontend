# Implementation Guide - SabPaisa Admin v5 UI Components

This guide helps you integrate and use the UI component library in your application.

## Prerequisites

Before using these components, ensure you have the following dependencies installed:

```bash
# Core dependencies
npm install react react-dom
npm install typescript @types/react @types/react-dom

# Styling
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge

# UI Primitives
npm install @radix-ui/react-avatar
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-progress
npm install @radix-ui/react-select
npm install @radix-ui/react-separator
npm install @radix-ui/react-switch
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast

# Animation
npm install framer-motion
```

## Setup

### 1. Tailwind Configuration

Update your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 2. Global CSS

Add to your `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 3. Utility Function

Create `lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4. Toast Setup

Add the Toaster component to your root layout:

```tsx
// app/layout.tsx or pages/_app.tsx
import { Toaster } from '@/components/ui/toast'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

## Usage Examples

### Form with Validation

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/toast'

export function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    country: '',
    terms: false,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (!formData.terms) newErrors.terms = 'You must accept the terms'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    // Submit logic here
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast({
      title: 'Success!',
      description: 'Your account has been created.',
      variant: 'success',
    })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        leftIcon={<MailIcon className="w-5 h-5" />}
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={errors.password}
      />

      <Select
        value={formData.country}
        onValueChange={(value) => setFormData({ ...formData, country: value })}
      >
        <SelectTrigger label="Country" error={errors.country}>
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="uk">United Kingdom</SelectItem>
          <SelectItem value="ca">Canada</SelectItem>
        </SelectContent>
      </Select>

      <Checkbox
        label="I accept the terms and conditions"
        checked={formData.terms}
        onCheckedChange={(checked) => setFormData({ ...formData, terms: checked })}
        error={errors.terms}
      />

      <Button type="submit" loading={loading} fullWidth>
        Create Account
      </Button>
    </form>
  )
}
```

### Dashboard with Stats Cards

```tsx
import { Card, StatsCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarGroup } from '@/components/ui/avatar'

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value="$45,231"
          description="Last 30 days"
          trend={{ value: 12, label: "vs last month", positive: true }}
          icon={<DollarIcon className="w-6 h-6" />}
          delay={0}
        />
        <StatsCard
          title="Active Users"
          value="2,345"
          trend={{ value: 8, label: "vs last month", positive: true }}
          icon={<UsersIcon className="w-6 h-6" />}
          delay={0.1}
        />
        <StatsCard
          title="New Orders"
          value="523"
          trend={{ value: 3, label: "vs last month", positive: false }}
          icon={<ShoppingIcon className="w-6 h-6" />}
          delay={0.2}
        />
        <StatsCard
          title="Conversion Rate"
          value="3.2%"
          trend={{ value: 15, label: "vs last month", positive: true }}
          icon={<ChartIcon className="w-6 h-6" />}
          delay={0.3}
        />
      </div>

      {/* Recent Activity */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-center gap-4">
                <Avatar src={activity.user.avatar} alt={activity.user.name} />
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-slate-600">{activity.time}</p>
                </div>
                <Badge variant={activity.status}>{activity.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Settings Page with Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="general">
        <TabsList variant="underline" className="mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                <Switch
                  label="Dark Mode"
                  description="Enable dark theme across the application"
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Language</h3>
                <Select defaultValue="en">
                  <SelectTrigger label="Language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Switch
                label="Email Notifications"
                description="Receive email updates about your account"
              />
              <Switch
                label="SMS Notifications"
                description="Receive SMS alerts for important updates"
              />
              <Switch
                label="Push Notifications"
                description="Receive push notifications on your devices"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <Switch
                  label="Enable 2FA"
                  description="Add an extra layer of security to your account"
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Sessions</h3>
                <Button variant="danger">Sign out all devices</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Loading States with Skeletons

```tsx
import { CardSkeleton, ListSkeleton, StatsCardSkeleton } from '@/components/ui/skeleton'

export function LoadingDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton showAvatar lines={4} />
        <ListSkeleton items={5} />
      </div>
    </div>
  )
}
```

## Mobile Considerations

### Touch Targets
All interactive elements have minimum 44x44px tap targets:

```tsx
// Button sizes are optimized for mobile
<Button size="md">Action</Button> // h-11 = 44px

// Icon buttons
<IconButton icon={<MenuIcon />} label="Menu" /> // 44x44px
```

### Responsive Layouts
Use Tailwind's responsive classes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Stacks on mobile, 2 cols on tablet, 4 cols on desktop */}
</div>
```

### Mobile-Specific Components
Use IconTabTrigger for bottom navigation:

```tsx
<Tabs defaultValue="home">
  <TabsList className="fixed bottom-0 left-0 right-0 w-full">
    <IconTabTrigger value="home" icon={<HomeIcon />} label="Home" />
    <IconTabTrigger value="search" icon={<SearchIcon />} label="Search" />
    <IconTabTrigger value="profile" icon={<UserIcon />} label="Profile" />
  </TabsList>
</Tabs>
```

## Accessibility Tips

1. **Always provide labels**: Even for visual-only elements
2. **Use semantic HTML**: Buttons for actions, links for navigation
3. **Test keyboard navigation**: Tab through your forms
4. **Check color contrast**: Use tools like WAVE or axe DevTools
5. **Test with screen readers**: NVDA, JAWS, or VoiceOver

## Performance Tips

1. **Lazy load dialogs**: Only render when opened
2. **Debounce input handlers**: Use debounce for search inputs
3. **Virtualize long lists**: For 100+ items, use react-virtual
4. **Optimize images**: Use next/image or similar
5. **Code split**: Use dynamic imports for heavy components

## Common Patterns

### Confirmation Before Action

```tsx
import { ConfirmDialog } from '@/components/ui/dialog'

const [showConfirm, setShowConfirm] = useState(false)

<ConfirmDialog
  open={showConfirm}
  onOpenChange={setShowConfirm}
  title="Delete Item?"
  description="This action cannot be undone."
  variant="danger"
  onConfirm={handleDelete}
/>
```

### Multi-Step Form

```tsx
import { SteppedProgress } from '@/components/ui/progress'

<SteppedProgress
  steps={["Info", "Payment", "Review", "Complete"]}
  currentStep={currentStep}
/>
```

### Filter with Badges

```tsx
import { RemovableBadge } from '@/components/ui/badge'

{filters.map(filter => (
  <RemovableBadge
    key={filter.id}
    onRemove={() => removeFilter(filter.id)}
  >
    {filter.label}
  </RemovableBadge>
))}
```

## Troubleshooting

### Components not styled correctly
- Ensure Tailwind is configured properly
- Check that globals.css is imported
- Verify CSS variables are defined

### Animations not working
- Check Framer Motion is installed
- Verify `animate` prop is not set to `false`
- Test with `prefers-reduced-motion: no-preference`

### TypeScript errors
- Ensure all @types packages are installed
- Check tsconfig.json includes component paths
- Verify React version compatibility

## Support

For issues or questions:
1. Check the component documentation in README.md
2. Review usage examples above
3. Inspect the component source code
4. Test in isolation to identify conflicts

## Next Steps

- Explore all component variants and props
- Customize color schemes in Tailwind config
- Build your own composite components
- Integrate with your state management
- Add analytics and monitoring
