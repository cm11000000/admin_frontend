"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

interface SlideInProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}

/**
 * SlideIn - Slide-in animations from all directions
 *
 * Features:
 * - Slide from any direction (up, down, left, right)
 * - Intersection Observer for scroll-triggered animations
 * - Configurable delay, duration, and distance
 * - GPU-accelerated transforms
 * - Respects prefers-reduced-motion
 */
export function SlideIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 50,
  className = "",
  once = true,
  threshold = 0.1,
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once, threshold]);

  // Calculate initial and animate values based on direction
  const getAnimationValues = () => {
    switch (direction) {
      case "up":
        return {
          initial: { opacity: 0, y: distance },
          animate: { opacity: 1, y: 0 },
        };
      case "down":
        return {
          initial: { opacity: 0, y: -distance },
          animate: { opacity: 1, y: 0 },
        };
      case "left":
        return {
          initial: { opacity: 0, x: distance },
          animate: { opacity: 1, x: 0 },
        };
      case "right":
        return {
          initial: { opacity: 0, x: -distance },
          animate: { opacity: 1, x: 0 },
        };
      default:
        return {
          initial: { opacity: 0, y: distance },
          animate: { opacity: 1, y: 0 },
        };
    }
  };

  const { initial, animate } = getAnimationValues();

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isVisible ? animate : initial}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for slide
      }}
      className={className}
      style={{
        willChange: "opacity, transform",
      }}
    >
      {children}
    </motion.div>
  );
}
