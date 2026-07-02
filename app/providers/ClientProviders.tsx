"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import PushNotificationPrompt from "@/components/push/PushNotificationPrompt";
import { registerServiceWorker } from "@/lib/service-worker/register";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
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