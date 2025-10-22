"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GradientBlobProps {
  className?: string;
  color?: "orange" | "blue" | "purple" | "green" | "pink";
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

const colorVariants = {
  orange:
    "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600",
  blue: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
  purple:
    "bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600",
  green:
    "bg-gradient-to-br from-green-400 via-green-500 to-green-600",
  pink: "bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600",
};

const sizeVariants = {
  sm: "h-32 w-32 md:h-48 md:w-48",
  md: "h-48 w-48 md:h-64 md:w-64",
  lg: "h-64 w-64 md:h-96 md:w-96",
  xl: "h-96 w-96 md:h-[32rem] md:w-[32rem]",
};

/**
 * GradientBlob - Animated gradient blobs for backgrounds
 *
 * Features:
 * - Smooth, organic animations
 * - Multiple color variants
 * - Different sizes
 * - Blur effect for dreamy look
 * - GPU-accelerated transforms
 * - Respects prefers-reduced-motion
 */
export function GradientBlob({
  className = "",
  color = "orange",
  size = "lg",
  animate = true,
}: GradientBlobProps) {
  const [shouldAnimate, setShouldAnimate] = useState(animate);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setShouldAnimate(false);
    }
  }, []);

  // Random animation values for organic movement
  const getRandomValue = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  return (
    <motion.div
      className={cn(
        "absolute rounded-full blur-3xl opacity-30",
        colorVariants[color],
        sizeVariants[size],
        className
      )}
      animate={
        shouldAnimate
          ? {
              x: [
                0,
                getRandomValue(-50, 50),
                getRandomValue(-50, 50),
                0,
              ],
              y: [
                0,
                getRandomValue(-50, 50),
                getRandomValue(-50, 50),
                0,
              ],
              scale: [1, 1.1, 0.9, 1],
              rotate: [0, 90, 180, 270, 360],
            }
          : undefined
      }
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      style={{
        willChange: shouldAnimate ? "transform" : "auto",
      }}
    />
  );
}

/**
 * GradientBlobGroup - Multiple blobs for complex backgrounds
 */
export function GradientBlobGroup({ className = "" }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden -z-10", className)}>
      <GradientBlob
        color="orange"
        size="xl"
        className="top-0 right-0 translate-x-1/2 -translate-y-1/2"
      />
      <GradientBlob
        color="blue"
        size="lg"
        className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2"
      />
      <GradientBlob
        color="purple"
        size="md"
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}
