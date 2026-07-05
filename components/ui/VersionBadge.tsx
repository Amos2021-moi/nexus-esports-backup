"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Info, Sparkles, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface VersionData {
  current: string;
  version: string;
  major: number;
  minor: number;
  patch: number;
  build: number;
  hash: string;
  environment: string;
  date: string;
  full: string;
}

interface UpdateStatus {
  hasUpdate: boolean;
  current: string;
  latest: string | null;
  isBehind: boolean;
}

interface VersionBadgeProps {
  className?: string;
  showDetails?: boolean;
  showEnvironment?: boolean;
  autoCheck?: boolean;
  checkInterval?: number;
}

export default function VersionBadge({
  className = "",
  showDetails = false,
  showEnvironment = true,
  autoCheck = true,
  checkInterval = 60000, // 1 minute
}: VersionBadgeProps) {
  const [version, setVersion] = useState<VersionData | null>(null);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [checking, setChecking] = useState(false);

  const fetchVersion = async () => {
    try {
      const res = await fetch("/api/version");
      if (res.ok) {
        const data = await res.json();
        setVersion(data.version);
      }
    } catch (error) {
      console.error("Error fetching version:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await fetch("/api/version/check");
      if (res.ok) {
        const data = await res.json();
        setUpdateStatus(data);
      }
    } catch (error) {
      console.error("Error checking updates:", error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchVersion();
    if (autoCheck) {
      checkForUpdates();
      const interval = setInterval(checkForUpdates, checkInterval);
      return () => clearInterval(interval);
    }
  }, []);

  if (loading) {
    return (
      <div className={cn("h-5 w-24 animate-pulse rounded bg-gray-700/30", className)} />
    );
  }

  if (!version) {
    return null;
  }

  const envLabel = version.environment || "development";
  const envColor = getEnvironmentColor(envLabel);
  const envEmoji = getEnvironmentEmoji(envLabel);
  const hasUpdate = updateStatus?.isBehind || false;

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2",
        className
      )}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Badge */}
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-all hover:scale-105",
          envColor,
          hasUpdate && "ring-1 ring-yellow-400/50"
        )}
      >
        <GitBranch className="h-3 w-3" />
        <span>v{version.version}</span>
        {showEnvironment && (
          <>
            <span className="opacity-30">•</span>
            <span className="text-[10px] opacity-70">{envEmoji}</span>
          </>
        )}
        {hasUpdate && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400" />
          </span>
        )}
        <Sparkles className="h-3 w-3 opacity-50" />
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {(showTooltip || showDetails) && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 min-w-[220px] rounded-xl border border-white/10 bg-gray-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-white">Version</span>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-indigo-300">
                  v{version.version}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>Build:</span>
                <span className="font-mono text-white">#{version.build}</span>
              </div>
              {version.hash && (
                <div className="flex items-center gap-2 text-gray-400">
                  <span>Commit:</span>
                  <span className="font-mono text-white">{version.hash}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400">
                <span>Environment:</span>
                <span className={cn("font-medium", envColor.split(" ")[0])}>
                  {envEmoji} {envLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>Deployed:</span>
                <span className="text-white">
                  {new Date(version.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>Auto-Update:</span>
                <span className="text-emerald-400">✅ Enabled</span>
              </div>
              {hasUpdate && (
                <div className="mt-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Update Available!</span>
                    <span className="text-[10px] opacity-70">
                      {updateStatus?.latest}
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-1.5 flex items-center justify-between border-t border-white/5 pt-1.5">
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <CheckCircle className="h-3 w-3 text-emerald-400" />
                  Latest
                </span>
                {hasUpdate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      checkForUpdates();
                    }}
                    className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300"
                  >
                    <RefreshCw className={cn("h-3 w-3", checking && "animate-spin")} />
                    Check again
                  </button>
                )}
              </div>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900/95 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions (kept here for component use)
function getEnvironmentColor(env: string): string {
  const envMap: Record<string, string> = {
    production: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    staging: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
    development: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    preview: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    local: "text-gray-400 border-gray-500/20 bg-gray-500/10",
  };
  return envMap[env] || envMap.development;
}

function getEnvironmentEmoji(env: string): string {
  const envMap: Record<string, string> = {
    production: "🚀",
    staging: "🧪",
    development: "🔧",
    preview: "📦",
    local: "💻",
  };
  return envMap[env] || "🔧";
}