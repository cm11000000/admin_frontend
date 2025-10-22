"use client";

import { useState, useEffect } from "react";

interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * useOnlineStatus - Hook to track online/offline status
 *
 * Features:
 * - Tracks network connection status
 * - Returns isOnline state
 * - Tracks wasOffline to show reconnection messages
 * - Used in OfflineIndicator component
 *
 * @example
 * const { isOnline, wasOffline } = useOnlineStatus();
 * {!isOnline && <OfflineBanner />}
 * {isOnline && wasOffline && <ReconnectedToast />}
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Keep wasOffline true for a few seconds to show reconnection message
      setTimeout(() => {
        setWasOffline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
