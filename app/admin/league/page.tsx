"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Users, Calendar, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

interface Player {
  id: string
  name: string
  email: string
  role: string
  profile: { username: string } | null
}

interface Season {
  id: string
  name: string
  isActive: boolean
  startDate: string
  endDate: string
}

interface LeagueEntry {
  id: string
  playerId: string
  player: Player
  played: number
  wins: number
  draws: number
  losses: number
  points: number
}

export default function AdminLeaguePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [entries, setEntries] = useState<LeagueEntry[]>([])
  const [selectedSeason, setSelectedSeason] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Role check - redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchData()
    }
  }, [session])

  async function fetchData() {
    try {
      const [seasonsRes, playersRes] = await Promise.all([
        fetch("/api/seasons", { credentials: "include" }),
        fetch("/api/players", { credentials: "include" })
      ])
      const seasonsData = await seasonsRes.json()
      const playersData = await playersRes.json()
      
      setSeasons(Array.isArray(seasonsData) ? seasonsData : [])
      setPlayers(Array.isArray(playersData) ? playersData : [])
      
      if (seasonsData.length > 0) {
        setSelectedSeason(seasonsData[0].id)
        fetchEntries(seasonsData[0].id)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  async function fetchEntries(seasonId: string) {
    const res = await fetch(`/api/league/entries?seasonId=${seasonId}`, {
      credentials: "include"
    })
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
  }

  async function addPlayerToSeason() {
    if (!selectedSeason || !selectedPlayer) {
      toast.error("Select both season and player")
      return
    }

    const response = await fetch("/api/league/add-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        seasonId: selectedSeason,
        playerId: selectedPlayer,
      }),
    })

    if (response.ok) {
      toast.success("Player added to season!")
      setSelectedPlayer("")
      fetchEntries(selectedSeason)
    } else {
      const error = await response.json()
      toast.error(error.error || "Failed to add player")
    }
  }

  async function generateFixtures() {
    if (!selectedSeason) {
      toast.error("Select a season first")
      return
    }

    if (entries.length < 2) {
      toast.error("Need at least 2 players in the season to generate fixtures")
      return
    }

    setGenerating(true)
    const response = await fetch("/api/fixtures/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ seasonId: selectedSeason }),
    })

    if (response.ok) {
      const data = await response.json()
      toast.success(`Success! ${data.count} fixtures generated.`)
    } else {
      const error = await response.json()
      toast.error(error.error || "Failed to generate fixtures")
    }
    setGenerating(false)
  }

  // Show loading while checking role
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  // If not admin, don't render anything (redirect will happen)
  if (!session || session.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">League Management</h1>
        <p className="text-gray-400 mt-1">Manage seasons, players, and fixtures</p>
      </div>

      {/* Season Selection */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Select Season</h2>
        {seasons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No seasons found.</p>
            <button 
              onClick={() => router.push("/admin/seasons")}
              className="text-indigo-400 hover:underline mt-2 inline-block"
            >
              Create a season first →
            </button>
          </div>
        ) : (
          <select
            value={selectedSeason}
            onChange={(e) => {
              setSelectedSeason(e.target.value)
              fetchEntries(e.target.value)
            }}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            {seasons.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.isActive ? "(Active)" : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Add Player Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Add Player to Season</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">-- Select Player --</option>
            {players.filter(p => p.role === "PLAYER").map((p) => (
              <option key={p.id} value={p.id}>
                {p.profile?.username || p.name || p.email}
              </option>
            ))}
          </select>
          <button
            onClick={addPlayerToSeason}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 justify-center"
          >
            <Plus size={18} />
            Add Player
          </button>
        </div>
      </div>

      {/* Current Participants */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Season Participants ({entries.length})</h2>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No players added to this season yet</p>
            <p className="text-sm mt-1">Use the form above to add players</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left py-3 text-gray-400 font-medium">Player</th>
                  <th className="text-center py-3 text-gray-400 font-medium">P</th>
                  <th className="text-center py-3 text-gray-400 font-medium">W</th>
                  <th className="text-center py-3 text-gray-400 font-medium">D</th>
                  <th className="text-center py-3 text-gray-400 font-medium">L</th>
                  <th className="text-center py-3 text-gray-400 font-medium">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700/50">
                    <td className="py-3 text-white">
                      {entry.player.profile?.username || entry.player.name || entry.player.email}
                    </td>
                    <td className="py-3 text-center text-gray-300">{entry.played}</td>
                    <td className="py-3 text-center text-green-400">{entry.wins}</td>
                    <td className="py-3 text-center text-yellow-400">{entry.draws}</td>
                    <td className="py-3 text-center text-red-400">{entry.losses}</td>
                    <td className="py-3 text-center text-white font-bold">{entry.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Fixtures */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Generate Fixtures</h2>
        <p className="text-gray-400 text-sm mb-4">
          This will create home and away fixtures for all players in the season.
          {entries.length < 2 && " Need at least 2 players to generate fixtures."}
        </p>
        <button
          onClick={generateFixtures}
          disabled={generating || entries.length < 2}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      </div>

      {/* Help Section */}
      <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-6">
        <h3 className="text-blue-400 font-semibold mb-2">How to manage your league:</h3>
        <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
          <li>Create a season first (if none exists)</li>
          <li>Add players to the season using the dropdown above</li>
          <li>Once you have at least 2 players, click "Generate Fixtures"</li>
          <li>Players can submit results from their dashboard</li>
          <li>Approve results from the Results page</li>
          <li>Standings will update automatically</li>
        </ol>
      </div>
    </div>
  )
}