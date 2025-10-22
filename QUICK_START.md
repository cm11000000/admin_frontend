# Quick Start - Animations & PWA

## Immediate Usage

### 1. Page Transitions

In any page component:

```tsx
import { PageTransition } from '@/components/animations';

export default function MyPage() {
  return (
    <PageTransition variant="slideUp">
      {/* Your content */}
    </PageTransition>
  );
}
```

### 2. Scroll Animations

```tsx
import { FadeIn, SlideIn, StaggerChildren } from '@/components/animations';

// Fade in on scroll
<FadeIn delay={0.2} direction="up">
  <Card>Content</Card>
</FadeIn>

// Slide in from left
<SlideIn direction="left">
  <div>Content</div>
</SlideIn>

// Stagger list items
<StaggerChildren staggerDelay={0.1}>
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</StaggerChildren>
```

### 3. Visual Effects

```tsx
import { ParallaxBackground, GradientBlobGroup } from '@/components/effects';

// Parallax hero
<ParallaxBackground speed={0.5}>
  <Hero />
</ParallaxBackground>

// Animated gradient background
<div className="relative">
  <GradientBlobGroup />
  <Content />
</div>
```

### 4. Using Animation Presets

```tsx
import { motion } from 'framer-motion';
import { fadeInUp, hoverScale } from '@/utils/animations';

<motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
  whileHover={hoverScale}
>
  Content
</motion.div>
```

### 5. Scroll Animation Hook

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function MyComponent() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div ref={ref} className={isVisible ? 'animate-fade-in' : 'opacity-0'}>
      Content
    </div>
  );
}
```

## PWA Features

### Testing PWA

1. **Build production:**
   ```bash
   npm run build
   npm start
   ```

2. **Test install prompt:**
   - Open on mobile or use Chrome DevTools device mode
   - Wait 3 seconds for install banner

3. **Test offline mode:**
   - DevTools > Network > Offline
   - Navigate the app
   - Visit /offline page

### PWA Components

The PWA components are automatically loaded in layout.tsx:
- ✅ InstallPrompt - Shows when app is installable
- ✅ OfflineIndicator - Shows when offline
- ✅ Service Worker - Automatically registered

### Customizing Install Prompt

To disable auto-prompt, user can dismiss it (persisted in localStorage).

To clear dismissal:
```javascript
localStorage.removeItem('pwa-install-dismissed');
```

## CSS Animation Classes

Available in globals.css:

```tsx
// Basic animations
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-in">Slides in</div>
<div className="animate-scale-in">Scales in</div>
<div className="animate-bounce-in">Bounces in</div>

// Loading animations
<div className="animate-spin">Spinning</div>
<div className="animate-pulse-slow">Pulsing</div>
<div className="animate-shimmer">Shimmer effect</div>

// Hover effects
<div className="hover-lift">Lifts on hover</div>
<div className="hover-scale">Scales on hover</div>
<div className="hover-glow">Glows on hover</div>

// GPU acceleration
<div className="gpu-accelerated">Optimized</div>
```

## Production Checklist

Before deploying:

1. **Replace icon placeholders:**
   ```bash
   # See public/icons/README.md for instructions
   ```

2. **Test PWA features:**
   - Run Lighthouse audit
   - Test on real mobile devices
   - Verify service worker registration

3. **Optimize performance:**
   - Check animation FPS
   - Test on low-end devices
   - Verify reduced-motion support

4. **Update manifest:**
   - Add actual app screenshots
   - Update colors/icons if needed
   - Configure shortcuts

## Common Issues

### Service Worker Not Registering
- Ensure HTTPS or localhost
- Clear browser cache
- Check browser console

### Animations Laggy
- Reduce simultaneous animations
- Check device performance
- Verify GPU acceleration

### PWA Not Installing
- Verify manifest.json is valid
- Check all icons exist
- Test on actual device

## Full Documentation

See `/ANIMATIONS_PWA_GUIDE.md` for complete documentation.

## Need Help?

Check these files:
- `/ANIMATIONS_PWA_GUIDE.md` - Complete guide
- `/ENHANCEMENTS_SUMMARY.md` - Implementation summary
- `/public/icons/README.md` - Icon guidelines
- `/components/animations/` - Animation source
- `/components/pwa/` - PWA source
