"use client";

import { useEffect, useRef, useState, RefObject } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}

interface UseScrollAnimationReturn {
  ref: RefObject<HTMLElement>;
  isVisible: boolean;
}

/**
 * useScrollAnimation - Hook for scroll-triggered animations
 *
 * Features:
 * - Intersection Observer based
 * - Returns isVisible state
 * - Configurable threshold and root margin
 * - Optional: Trigger only once or every time
 * - Respects prefers-reduced-motion
 *
 * @example
 * const { ref, isVisible } = useScrollAnimation({ threshold: 0.2, once: true });
 * <div ref={ref} className={isVisible ? 'animate-in' : 'opacity-0'}>Content</div>
 */
export function useScrollAnimation(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn {
  const {
    threshold = 0.1,
    once = true,
    rootMargin = "0px",
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

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
            setHasAnimated(true);
          }
        } else if (!once && !hasAnimated) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, hasAnimated]);

  return { ref: ref as RefObject<HTMLElement>, isVisible };
}
