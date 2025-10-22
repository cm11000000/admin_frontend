"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

/**
 * Offline page - Beautiful offline page for PWA
 *
 * Features:
 * - Beautiful design with animations
 * - Retry button to check connection
 * - Navigate back to home
 * - Auto-retry when online
 * - Cached content access
 */
export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Listen for online event and redirect
    const handleOnline = () => {
      router.push("/");
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [router]);

  const handleRetry = async () => {
    setIsRetrying(true);

    // Check if we're online
    if (navigator.onLine) {
      router.push("/");
      return;
    }

    // Try to fetch a simple resource
    try {
      const response = await fetch("/manifest.json", {
        method: "HEAD",
        cache: "no-store",
      });

      if (response.ok) {
        router.push("/");
      } else {
        setIsRetrying(false);
      }
    } catch (error) {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              damping: 15,
              stiffness: 300,
            }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg"
              >
                <WifiOff className="h-16 w-16 text-white" />
              </motion.div>

              {/* Pulse animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-orange-500/30 rounded-2xl -z-10"
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              You're Offline
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              No internet connection. Please check your network settings and
              try again.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={
                <RefreshCw
                  className={`h-5 w-5 ${isRetrying ? "animate-spin" : ""}`}
                />
              }
            >
              {isRetrying ? "Checking Connection..." : "Retry"}
            </Button>

            <Button
              onClick={handleGoHome}
              variant="ghost"
              size="lg"
              fullWidth
              leftIcon={<Home className="h-5 w-5" />}
            >
              Go to Home
            </Button>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-8 border-t border-slate-700/50"
          >
            <p className="text-center text-sm text-slate-500">
              Some cached content may still be available in the app
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"
        />
      </motion.div>
    </div>
  );
}
