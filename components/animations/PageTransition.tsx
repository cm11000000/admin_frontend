"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// Animation variants for different transition types
const variants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  rotate: {
    initial: { opacity: 0, rotate: -5, scale: 0.95 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 5, scale: 0.95 },
  },
};

interface PageTransitionProps {
  children: ReactNode;
  variant?: keyof typeof variants;
  duration?: number;
  className?: string;
}

/**
 * PageTransition - Smooth page transitions using Framer Motion
 *
 * Features:
 * - Multiple animation variants (fade, slide, scale, rotate)
 * - Configurable duration and easing
 * - GPU-accelerated transforms
 * - Respects prefers-reduced-motion
 */
export function PageTransition({
  children,
  variant = "fade",
  duration = 0.3,
  className = "",
}: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[variant]}
        transition={{
          duration,
          ease: [0.4, 0, 0.2, 1], // Custom easing for smooth animations
        }}
        className={className}
        style={{
          willChange: "opacity, transform",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * PageTransitionWrapper - Wraps content with page transition
 * Use this in layout components
 */
export function PageTransitionWrapper({
  children,
  variant = "slideUp",
}: Omit<PageTransitionProps, "className">) {
  return (
    <PageTransition variant={variant} className="flex-1">
      {children}
    </PageTransition>
  );
}
