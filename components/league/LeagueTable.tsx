"use client";

import { useEffect, useState, memo, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Medal,
  Crown,
  Sparkles,
  Shield,
  Zap,
  Target,
  Users,
  Star,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Award,
  Flame,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface LeagueEntry {
  id: string;
  playerId: string;
  playerName: string;
  username: string;
  profilePicture?: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string[];
}

interface LeagueTableProps {
  seasonId: string;
  compact?: boolean;
  limit?: number;
  highlightPlayerId?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.03 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// ✅ Memoized Row Component
const LeagueTableRow = memo(
  ({
    entry,
    index,
    totalEntries,
    highlightId,
    compact = false,
  }: {
    entry: LeagueEntry;
    index: number;
    totalEntries: number;
    highlightId?: string;
    compact?: boolean;
  }) => {
    const isTop3 = index < 3;
    const isBottom3 = index >= totalEntries - 3;
    const isHighlighted = highlightId === entry.playerId;

    const rowBg = isHighlighted
      ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10"
      : isTop3
      ? "bg-gradient-to-r from-green-500/10 to-transparent"
      : isBottom3
      ? "bg-gradient-to-r from-red-500/10 to-transparent"
      : "";

    const getRankIcon = (index: number) => {
      if (index === 0)
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg shadow-yellow-500/30">
            <Crown className="h-3.5 w-3.5 text-white" />
          </div>
        );
      if (index === 1)
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-500/30">
            <Medal className="h-3.5 w-3.5 text-white" />
          </div>
        );
      if (index === 2)
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg shadow-amber-600/30">
            <Medal className="h-3.5 w-3.5 text-white" />
          </div>
        );
      return null;
    };

    const getTrendIcon = (index: number, total: number) => {
      if (index < Math.floor(total * 0.2))
        return <ArrowUp className="h-3.5 w-3.5 text-green-400" />;
      if (index > Math.floor(total * 0.8))
        return <ArrowDown className="h-3.5 w-3.5 text-red-400" />;
      return <Minus className="h-3.5 w-3.5 text-gray-500" />;
    };

    const formResults = entry.form || ["W", "D", "L", "W", "D"];

    return (
      <motion.tr
        variants={itemVariants}
        className={`hover:bg-gray-700/40 transition-colors ${rowBg}`}
        initial={false}
        animate={isHighlighted ? { backgroundColor: "rgba(99,102,241,0.15)" } : {}}
      >
        <td className="px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`text-xs font-bold sm:text-sm ${
                isTop3 ? "text-yellow-500" : "text-gray-400"
              }`}
            >
              {index + 1}
            </span>
            {getRankIcon(index)}
            {!compact && (
              <span className="hidden sm:inline-block">{getTrendIcon(index, totalEntries)}</span>
            )}
          </div>
        </td>
        {!compact && (
          <td className="px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex items-center gap-2">
              {entry.profilePicture ? (
                <Image
                  src={entry.profilePicture}
                  alt={entry.username}
                  width={32}
                  height={32}
                  className="h-7 w-7 rounded-full border border-gray-600 object-cover sm:h-8 sm:w-8"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-bold text-white sm:h-8 sm:w-8">
                  {entry.username?.charAt(0)?.toUpperCase() || "P"}
                </div>
              )}
              <span className="text-xs font-semibold text-white sm:text-sm">
                {entry.username}
              </span>
              {isHighlighted && (
                <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-1.5 py-0.5 text-[8px] font-medium text-indigo-300 sm:px-2 sm:text-[10px]">
                  You
                </span>
              )}
            </div>
          </td>
        )}
        {compact ? (
          <>
            <td className="px-3 py-2.5 text-center text-sm font-bold text-white">
              {entry.points}
            </td>
            <td className="px-3 py-2.5 text-center text-sm font-semibold text-green-400">
              {entry.wins}
            </td>
            <td className="px-3 py-2.5 text-center">
              <div className="flex justify-center gap-0.5">
                {formResults.slice(0, 3).map((r, i) => (
                  <span
                    key={i}
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold sm:h-6 sm:w-6 sm:text-[10px] ${
                      r === "W"
                        ? "bg-green-500/20 text-green-400"
                        : r === "D"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </td>
          </>
        ) : (
          <>
            <td className="px-3 py-2.5 text-center text-xs text-gray-300 sm:px-4 sm:py-3 sm:text-sm">
              {entry.played}
            </td>
            <td className="px-3 py-2.5 text-center text-xs font-semibold text-green-400 sm:px-4 sm:py-3 sm:text-sm">
              {entry.wins}
            </td>
            <td className="px-3 py-2.5 text-center text-xs font-semibold text-yellow-400 sm:px-4 sm:py-3 sm:text-sm">
              {entry.draws}
            </td>
            <td className="px-3 py-2.5 text-center text-xs font-semibold text-red-400 sm:px-4 sm:py-3 sm:text-sm">
              {entry.losses}
            </td>
            <td className="px-3 py-2.5 text-center text-xs text-gray-300 sm:px-4 sm:py-3 sm:text-sm">
              {entry.goalsFor}
            </td>
            <td className="px-3 py-2.5 text-center text-xs text-gray-300 sm:px-4 sm:py-3 sm:text-sm">
              {entry.goalsAgainst}
            </td>
            <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
              <span
                className={`text-xs font-bold sm:text-sm ${
                  entry.goalDifference >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {entry.goalDifference}
              </span>
            </td>
            <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
              <span className="text-base font-bold text-white sm:text-lg">
                {entry.points}
              </span>
            </td>
            <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
              <div className="flex justify-center gap-0.5">
                {formResults.map((r, i) => (
                  <span
                    key={i}
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold sm:h-6 sm:w-6 sm:text-[10px] ${
                      r === "W"
                        ? "bg-green-500/20 text-green-400"
                        : r === "D"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </td>
          </>
        )}
      </motion.tr>
    );
  }
);

LeagueTableRow.displayName = "LeagueTableRow";

export default function LeagueTable({
  seasonId,
  compact = false,
  limit = 0,
  highlightPlayerId,
}: LeagueTableProps) {
  const [entries, setEntries] = useState<LeagueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"points" | "goals" | "wins">("points");

  useEffect(() => {
    if (seasonId) {
      fetchTable();
    }
  }, [seasonId, sortBy]);

  async function fetchTable() {
    setRefreshing(true);
    try {
      const response = await fetch(
        `/api/league/table?seasonId=${seasonId}&sort=${sortBy}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch league table");
      }
      const data = await response.json();
      setEntries(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching league table:", error);
      setError("Failed to load league table");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const displayEntries = useMemo(() => {
    if (limit > 0) {
      return entries.slice(0, limit);
    }
    return entries;
  }, [entries, limit]);

  const totalEntries = entries.length;
  const isFiltered = limit > 0 && totalEntries > limit;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
          <Trophy className="absolute inset-0 m-auto h-5 w-5 text-indigo-400" />
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading league table...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
        <p className="mt-2 text-sm text-red-300">{error}</p>
        <button
          onClick={fetchTable}
          className="mt-3 inline-flex min-h-[36px] items-center gap-2 rounded-lg bg-red-500/20 px-4 py-1.5 text-sm font-medium text-red-300 transition-all hover:bg-red-500/30"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gray-800/40 p-8 text-center backdrop-blur-xl">
        <Trophy className="mx-auto h-12 w-12 text-gray-600" />
        <h3 className="mt-3 text-lg font-semibold text-white">No Data Yet</h3>
        <p className="mt-1 text-sm text-gray-400">
          League table will appear once matches are played.
        </p>
      </div>
    );
  }

  // Compact view for dashboard
  if (compact) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-white/10 bg-gray-800/40 shadow-2xl backdrop-blur-xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10 bg-gray-800/60">
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:text-xs">
                  #
                </th>
                <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:text-xs">
                  Pts
                </th>
                <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:text-xs">
                  W
                </th>
                <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:text-xs">
                  Form
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayEntries.map((entry, index) => (
                <LeagueTableRow
                  key={entry.id}
                  entry={entry}
                  index={index}
                  totalEntries={totalEntries}
                  highlightId={highlightPlayerId}
                  compact={true}
                />
              ))}
            </tbody>
          </table>
        </div>
        {isFiltered && (
          <div className="border-t border-white/10 p-3 text-center">
            <Link
              href="/dashboard/standings"
              className="text-xs text-indigo-400 transition-colors hover:text-indigo-300"
            >
              View Full Table →
            </Link>
          </div>
        )}
      </motion.div>
    );
  }

  // Full view for standings page
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-white/10 bg-gray-800/40 shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gray-800/60 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h2 className="text-sm font-semibold text-white sm:text-base">
            League Standings
          </h2>
          <span className="rounded-full border border-white/10 bg-gray-700/30 px-2 py-0.5 text-[10px] text-gray-400">
            {entries.length} players
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "points" | "goals" | "wins")
            }
            className="min-h-[32px] rounded-lg border border-white/10 bg-gray-900/50 px-2 py-1 text-xs text-white transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:min-h-[36px] sm:px-3"
          >
            <option value="points">Sort by Points</option>
            <option value="goals">Sort by Goals</option>
            <option value="wins">Sort by Wins</option>
          </select>
          <button
            onClick={fetchTable}
            disabled={refreshing}
            className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border border-white/10 bg-gray-900/50 text-gray-400 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50 sm:min-h-[36px]"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10 bg-gray-800/50">
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                #
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                Player
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                P
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                W
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                D
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                L
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                GF
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                GA
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                GD
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                Pts
              </th>
              <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:py-3 sm:text-xs">
                Form
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayEntries.map((entry, index) => (
              <LeagueTableRow
                key={entry.id}
                entry={entry}
                index={index}
                totalEntries={totalEntries}
                highlightId={highlightPlayerId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-gray-800/50 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500/20" />
            <span>W = Win</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
            <span>D = Draw</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/20" />
            <span>L = Loss</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-indigo-500/30" />
            <span>You</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Points: Win = 3, Draw = 1, Loss = 0
        </div>
      </div>
    </motion.div>
  );
}