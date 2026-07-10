"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo, useCallback,memo } from "react";
import {
  Trophy,
  Users,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  Shield,
  ArrowRight,
  Home,
  Plane,
  ChevronRight,
  Sparkles,
  Zap,
  Star,
  Medal,
  Crown,
  Activity,
  BarChart3,
  User,
  Mail,
  Settings,
  LogOut,
  Bell,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import TrustBadge from "@/components/ui/TrustBadge";
import { SkeletonStats, Skeleton } from "@/components/ui/Skeleton";
import StatusCard from "@/components/competition/StatusCard";
import PrizeDisplay from "@/components/competition/PrizeDisplay";

interface DashboardData {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  currentRank: number;
  totalPlayers: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  nextFixture: {
    id: string;
    opponent: string;
    date: string;
    isHome: boolean;
  } | null;
  recentResult: {
    opponent: string;
    score: string;
    result: string;
  } | null;
}

/* -------------------------------------------------------------------------- */
/*                            Animation variants                              */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.03 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const statCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

/* -------------------------------------------------------------------------- */
/*                              Helpers                                        */
/* -------------------------------------------------------------------------- */

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*                            Memoized Components                             */
/* -------------------------------------------------------------------------- */

const StatCard = memo(({ stat }: { stat: any }) => {
  const Icon = stat.icon;
  return (
    <motion.div
      variants={statCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="will-change-transform"
    >
      <div className={`group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg ${stat.glow} backdrop-blur-xl transition-colors hover:border-indigo-500/40`}>
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]`} />
        <div className="relative flex items-center justify-between">
          <div className={`bg-gradient-to-r ${stat.color} p-2.5 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</span>
        </div>
        <p className="relative text-sm font-medium text-gray-200 mt-3">{stat.name}</p>
        <p className="relative text-xs text-gray-500 mt-1">{stat.change}</p>
      </div>
    </motion.div>
  );
});

StatCard.displayName = "StatCard";

const GoalStat = memo(({ icon: Icon, label, value, color, borderColor }: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  borderColor: string;
}) => (
  <motion.div
    variants={itemVariants}
    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-indigo-500/40"
  >
    <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${borderColor} ring-1 ${color} transition group-hover:bg-opacity-25`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="text-2xl font-bold text-white leading-tight">{value}</p>
    </div>
  </motion.div>
));

GoalStat.displayName = "GoalStat";

/* -------------------------------------------------------------------------- */
/*                            Background Component                            */
/* -------------------------------------------------------------------------- */

const DecorBackground = memo(() => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950" />
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"
    />
    <motion.div
      animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl"
    />
    <motion.div
      animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl"
    />
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
  </div>
));

DecorBackground.displayName = "DecorBackground";

/* -------------------------------------------------------------------------- */
/*                            Main Component                                  */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [playerEntry, setPlayerEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === "ADMIN";

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, []);

  const fetchPlayerEntry = useCallback(async () => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/competition/player-entry");
      if (!res.ok) throw new Error("Failed to fetch player entry");
      const data = await res.json();
      setPlayerEntry(data);
    } catch (error) {
      console.error("Error fetching player entry:", error);
      setPlayerEntry({
        hasEntry: false,
        seasonId: null,
        seasonName: null,
        paymentRequired: false,
        entryFee: 0,
        hasPaid: false,
        status: "ERROR",
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    Promise.all([fetchDashboardData(), fetchPlayerEntry()]);
  }, [fetchDashboardData, fetchPlayerEntry]);

  const stats = useMemo(
    () => [
      {
        name: "Matches Played",
        value: data?.matchesPlayed || 0,
        icon: Calendar,
        color: "from-blue-500 to-cyan-500",
        glow: "shadow-blue-500/20",
        change: "This season",
      },
      {
        name: "Win Rate",
        value: `${data?.winRate || 0}%`,
        icon: TrendingUp,
        color: "from-green-500 to-emerald-500",
        glow: "shadow-emerald-500/20",
        change: `${data?.wins || 0}W ${data?.draws || 0}D ${data?.losses || 0}L`,
      },
      {
        name: "Current Rank",
        value: data?.currentRank ? `#${data.currentRank}` : "-",
        icon: Trophy,
        color: "from-yellow-500 to-orange-500",
        glow: "shadow-orange-500/20",
        change: `of ${data?.totalPlayers || 0} players`,
      },
      {
        name: "Total Points",
        value: data?.points || 0,
        icon: Award,
        color: "from-purple-500 to-pink-500",
        glow: "shadow-purple-500/20",
        change: `${data?.wins || 0}W ${data?.draws || 0}D ${data?.losses || 0}L`,
      },
    ],
    [data],
  );

  const rankProgress =
    data?.currentRank && data?.totalPlayers
      ? Math.max(5, Math.round(((data.totalPlayers - data.currentRank + 1) / data.totalPlayers) * 100))
      : 0;

  const shouldShowPrize =
    !isAdmin &&
    playerEntry?.hasEntry &&
    playerEntry?.paymentRequired &&
    playerEntry?.hasPaid;

  if (loading) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 backdrop-blur-sm p-6 border border-white/10">
          <Skeleton variant="text" className="w-64 h-8" />
          <Skeleton variant="text" className="w-48 h-4 mt-2" />
          <Skeleton variant="text" className="w-32 h-5 mt-2" />
        </div>
        <SkeletonStats />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton variant="avatar" className="h-4 w-4" />
                <Skeleton variant="text" className="w-20 h-3" />
              </div>
              <Skeleton variant="text" className="w-16 h-7" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-48" />
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
            <Skeleton variant="text" className="w-40 h-6" />
            <Skeleton variant="text" className="w-16 h-4" />
          </div>
          <div className="p-5 text-center">
            <Skeleton variant="text" className="w-48 h-6 mx-auto" />
            <Skeleton variant="text" className="w-32 h-4 mx-auto mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DecorBackground />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5 will-change-transform sm:space-y-6"
      >
        {/* Welcome Section */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 backdrop-blur-sm p-6 border border-white/10"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-purple-500/20 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {isAdmin
                  ? `Welcome Admin, ${session?.user?.name}! 👋`
                  : `Welcome back, ${session?.user?.name}! 👋`}
              </h1>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-medium text-indigo-300">
                {isAdmin ? "Admin" : "Player"}
              </span>
            </div>
            <p className="text-gray-300 mt-1">
              {isAdmin
                ? "Manage the Nexus Esports League from here."
                : "Ready for your next match? Check your fixtures below."}
            </p>
            <div className="mt-3">
              <TrustBadge type="last-active" />
            </div>
          </div>
        </motion.div>

        {/* Status Card */}
        {!isAdmin && playerEntry?.hasEntry && (
          <motion.div variants={itemVariants}>
            <StatusCard
              seasonId={playerEntry.seasonId}
              seasonName={playerEntry.seasonName}
              paymentRequired={playerEntry.paymentRequired}
              entryFee={playerEntry.entryFee}
              hasPaid={playerEntry.hasPaid}
              status={playerEntry.status}
              userId={session?.user?.id || ""}
              onPaymentSuccess={() => window.location.reload()}
            />
          </motion.div>
        )}

        {/* Prize Display */}
        {shouldShowPrize && (
          <motion.div variants={itemVariants}>
            <PrizeDisplay compact={true} />
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.name} stat={stat} />
          ))}
        </motion.div>

        {/* Goal Stats */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <GoalStat
            icon={Target}
            label="Goals For"
            value={data?.goalsFor || 0}
            color="text-blue-400"
            borderColor="bg-blue-500/15 ring-blue-500/30"
          />
          <GoalStat
            icon={Shield}
            label="Goals Against"
            value={data?.goalsAgainst || 0}
            color="text-red-400"
            borderColor="bg-red-500/15 ring-red-500/30"
          />
          <GoalStat
            icon={TrendingUp}
            label="Goal Difference"
            value={(data?.goalDifference || 0) >= 0 ? `+${data?.goalDifference}` : data?.goalDifference || 0}
            color={(data?.goalDifference || 0) >= 0 ? "text-green-400" : "text-red-400"}
            borderColor={(data?.goalDifference || 0) >= 0
              ? "bg-green-500/15 ring-green-500/30"
              : "bg-red-500/15 ring-red-500/30"
            }
          />
        </motion.div>

        {/* Upcoming Fixture & Recent Result */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Next Fixture */}
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                Next Fixture
              </h2>
              <Clock size={16} className="text-gray-500" />
            </div>
            {data?.nextFixture ? (
              <div className="p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-bold text-white shadow-lg shadow-indigo-900/40">
                    {getInitials(data.nextFixture.opponent)}
                  </div>
                  <p className="text-white font-semibold mt-3 mb-2">
                    vs {data.nextFixture.opponent}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      data.nextFixture.isHome
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                    }`}
                  >
                    {data.nextFixture.isHome ? (
                      <>
                        <Home className="h-3 w-3" /> Home
                      </>
                    ) : (
                      <>
                        <Plane className="h-3 w-3" /> Away
                      </>
                    )}
                  </span>
                  <p className="text-sm text-gray-400 mt-3 mb-4">
                    {new Date(data.nextFixture.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <Link
                    href="/dashboard/fixtures"
                    className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-purple-500"
                  >
                    View Match
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Calendar className="mx-auto h-8 w-8 text-gray-600" />
                <p className="text-gray-400 mt-2">No upcoming fixtures</p>
              </div>
            )}
          </motion.div>

          {/* Recent Result */}
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Recent Result
              </h2>
              <Trophy size={16} className="text-gray-500" />
            </div>
            {data?.recentResult ? (
              <div className="p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700 text-lg font-bold text-white shadow-lg">
                    {getInitials(data.recentResult.opponent)}
                  </div>
                  <p className="text-white font-semibold mt-3 mb-1">
                    vs {data.recentResult.opponent}
                  </p>
                  <p className="text-3xl font-bold text-white mb-2">
                    {data.recentResult.score}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                      data.recentResult.result === "W"
                        ? "bg-green-500/15 text-green-300 ring-1 ring-green-500/30"
                        : data.recentResult.result === "D"
                        ? "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30"
                        : "bg-red-500/15 text-red-300 ring-1 ring-red-500/30"
                    }`}
                  >
                    {data.recentResult.result === "W"
                      ? "Victory! 🎉"
                      : data.recentResult.result === "D"
                      ? "Draw 🤝"
                      : "Loss 😔"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Trophy className="mx-auto h-8 w-8 text-gray-600" />
                <p className="text-gray-400 mt-2">No recent results</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* League Table Preview */}
        <motion.div
          variants={itemVariants}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              League Standings
            </h2>
            <Users size={16} className="text-gray-500" />
          </div>
          <div className="p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-orange-500/30">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Current Rank
                  </p>
                  <p className="text-3xl font-bold text-white leading-tight">
                    #{data?.currentRank || "-"}
                  </p>
                  <p className="text-sm text-gray-400">
                    of {data?.totalPlayers || 0} players
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/standings"
                className="group inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-indigo-300 transition hover:bg-white/10 hover:text-indigo-200"
              >
                View Full Standings
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Progress indicator */}
            {data?.currentRank && data?.totalPlayers ? (
              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
                  <span>Top of the table</span>
                  <span>{rankProgress}% percentile</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rankProgress}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}