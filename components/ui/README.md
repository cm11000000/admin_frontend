# UI Component Library - SabPaisa Admin v5

A world-class, mobile-first UI component library built with React, TypeScript, Radix UI, Framer Motion, and Tailwind CSS.

## Features

- **Mobile-First Design**: Touch-friendly interfaces with optimized tap targets (minimum 44x44px)
- **Beautiful Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Dark Mode**: Full dark theme support with slate-based color palette
- **Type Safety**: Fully typed with TypeScript
- **Variant System**: Consistent variants using class-variance-authority
- **Radix UI Primitives**: Built on battle-tested, accessible primitives

## Components

### Layout & Structure

#### Card
Flexible card component with multiple variants and specialized versions.

**Variants**: `default`, `glass`, `gradient`, `premium`, `outlined`
**Features**: Hover effects, animations, Stats/Feature card presets

```tsx
import { Card, CardHeader, CardTitle, CardContent, StatsCard } from '@/components/ui/card'

<Card variant="premium" hover="float">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Card content</CardContent>
</Card>

<StatsCard
  title="Total Revenue"
  value="$45,231"
  trend={{ value: 12, label: "vs last month", positive: true }}
/>
```

#### Separator
Dividers with optional labels and multiple styles.

```tsx
import { Separator, GradientSeparator, DottedSeparator } from '@/components/ui/separator'

<Separator label="OR" />
<GradientSeparator />
<DottedSeparator />
```

### Form Controls

#### Button
Multiple variants, sizes, loading states, and icon support.

**Variants**: `primary`, `secondary`, `success`, `danger`, `ghost`, `outline`, `link`
**Sizes**: `sm`, `md`, `lg`, `xl`, `icon`

```tsx
import { Button, IconButton } from '@/components/ui/button'

<Button variant="primary" size="lg" loading={isLoading}>
  Save Changes
</Button>

<IconButton icon={<SaveIcon />} label="Save" />
```

#### Input
Text inputs with labels, errors, icons, and validation states.

**Variants**: `default`, `filled`, `glass`
**Specialized**: SearchInput, PasswordInput

```tsx
import { Input, SearchInput, PasswordInput } from '@/components/ui/input'

<Input
  label="Email"
  error="Invalid email"
  leftIcon={<MailIcon />}
/>

<SearchInput placeholder="Search users..." />
<PasswordInput label="Password" />
```

#### Select
Custom select dropdown based on Radix UI.

```tsx
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'

<Select>
  <SelectTrigger label="Country">
    <SelectValue placeholder="Select country" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="us">United States</SelectItem>
    <SelectItem value="uk">United Kingdom</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox
Custom checkbox with animations and group support.

```tsx
import { Checkbox, CheckboxGroup } from '@/components/ui/checkbox'

<Checkbox
  label="Accept terms"
  description="I agree to the terms and conditions"
/>

<CheckboxGroup label="Notifications">
  <Checkbox label="Email notifications" />
  <Checkbox label="SMS notifications" />
</CheckboxGroup>
```

#### Switch
Toggle switches with icons and animations.

**Variants**: `default`, `success`, `warning`, `danger`
**Sizes**: `sm`, `md`, `lg`

```tsx
import { Switch, IconSwitch, SwitchGroup } from '@/components/ui/switch'

<Switch label="Dark Mode" description="Enable dark theme" />

<IconSwitch
  checkedIcon={<MoonIcon />}
  uncheckedIcon={<SunIcon />}
/>
```

### Feedback & Status

#### Badge
Status badges with colors and variants.

**Variants**: `default`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `outline`, `gradient`
**Specialized**: StatusBadge, CountBadge, RemovableBadge

```tsx
import { Badge, StatusBadge, CountBadge } from '@/components/ui/badge'

<Badge variant="success">Active</Badge>
<StatusBadge status="online" />
<CountBadge count={42} />
```

#### Toast
Toast notification system with multiple variants.

**Variants**: `default`, `success`, `error`, `warning`, `info`

```tsx
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

toast({
  title: "Success!",
  description: "Your changes have been saved.",
  variant: "success"
})
```

#### Progress
Progress bars with linear and circular variants.

**Components**: Progress, CircularProgress, SteppedProgress
**Variants**: `default`, `primary`, `success`, `warning`, `danger`, `info`

```tsx
import { Progress, CircularProgress, SteppedProgress } from '@/components/ui/progress'

