"use client";

import { useEffect, useState, memo, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { registerServiceWorker } from "@/lib/service-worker/register";

// ✅ Create query client outside component to prevent recreation
let queryClientInstance: QueryClient | null = null;

function getQueryClient() {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // ✅ 1 minute
          gcTime: 5 * 60 * 1000, // ✅ 5 minutes
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          retry: 1,
          retryDelay: 1000,
        },
        mutations: {
          retry: 1,
          retryDelay: 1000,
        },
      },
    });
  }
  return queryClientInstance;
}

// ✅ Memoized Toaster to prevent re-renders
const MemoizedToaster = memo(function MemoizedToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--card-bg, #1f2937)",
          color: "var(--text-color, #f9fafb)",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
          border: "1px solid var(--border-color, #374151)",
          maxWidth: "420px",
        },
        success: {
          icon: "✅",
          style: {
            borderLeft: "4px solid #22c55e",
          },
        },
        error: {
          icon: "❌",
          style: {
            borderLeft: "4px solid #ef4444",
          },
        },
        loading: {
          style: {
            borderLeft: "4px solid #6366f1",
          },
        },
      }}
      containerStyle={{
        top: 20,
        right: 20,
      }}
    />
  );
});

// ✅ Memoized InstallPrompt to prevent re-renders
const MemoizedInstallPrompt = memo(InstallPrompt);

export const ClientProviders = memo(function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] =
    useState(false);

  // ✅ Use useCallback for stable function reference
  const registerSW = useCallback(async () => {
    // ✅ Only register in production and if supported
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator &&
      !isServiceWorkerRegistered
    ) {
      try {
        await registerServiceWorker();
        setIsServiceWorkerRegistered(true);
        console.log("✅ Service Worker registered successfully");
      } catch (error) {
        // ✅ Silent fail - don't break the app
        console.warn("⚠️ Service Worker registration failed:", error);
      }
    }
  }, [isServiceWorkerRegistered]);

  // ✅ Register service worker on mount
  useEffect(() => {
    registerSW();

    // ✅ Log VAPID key status (only in development)
    if (process.env.NODE_ENV === "development") {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (publicKey) {
        console.log(
          "✅ VAPID Public Key exists:",
          publicKey.substring(0, 20) + "..."
        );
      } else {
        console.warn("⚠️ NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
      }
    }
  }, [registerSW]);

  // ✅ Get query client instance
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <MemoizedToaster />
      <MemoizedInstallPrompt />
    </QueryClientProvider>
  );
});

// ✅ Add display name for debugging
ClientProviders.displayName = "ClientProviders";