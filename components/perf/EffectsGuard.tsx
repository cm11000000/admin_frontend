"use client";

import { useEffect } from 'react';

/**
 * EffectsGuard
 * - Disables heavy decorative animations on low-power devices or when opted out.
 * - Heuristics: prefers-reduced-motion, localStorage('sp_effects'='off'), low CPU cores (≤4).
 * - Sets body[data-effects] to 'off' | 'on' for CSS to react.
 */
export default function EffectsGuard() {
  useEffect(() => {
    try {
      let off = false;
      if (typeof window !== 'undefined') {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          off = true;
        }
        const saved = localStorage.getItem('sp_effects');
        if (saved === 'off') off = true;
        const cores = (navigator as any).hardwareConcurrency as number | undefined;
        if (!saved && typeof cores === 'number' && cores > 0 && cores <= 4) {
          // Conservative default on low-core machines unless user opts in
          off = true;
        }
      }
      document.body?.setAttribute('data-effects', off ? 'off' : 'on');
    } catch {}
  }, []);
  return null;
}

