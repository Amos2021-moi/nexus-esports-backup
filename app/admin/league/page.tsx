"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  Calendar,
  RefreshCw,
  X,
  UserPlus,
  Users2,
  Trophy,
  Crown,
  Sparkles,
  CheckCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  ListChecks,
} from "lucide-react";
import toast from "react-hot-toast";

interface Player {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: { username: string } | null;
}

interface Season {
  id: string;
  name: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface LeagueEntry {
  id: string;
  playerId: string;
  player: Player;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    // Use numeric bezier for easing; cast to any to satisfy framer-motion's TypeScript types
    transition: { duration: 0.45, ease: ([0.22, 1, 0.36, 1] as unknown) as any },
  },
};

function DecorBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-pink-500/10 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

function playerLabel(player: Player) {
  return player.profile?.username || player.name || player.email;
}

function rankMedal(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return index + 1;
}

export default function AdminLeaguePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<LeagueEntry[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [addingAll, setAddingAll] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [singlePlayerId, setSinglePlayerId] = useState("");

  // Role check - redirect if not admin
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [session]);

  async function fetchData() {
    try {
      const [seasonsRes, playersRes] = await Promise.all([
        fetch("/api/seasons", { credentials: "include" }),
        fetch("/api/players", { credentials: "include" }),
      ]);
      const seasonsData = await seasonsRes.json();
      const playersData = await playersRes.json();

      setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
      setPlayers(Array.isArray(playersData) ? playersData : []);

      if (seasonsData.length > 0) {
        setSelectedSeason(seasonsData[0].id);
        fetchEntries(seasonsData[0].id);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function fetchEntries(seasonId: string) {
    const res = await fetch(`/api/league/entries?seasonId=${seasonId}`, {
      credentials: "include",
    });
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
  }

  // ✅ Bulk add selected players
  async function addSelectedPlayers() {
    if (!selectedSeason) {
      toast.error("Select a season first");
      return;
    }

    if (selectedPlayers.length === 0) {
      toast.error("Select at least one player");
      return;
    }

    setBulkAdding(true);
    let successCount = 0;
    let failCount = 0;

    for (const playerId of selectedPlayers) {
      try {
        const response = await fetch("/api/league/add-player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            seasonId: selectedSeason,
            playerId: playerId,
          }),
        });

        if (response.ok) {
          successCount++;
          // Create PlayerSeasonEntry for payment tracking
          await fetch("/api/competition/player-entry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              seasonId: selectedSeason,
              userId: playerId,
            }),
          });
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        console.error("Error adding player:", error);
      }
    }

    setBulkAdding(false);
    setSelectedPlayers([]);
    fetchEntries(selectedSeason);

    toast.success(
      `Added ${successCount} players${failCount > 0 ? `, ${failCount} failed` : ""}`
    );
  }

  // ✅ Add ALL players to season
  async function addAllPlayers() {
    if (!selectedSeason) {
      toast.error("Select a season first");
      return;
    }

    // Get all PLAYER role users not already in season
    const availablePlayers = players.filter(
      (p) => p.role === "PLAYER" && !entries.some((e) => e.playerId === p.id)
    );

    if (availablePlayers.length === 0) {
      toast.error("No new players to add");
      return;
    }

    if (!confirm(`Add all ${availablePlayers.length} players to this season?`)) {
      return;
    }

    setAddingAll(true);
    let successCount = 0;
    let failCount = 0;

    for (const player of availablePlayers) {
      try {
        const response = await fetch("/api/league/add-player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            seasonId: selectedSeason,
            playerId: player.id,
          }),
        });

        if (response.ok) {
          successCount++;
          await fetch("/api/competition/player-entry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              seasonId: selectedSeason,
              userId: player.id,
            }),
          });
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        console.error("Error adding player:", error);
      }
    }

    setAddingAll(false);
    fetchEntries(selectedSeason);
    toast.success(
      `Added ${successCount} players${failCount > 0 ? `, ${failCount} failed` : ""}`
    );
  }

  // ✅ Toggle player selection
  function togglePlayer(playerId: string) {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  }

  // ✅ Select/Deselect all players
  function toggleAllPlayers() {
    const availablePlayers = players.filter(
      (p) => p.role === "PLAYER" && !entries.some((e) => e.playerId === p.id)
    );

    const allPlayerIds = availablePlayers.map((p) => p.id);

    if (selectedPlayers.length === allPlayerIds.length && allPlayerIds.length > 0) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(allPlayerIds);
    }
  }

  async function addPlayerToSeason(playerId: string) {
    if (!selectedSeason) {
      toast.error("Select a season first");
      return;
    }

    const response = await fetch("/api/league/add-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        seasonId: selectedSeason,
        playerId: playerId,
      }),
    });

    if (response.ok) {
      toast.success("Player added to season!");
      await fetch("/api/competition/player-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId: selectedSeason,
          userId: playerId,
        }),
      });
      setSinglePlayerId("");
      fetchEntries(selectedSeason);
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to add player");
    }
  }

  async function removePlayerFromSeason(entryId: string) {
    if (!confirm("Are you sure you want to remove this player from the season? This will delete their stats.")) return;

    try {
      const response = await fetch("/api/league/entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entryId }),
      });

      if (response.ok) {
        toast.success("Player removed from season");
        fetchEntries(selectedSeason);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to remove player");
      }
    } catch (error) {
      console.error("Error removing player:", error);
      toast.error("Failed to remove player");
    }
  }

  async function generateFixtures() {
    if (!selectedSeason) {
      toast.error("Select a season first");
      return;
    }

    if (entries.length < 2) {
      toast.error("Need at least 2 players in the season to generate fixtures");
      return;
    }

    setGenerating(true);
    const response = await fetch("/api/fixtures/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ seasonId: selectedSeason }),
    });

    if (response.ok) {
      const data = await response.json();
      toast.success(`Success! ${data.count} fixtures generated.`);
    } else {
      const error = await response.json();
      toast.error(error.error || "Failed to generate fixtures");
    }
    setGenerating(false);
  }

  // Get available players (not already in season)
  const availablePlayers = players.filter(
    (p) => p.role === "PLAYER" && !entries.some((e) => e.playerId === p.id)
  );

  const filteredAvailablePlayers = availablePlayers.filter((p) =>
    playerLabel(p).toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.points - a.points || b.wins - a.wins),
    [entries]
  );

  const selectedSeasonInfo = seasons.find((season) => season.id === selectedSeason);
  const leader = sortedEntries[0];
  const totalPlayed = entries.reduce((sum, entry) => sum + entry.played, 0);
  const totalWins = entries.reduce((sum, entry) => sum + entry.wins, 0);

  const statCards = [
    {
      label: "Season Players",
      value: entries.length,
      hint: "Players in this season",
      icon: Users,
      accent: "text-indigo-400",
      ring: "border-indigo-500/20",
      glow: "from-indigo-500/20",
    },
    {
      label: "Matches Played",
      value: totalPlayed,
      hint: "Total recorded appearances",
      icon: Calendar,
      accent: "text-purple-400",
      ring: "border-purple-500/20",
      glow: "from-purple-500/20",
    },
    {
      label: "Points Leader",
      value: leader ? playerLabel(leader.player) : "—",
      hint: leader ? `${leader.points} points` : "No leader yet",
      icon: Crown,
      accent: "text-yellow-400",
      ring: "border-yellow-500/20",
      glow: "from-yellow-500/20",
    },
    {
      label: "Available Pool",
      value: availablePlayers.length,
      hint: "Players not in season",
      icon: UserPlus,
      accent: "text-green-400",
      ring: "border-green-500/20",
      glow: "from-green-500/20",
    },
  ];

  // Show loading while checking role
  if (status === "loading" || loading) {
    return (
      <>
        <DecorBackground />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" />
            <div className="text-gray-400">Loading league data...</div>
          </div>
        </div>
      </>
    );
  }

  // If not admin, don't render anything (redirect will happen)
  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <>
      <DecorBackground />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5 sm:space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 sm:h-12 sm:w-12">
                <Trophy className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                  🏆 League Management
                </h1>
                <p className="mt-0.5 text-xs text-gray-300 sm:text-sm">
                  Manage seasons, players, standings, and fixture generation
                </p>
              </div>
            </div>
            <span className="flex w-fit items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              {selectedSeasonInfo?.name || "No season selected"}
            </span>
          </div>
        </motion.div>

        {/* Season Selection */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/10 bg-gray-800/40 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Select Season</h2>
          </div>
          {seasons.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-gray-900/40 py-8 text-center">
              <p className="text-gray-400">No seasons found.</p>
              <button
                onClick={() => router.push("/admin/seasons")}
                className="mt-3 inline-flex min-h-[44px] items-center justify-center text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Create a season first →
              </button>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(e.target.value);
                  fetchEntries(e.target.value);
                  setSelectedPlayers([]);
                }}
                className="min-h-[44px] w-full appearance-none rounded-xl border border-white/10 bg-gray-900/50 p-3 pr-10 text-white transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.isActive ? "(Active)" : ""}
                  </option>
                ))}
              </select>
              <ArrowRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-gray-500" />
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`group relative min-h-[44px] overflow-hidden rounded-2xl border bg-gray-800/40 p-4 shadow-xl backdrop-blur-xl transition-colors hover:border-indigo-500/40 ${stat.ring}`}
            >
              <div
                className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${stat.glow} to-transparent opacity-40 blur-2xl transition-opacity group-hover:opacity-70`}
              />
              <div className="relative flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className={`truncate text-xl font-bold sm:text-2xl ${stat.accent}`}>{stat.value}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-400 sm:text-sm">{stat.label}</p>
                </div>
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 ${stat.accent}`}>
                  <stat.icon className="h-5 w-5" />
                </span>
              </div>
              <p className="relative mt-2 truncate text-[11px] text-gray-500">{stat.hint}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Player Section - BULK */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/10 bg-gray-800/40 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              Add Players to Season
            </h2>
            <span className="text-xs text-gray-500">
              {selectedPlayers.length} of {availablePlayers.length} selected
            </span>
          </div>

          <div className="space-y-4">
            {/* Bulk Select */}
            {availablePlayers.length > 0 ? (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={toggleAllPlayers}
                    className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20 sm:w-auto"
                  >
                    {selectedPlayers.length === availablePlayers.length ? "Deselect All" : "Select All"}
                  </button>
                  <div className="relative flex-1 sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      placeholder="Search available players..."
                      className="min-h-[44px] w-full rounded-xl border border-white/10 bg-gray-900/50 py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-gray-900/40 p-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredAvailablePlayers.map((player) => (
                      <label
                        key={player.id}
                        className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border p-3 transition-all ${
                          selectedPlayers.includes(player.id)
                            ? "border-indigo-500 bg-indigo-500/20"
                            : "border-white/10 bg-gray-800/50 hover:bg-gray-700/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => togglePlayer(player.id)}
                          className="h-4 w-4 accent-indigo-500"
                        />
                        <span className="min-w-0 truncate text-sm text-white">
                          {playerLabel(player)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {filteredAvailablePlayers.length === 0 && (
                    <p className="py-8 text-center text-sm text-gray-500">No available players match your search.</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={addSelectedPlayers}
                    disabled={bulkAdding || selectedPlayers.length === 0}
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-indigo-900/30 transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                  >
                    {bulkAdding ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Add Selected ({selectedPlayers.length})
                      </>
                    )}
                  </button>

                  <button
                    onClick={addAllPlayers}
                    disabled={addingAll || availablePlayers.length === 0}
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                  >
                    {addingAll ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Adding All...
                      </>
                    ) : (
                      <>
                        <Users2 size={18} />
                        Add All ({availablePlayers.length})
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-gray-900/40 py-6 text-center text-gray-400">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
                <p>All players are already in this season</p>
                <p className="mt-1 text-xs">Create more players from the Players page</p>
              </div>
            )}
          </div>

          {/* Quick Add - Single Player (backup) */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="mb-2 text-xs text-gray-500">Or add a single player:</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={singlePlayerId}
                onChange={(e) => setSinglePlayerId(e.target.value)}
                className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-gray-900/50 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">-- Select Player --</option>
                {availablePlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {playerLabel(p)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (singlePlayerId) addPlayerToSeason(singlePlayerId);
                }}
                disabled={!singlePlayerId}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
        </motion.div>

        {/* Current Participants */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/10 bg-gray-800/40 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="h-5 w-5 text-blue-400" />
            Season Participants ({entries.length})
          </h2>
          {entries.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <Users className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No players added to this season yet</p>
              <p className="mt-1 text-sm">Use the form above to add players</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-900/60">
                  <tr>
                    <th className="sticky left-0 z-10 bg-gray-900/95 px-4 py-3 text-left font-medium text-gray-400 backdrop-blur-xl">#</th>
                    <th className="sticky left-12 z-10 bg-gray-900/95 px-4 py-3 text-left font-medium text-gray-400 backdrop-blur-xl">Player</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-400">P</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-400">W</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-400">D</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-400">L</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-400">Pts</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedEntries.map((entry, index) => (
                    <tr key={entry.id} className="transition-colors hover:bg-white/[0.03]">
                      <td className="sticky left-0 z-10 bg-gray-800/95 px-4 py-3 text-white backdrop-blur-xl">
                        {rankMedal(index)}
                      </td>
                      <td className="sticky left-12 z-10 bg-gray-800/95 px-4 py-3 text-white backdrop-blur-xl">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                            {playerLabel(entry.player).charAt(0).toUpperCase()}
                          </span>
                          <span className="max-w-[160px] truncate">{playerLabel(entry.player)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-300">{entry.played}</td>
                      <td className="px-4 py-3 text-center text-green-400">{entry.wins}</td>
                      <td className="px-4 py-3 text-center text-yellow-400">{entry.draws}</td>
                      <td className="px-4 py-3 text-center text-red-400">{entry.losses}</td>
                      <td className="px-4 py-3 text-center font-bold text-white">{entry.points}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removePlayerFromSeason(entry.id)}
                          className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
                          title="Remove player from season"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Generate Fixtures */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/10 bg-gray-800/40 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <ListChecks className="h-5 w-5 text-green-400" />
            Generate Fixtures
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            This will create home and away fixtures for all players in the season.
            {entries.length < 2 && " Need at least 2 players to generate fixtures."}
          </p>
          <button
            onClick={generateFixtures}
            disabled={generating || entries.length < 2}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {generating ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar size={18} />
                Generate Round-Robin Fixtures
              </>
            )}
          </button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-300">
            <HelpCircle className="h-5 w-5" />
            How to manage your league:
          </h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-gray-300">
            <li>Create a season first (if none exists)</li>
            <li>Add players to the season using the bulk selector above</li>
            <li>Once you have at least 2 players, click "Generate Fixtures"</li>
            <li>Players can submit results from their dashboard</li>
            <li>Approve results from the Results page</li>
            <li>Standings will update automatically</li>
          </ol>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-gray-900/30 p-3 text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-blue-300" />
            Points system shown above follows existing saved standings: P, W, D, L, and Pts.
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
