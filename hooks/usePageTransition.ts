"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface UsePageTransitionReturn {
  isNavigating: boolean;
  navigate: (url: string) => void;
  currentPath: string;
}

/**
 * usePageTransition - Hook for managing page transitions
 *
 * Features:
 * - Tracks navigation state
 * - Provides smooth transition between pages
 * - Loading states during navigation
 * - Prevents rapid navigation clicks
 *
 * @example
 * const { isNavigating, navigate } = usePageTransition();
 * <button onClick={() => navigate('/dashboard')} disabled={isNavigating}>
 *   {isNavigating ? 'Loading...' : 'Go to Dashboard'}
 * </button>
 */
export function usePageTransition(): UsePageTransitionReturn {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);

  useEffect(() => {
    // Update current path and reset navigating state when route changes
    if (pathname !== currentPath) {
      setCurrentPath(pathname);
      setIsNavigating(false);
    }
  }, [pathname, currentPath]);

  const navigate = useCallback(
    (url: string) => {
      if (isNavigating || url === currentPath) return;

      setIsNavigating(true);

      // Use a small delay to ensure the loading state is visible
      setTimeout(() => {
        router.push(url);
      }, 100);

      // Fallback timeout in case navigation fails
      setTimeout(() => {
        setIsNavigating(false);
      }, 5000);
    },
    [router, isNavigating, currentPath]
  );

  return {
    isNavigating,
    navigate,
    currentPath,
  };
}
