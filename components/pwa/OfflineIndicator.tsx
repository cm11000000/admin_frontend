"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * OfflineIndicator - Shows when offline/online
 *
 * Features:
 * - Beautiful offline banner at top of screen
 * - Smooth slide-down animation
 * - Auto-hides when online
 * - Shows reconnection message
 * - Mobile-optimized
 */
export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="fixed left-0 right-0 z-[90] bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
            style={{ top: 60 }}
            role="alert"
            aria-live="assertive"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-3 py-3">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <WifiOff className="h-5 w-5" />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    You're offline
                  </p>
                  <p className="text-xs text-white/80">
                    Some features may be limited
                  </p>
                </div>
              </div>
            </div>

            {/* Animated pulse border */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconnection Toast */}
      <AnimatePresence>
        {isOnline && wasOffline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="fixed left-1/2 -translate-x-1/2 z-[90]"
            style={{ top: 72 }}
            role="status"
            aria-live="polite"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 300,
                }}
              >
                <div className="bg-white/20 rounded-full p-1.5">
                  <Wifi className="h-5 w-5" />
                </div>
              </motion.div>
              <div>
                <p className="text-sm font-semibold">Back online!</p>
                <p className="text-xs text-white/80">
                  Connection restored
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
