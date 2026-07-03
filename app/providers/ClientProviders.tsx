"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import PushNotificationPrompt from "@/components/push/PushNotificationPrompt";
import { registerServiceWorker } from "@/lib/service-worker/register";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
    
    // ✅ Log VAPID key status
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (publicKey) {
      console.log("✅ VAPID Public Key exists:", publicKey.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
    }
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" />
      <InstallPrompt />
      <PushNotificationPrompt />
    </>
  );
}