<Progress value={75} showValue label="Upload Progress" />

<CircularProgress value={60} size={120} />

<SteppedProgress
  steps={["Order", "Payment", "Shipping", "Delivered"]}
  currentStep={2}
/>
```

#### Skeleton
Loading skeletons with shimmer effect and presets.

**Presets**: CardSkeleton, TableRowSkeleton, StatsCardSkeleton, ListSkeleton, FormSkeleton

```tsx
import { Skeleton, ShimmerSkeleton, CardSkeleton } from '@/components/ui/skeleton'

<Skeleton className="h-12 w-full" />
<ShimmerSkeleton className="h-32 w-full" />
<CardSkeleton showAvatar lines={3} />
```

### Overlays

#### Dialog
Modal dialogs with beautiful animations and confirmation dialog preset.

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, ConfirmDialog } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>

<ConfirmDialog
  title="Delete Item?"
  description="This action cannot be undone."
  variant="danger"
  onConfirm={handleDelete}
/>
```

#### Dropdown Menu
Dropdown menus for actions with icons and shortcuts.

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem icon={<EditIcon />} shortcut="⌘E">
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem icon={<DeleteIcon />} shortcut="⌘D">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Navigation

#### Tabs
Tab navigation with multiple variants.

**Variants**: `default`, `pills`, `underline`
**Features**: Icon tabs for mobile

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent, IconTabTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList variant="pills">
    <TabsTrigger value="tab1">Overview</TabsTrigger>
    <TabsTrigger value="tab2">Analytics</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Overview content</TabsContent>
  <TabsContent value="tab2">Analytics content</TabsContent>
</Tabs>

// Mobile-friendly icon tabs
<IconTabTrigger icon={<HomeIcon />} label="Home" badge={5} />
```

### Data Display

#### Avatar
User avatars with fallbacks, status indicators, and groups.

**Sizes**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
**Features**: Status indicators, avatar groups, user info display

```tsx
import { Avatar, AvatarGroup, UserAvatar } from '@/components/ui/avatar'

<Avatar
  src="/avatar.jpg"
  alt="John Doe"
  status="online"
  size="lg"
/>

<AvatarGroup max={5}>
  <Avatar src="/user1.jpg" />
  <Avatar src="/user2.jpg" />
  <Avatar src="/user3.jpg" />
</AvatarGroup>

<UserAvatar
  name="John Doe"
  email="john@example.com"
  showInfo
/>
```

## Design Principles

### Mobile-First
- Touch targets minimum 44x44px (WCAG AAA)
- Responsive sizing using Tailwind breakpoints
- Touch-friendly interactions with `touch-manipulation`
- Optimized tap areas for mobile devices

### Animations
- Smooth entrance/exit animations
- Spring physics for natural motion
- Reduced motion support via `prefers-reduced-motion`
- Performance optimized with `transform-gpu`

### Accessibility
- Semantic HTML elements
- Proper ARIA labels and attributes
- Keyboard navigation support
- Screen reader friendly
- Focus visible states
- Color contrast WCAG 2.1 AA compliant

### Dark Mode
- Slate-based color palette
- Smooth theme transitions
- Consistent contrast ratios
- Optimized for both themes

## Dependencies

- **React**: ^18.0.0
- **TypeScript**: ^5.0.0
- **Tailwind CSS**: ^3.4.0
- **Radix UI**: Latest
- **Framer Motion**: ^11.0.0
- **class-variance-authority**: ^0.7.0

## Usage

Import components individually or use the barrel export:

```tsx
// Individual imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Barrel export
import { Button, Card, Input, Badge } from '@/components/ui'
```

## Customization

All components use Tailwind CSS classes and can be customized via:

1. **className prop**: Override or extend default styles
2. **Tailwind config**: Customize colors, spacing, etc.
3. **CSS variables**: Theme-level customization
4. **Variants**: Use built-in variant system

## Best Practices

1. Always provide `label` prop for form controls
2. Use `error` prop for validation feedback
3. Add `aria-label` for icon-only buttons
4. Test with keyboard navigation
5. Enable animations by default (can disable for reduced motion)
6. Use appropriate sizes for touch targets on mobile

## Performance

- Components use React.forwardRef for ref forwarding
- Animations use GPU-accelerated transforms
- Lazy loading support with React.lazy
- Optimized re-renders with React.memo where appropriate
- Tree-shakeable imports

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## License

Part of SabPaisa Admin v5 application.
