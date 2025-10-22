"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

interface ParallaxBackgroundProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  overlayOpacity?: number;
}

/**
 * ParallaxBackground - Parallax effect for hero sections
 *
 * Features:
 * - Smooth parallax scrolling effect
 * - Configurable scroll speed
 * - Mobile-optimized (reduced motion on mobile)
 * - GPU-accelerated transforms
 * - Optional gradient overlay
 */
export function ParallaxBackground({
  children,
  speed = 0.5,
  className = "",
  overlayOpacity = 0.6,
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Transform scroll progress to Y position
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${prefersReducedMotion ? 0 : speed * 100}%`]
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* Parallax background layer */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 -z-10"
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"
          style={{ opacity: overlayOpacity }}
        />

        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
