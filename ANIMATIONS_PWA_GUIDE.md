# World-Class Animations & PWA Implementation Guide

This document describes the comprehensive animation system and PWA features implemented in SabPaisa Admin Portal v5.

## Table of Contents

1. [Animation Components](#animation-components)
2. [Animation Hooks](#animation-hooks)
3. [Visual Effects](#visual-effects)
4. [PWA Features](#pwa-features)
5. [Micro-Interactions](#micro-interactions)
6. [Performance Optimization](#performance-optimization)
7. [Usage Examples](#usage-examples)

---

## Animation Components

### PageTransition

Smooth page transitions using Framer Motion with multiple animation variants.

**Location:** `components/animations/PageTransition.tsx`

**Variants:**
- `fade` - Simple fade in/out
- `slide` - Horizontal slide
- `slideUp` - Vertical slide from bottom
- `scale` - Scale with fade
- `rotate` - Rotate with fade

**Usage:**
```tsx
import { PageTransition } from '@/components/animations';

<PageTransition variant="slideUp">
  {children}
</PageTransition>
```

### FadeIn

Reusable fade-in component with scroll detection via Intersection Observer.

**Location:** `components/animations/FadeIn.tsx`

**Features:**
- Configurable delay and duration
- Direction support (up, down, left, right, none)
- Scroll-triggered animations
- Respects prefers-reduced-motion

**Usage:**
```tsx
import { FadeIn } from '@/components/animations';

<FadeIn delay={0.2} direction="up">
  <Card>Content</Card>
</FadeIn>
```

### SlideIn

Slide-in animations from all directions with scroll detection.

**Location:** `components/animations/SlideIn.tsx`

**Usage:**
```tsx
import { SlideIn } from '@/components/animations';

<SlideIn direction="left" distance={50}>
  <div>Slides from left</div>
</SlideIn>
```

### StaggerChildren

Stagger animations for lists and groups.

**Location:** `components/animations/StaggerChildren.tsx`

**Usage:**
```tsx
import { StaggerChildren } from '@/components/animations';

<StaggerChildren staggerDelay={0.1}>
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</StaggerChildren>
```

---

## Animation Hooks

### useScrollAnimation

Hook for scroll-triggered animations using Intersection Observer.

**Location:** `hooks/useScrollAnimation.ts`

**Usage:**
```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

<div ref={ref} className={isVisible ? 'animate-in' : 'opacity-0'}>
  Content
</div>
```

### usePageTransition

Hook for managing page transitions with loading states.

**Location:** `hooks/usePageTransition.ts`

**Usage:**
```tsx
import { usePageTransition } from '@/hooks/usePageTransition';

const { isNavigating, navigate } = usePageTransition();

<button onClick={() => navigate('/dashboard')} disabled={isNavigating}>
  {isNavigating ? 'Loading...' : 'Go to Dashboard'}
</button>
```

### useOnlineStatus

Hook to track online/offline status for PWA features.

**Location:** `hooks/useOnlineStatus.ts`

**Usage:**
```tsx
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const { isOnline, wasOffline } = useOnlineStatus();

{!isOnline && <OfflineBanner />}
```

---

## Visual Effects

### ParallaxBackground

Parallax scrolling effect for hero sections.

**Location:** `components/effects/ParallaxBackground.tsx`

**Features:**
- Smooth parallax scrolling
- Configurable scroll speed
- Mobile-optimized (reduced motion)
- GPU-accelerated

**Usage:**
```tsx
import { ParallaxBackground } from '@/components/effects';

<ParallaxBackground speed={0.5}>
  <Hero />
</ParallaxBackground>
```

### GradientBlob

Animated gradient blobs for backgrounds.

**Location:** `components/effects/GradientBlob.tsx`

**Colors:** orange, blue, purple, green, pink

**Sizes:** sm, md, lg, xl

**Usage:**
```tsx
import { GradientBlob, GradientBlobGroup } from '@/components/effects';

// Single blob
<GradientBlob color="orange" size="lg" />

// Multiple blobs
<GradientBlobGroup />
```

---

## PWA Features

### Service Worker

Comprehensive service worker with offline support.

**Location:** `public/sw.js`

**Features:**
- Cache-first for static assets
- Network-first for API calls
- Offline page support
- Background sync for failed requests
- Push notifications support

### Manifest

PWA manifest for app installation.

**Locations:**
- `public/manifest.json` - Static manifest
- `app/manifest.ts` - Dynamic Next.js manifest

**Features:**
- Full icon set (72px to 512px)
- Standalone display mode
- Shortcuts for quick access
- Theme colors

### InstallPrompt

Beautiful install prompt for PWA.

**Location:** `components/pwa/InstallPrompt.tsx`

**Features:**
- Shows on mobile when installable
- Dismissible with localStorage
- Smooth slide-up animation
- Auto-hides after installation

**Auto-triggers:** 3 seconds after page load (if installable)

### OfflineIndicator

Offline/online status indicator.

**Location:** `components/pwa/OfflineIndicator.tsx`

**Features:**
- Shows banner when offline
- Reconnection toast when back online
- Auto-hides/shows based on status
- Mobile-optimized

### Offline Page

Beautiful offline fallback page.

**Location:** `app/offline/page.tsx`

**Features:**
- Retry connection button
- Navigate to home
- Auto-redirect when online
- Beautiful animations

---

## Micro-Interactions

All UI components have built-in micro-interactions:

### Button
- Hover: Scale + shadow
- Tap: Scale down
- Loading: Spinning indicator
- Gradient shift on hover

### Input
- Focus: Glow animation + ring
- Error: Shake + red border
- Icon: Color change on focus

### Card
- Hover: Lift effect
- Premium variant: Glow shadow
- Glass variant: Backdrop blur

### Badge
- Pulse animation option
- Bounce on mount

### Toast
- Slide-in from right
- Fade out on dismiss
- Progress bar animation

### Modal
- Backdrop blur + fade
- Content: Scale + slide up
- Spring animation on open

---

## Performance Optimization

### GPU Acceleration

All animations use GPU-accelerated transforms:
```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### Reduced Motion

Respects user's motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Will-Change

Strategic use of `will-change` property:
```tsx
<motion.div style={{ willChange: 'opacity, transform' }}>
```

### Smooth Scroll

```css
html {
  scroll-behavior: smooth;
}
```

---

## Usage Examples

### Animated Dashboard Cards

```tsx
import { StaggerChildren } from '@/components/animations';
import { Card } from '@/components/ui/card';

<StaggerChildren staggerDelay={0.1}>
  {metrics.map((metric, index) => (
    <Card key={index} animate delay={index * 0.1}>
      <h3>{metric.title}</h3>
      <p>{metric.value}</p>
    </Card>
  ))}
</StaggerChildren>
```

### Hero Section with Parallax

```tsx
import { ParallaxBackground } from '@/components/effects';
import { GradientBlobGroup } from '@/components/effects';

<ParallaxBackground speed={0.5}>
  <GradientBlobGroup />
  <div className="hero-content">
    <h1>Welcome to SabPaisa Admin</h1>
  </div>
</ParallaxBackground>
```

### Form with Animations

```tsx
import { FadeIn } from '@/components/animations';
import { Input } from '@/components/ui/input';

<FadeIn delay={0.1}>
  <Input
    label="Email"
    type="email"
    animate
    error={errors.email}
  />
</FadeIn>
```

### Navigation with Page Transitions

```tsx
import { PageTransitionWrapper } from '@/components/animations';

// In layout
<PageTransitionWrapper variant="slideUp">
  {children}
</PageTransitionWrapper>
```

---

## Animation Utilities

Pre-configured animation variants available in `utils/animations.ts`:

```tsx
import {
  fadeIn,
  fadeInUp,
  slideInLeft,
  scaleIn,
  staggerContainer,
  hoverScale,
  modalContent,
} from '@/utils/animations';

<motion.div variants={fadeInUp} initial="hidden" animate="visible">
  Content
</motion.div>
```

---

## Testing PWA Features

### Local Testing

1. **Build the app:**
   ```bash
   npm run build
   npm start
   ```

2. **Test service worker:**
   - Open DevTools > Application > Service Workers
   - Verify registration

3. **Test offline mode:**
   - Open DevTools > Network
   - Set throttling to "Offline"
   - Navigate the app

4. **Test install prompt:**
   - Use mobile device or Chrome DevTools mobile emulation
   - Look for install banner after 3 seconds

### Production Testing

1. Deploy to HTTPS (required for PWA)
2. Test on actual mobile devices
3. Use Lighthouse to audit PWA score
4. Test installation flow on iOS and Android

---

## Browser Support

### Animations
- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support

### PWA Features
- Chrome (Android): ✅ Full PWA support
- Safari (iOS): ⚠️ Limited (no install prompt, but works)
- Firefox: ✅ Full support
- Edge: ✅ Full support

---

## Customization

### Animation Duration

Adjust in component props or CSS:
```tsx
<FadeIn duration={0.8}>Content</FadeIn>
```

### Animation Easing

Available easing curves in `utils/animations.ts`:
- easeOut: `[0.4, 0, 0.2, 1]`
- easeIn: `[0.4, 0, 1, 1]`
- smooth: `[0.25, 0.46, 0.45, 0.94]`

### Custom Animations

Add to `app/globals.css`:
```css
@keyframes custom-animation {
  from { /* ... */ }
  to { /* ... */ }
}

.animate-custom {
  animation: custom-animation 1s ease-out;
}
```

---

## Best Practices

1. **Use Intersection Observer** for scroll animations (better performance than scroll listeners)
2. **Respect reduced motion** - Always check `prefers-reduced-motion`
3. **GPU acceleration** - Use `transform` and `opacity` for animations
4. **Avoid layout thrashing** - Batch DOM reads/writes
5. **Stagger animations** - Don't animate everything at once
6. **Test on mobile** - Ensure 60fps on low-end devices
7. **Keep it subtle** - Animations should enhance, not distract

---

## Troubleshooting

### Service Worker Not Registering

- Ensure HTTPS or localhost
- Check browser console for errors
- Clear cache and reload

### Animations Laggy

- Check for `will-change` usage
- Reduce number of simultaneous animations
- Test on target devices

### PWA Not Installing

- Ensure manifest.json is valid
- Check icons exist and are accessible
- Verify HTTPS connection
- Test on actual mobile device

---

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [PWA Best Practices](https://web.dev/pwa/)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [CSS Animations Performance](https://web.dev/animations/)

---

## Summary

This implementation provides:

✅ 4 animation components (PageTransition, FadeIn, SlideIn, StaggerChildren)
✅ 3 animation hooks (useScrollAnimation, usePageTransition, useOnlineStatus)
✅ 2 visual effect components (ParallaxBackground, GradientBlob)
✅ 2 PWA components (InstallPrompt, OfflineIndicator)
✅ Full service worker with offline support
✅ Complete PWA manifest
✅ Beautiful offline page
✅ Enhanced UI components with micro-interactions
✅ Comprehensive animation utilities
✅ GPU-accelerated, 60fps animations
✅ Mobile-optimized and accessibility-friendly
✅ Production-ready PWA implementation

Enjoy your world-class animations and PWA experience! 🚀
