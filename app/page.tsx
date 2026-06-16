"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { 
  Trophy, Calendar, Users, Award, Shield, MessageCircle, 
  Crown, Sparkles, ChevronRight, Star, Zap, 
  TrendingUp, Mail, ArrowRight, CheckCircle, Activity, Clock
} from "lucide-react"

export default function HomePage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    totalTournaments: 0,
    totalAwards: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Try to fetch stats, but don't fail if unauthorized
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalPlayers: data.totalPlayers || 0,
          totalMatches: data.totalFixtures || 0,
          totalTournaments: 0,
          totalAwards: data.totalAwards || 0
        })
      } else {
        // If unauthorized, use default values or cached stats
        console.log("Stats not available for public view")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Use default values on error
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { name: "League System", description: "Premier League style rankings with points system", icon: Trophy, color: "from-yellow-500 to-orange-500", link: "/dashboard/standings" },
    { name: "Knockout Tournaments", description: "Single elimination brackets for intense competition", icon: Crown, color: "from-purple-500 to-pink-500", link: "/tournaments" },
    { name: "Live Fixtures", description: "Track matches and submit results with evidence", icon: Calendar, color: "from-blue-500 to-cyan-500", link: "/dashboard/fixtures" },
    { name: "Community Feed", description: "Share updates and celebrate victories", icon: MessageCircle, color: "from-green-500 to-emerald-500", link: "/dashboard/community" },
    { name: "Squad Showcase", description: "Upload and share your eFootball squads", icon: Shield, color: "from-indigo-500 to-purple-500", link: "/dashboard/squads" },
    { name: "Hall of Fame", description: "Celebrate champions and legends", icon: Award, color: "from-amber-500 to-yellow-500", link: "/hall-of-fame" },
  ]

  const liveStats = [
    { label: "Active Players", value: stats.totalPlayers, icon: Users, change: "Competing now" },
    { label: "Matches Played", value: stats.totalMatches, icon: Activity, change: "This season" },
    { label: "Tournaments", value: stats.totalTournaments, icon: Trophy, change: "Active" },
    { label: "Awards Given", value: stats.totalAwards, icon: Award, change: "All time" },
  ]

  // Show the page immediately with default stats, don't wait for loading
  if (loading) {
    // Show the page with skeleton or default stats
    // Instead of showing a loading spinner, show the page with default values
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold text-white">Nexus Esports</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/news" className="text-gray-300 hover:text-white transition-colors text-sm">News</Link>
              <Link href="/hall-of-fame" className="text-gray-300 hover:text-white transition-colors text-sm">Hall of Fame</Link>
              <Link href="/tournaments" className="text-gray-300 hover:text-white transition-colors text-sm">Tournaments</Link>
            </div>
            <div>
              {session ? (
                <Link 
                  href={session.user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex gap-3">
                  <Link 
                    href="/auth/signin"
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20 mb-6">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-400">{stats.totalPlayers || 0} Active Players</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Premier eFootball
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> League Platform</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Join the ultimate school esports ecosystem. Compete, connect, and climb the ranks.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href={session ? "/dashboard" : "/auth/signup"}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              {session ? "Go to Dashboard" : "Start Playing"}
              <ChevronRight className="inline ml-1 h-4 w-4" />
            </Link>
            <Link 
              href="/tournaments"
              className="px-8 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700"
            >
              View Tournaments
            </Link>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {liveStats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-xs text-green-400 mt-1">{stat.change}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Compete</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A complete platform for school esports competitions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link key={i} href={feature.link}>
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all group cursor-pointer">
                  <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.name}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Simple steps to start your esports journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create Account", description: "Sign up as a player and complete your profile", icon: Users },
              { step: "2", title: "Join League", description: "Participate in seasons and compete against others", icon: Trophy },
              { step: "3", title: "Play & Win", description: "Submit results, climb rankings, earn awards", icon: Crown },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Join the League?</h2>
          <p className="text-white/80 mb-8">Start your esports journey today and compete with the best</p>
          <Link 
            href={session ? "/dashboard" : "/auth/signup"}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            {session ? "Go to Dashboard" : "Get Started Now"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <span className="text-xl font-bold text-white">Nexus Esports</span>
              </div>
              <p className="text-gray-400 text-sm">The premier school eFootball league platform.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/news" className="hover:text-white transition-colors">News</Link></li>
                <li><Link href="/hall-of-fame" className="hover:text-white transition-colors">Hall of Fame</Link></li>
                <li><Link href="/tournaments" className="hover:text-white transition-colors">Tournaments</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/rules" className="hover:text-white transition-colors">Rules</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Nexus Esports League. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}