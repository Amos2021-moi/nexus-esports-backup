"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { 
  Trophy, Calendar, Users, Award, Shield, MessageCircle, 
  Crown, Sparkles, ChevronRight, Star, Zap, 
  TrendingUp, Mail, ArrowRight, CheckCircle, Activity, Clock,
  Globe, MapPin, Phone, Menu, X, Sun, Moon, Search, Bell,
  UserPlus, LogIn, Home, Info, HelpCircle, ExternalLink
} from "lucide-react"

export default function HomePage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    totalTournaments: 0,
    totalAwards: 0,
    activePlayers: 0,
    totalSeasons: 0,
    totalNews: 0,
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // ✅ Force fresh fetch - IGNORE CACHE
      const res = await fetch("/api/admin/stats", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalPlayers: data.totalPlayers || 0,
          totalMatches: data.totalFixtures || 0,
          totalTournaments: data.totalTournaments || 0,
          totalAwards: data.totalAwards || 0,
          activePlayers: data.activePlayers || 0,
          totalSeasons: data.totalSeasons || 0,
          totalNews: data.totalNews || 0,
          totalPosts: data.totalPosts || 0,
          totalComments: data.totalComments || 0,
          totalLikes: data.totalLikes || 0
        })
      } else {
        console.log("Stats API returned error, retrying...")
        setTimeout(fetchStats, 2000)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      setTimeout(fetchStats, 2000)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { 
      name: "League System", 
      description: "Premier League style rankings with points system. Win=3, Draw=1, Loss=0.", 
      icon: Trophy, 
      color: "from-yellow-500 to-orange-500", 
      link: "/dashboard/standings" 
    },
    { 
      name: "Knockout Tournaments", 
      description: "Single elimination brackets for intense competition. Crown the champion!", 
      icon: Crown, 
      color: "from-purple-500 to-pink-500", 
      link: "/tournaments" 
    },
    { 
      name: "Live Fixtures", 
      description: "Track matches, submit results with evidence, and get admin approval.", 
      icon: Calendar, 
      color: "from-blue-500 to-cyan-500", 
      link: "/dashboard/fixtures" 
    },
    { 
      name: "Community Feed", 
      description: "Share updates, celebrate victories, like posts, and comment.", 
      icon: MessageCircle, 
      color: "from-green-500 to-emerald-500", 
      link: "/dashboard/community" 
    },
    { 
      name: "Squad Showcase", 
      description: "Upload and share your eFootball squads with formation and playstyle.", 
      icon: Shield, 
      color: "from-indigo-500 to-purple-500", 
      link: "/dashboard/squads" 
    },
    { 
      name: "Hall of Fame", 
      description: "Celebrate champions, legends, and record holders.", 
      icon: Award, 
      color: "from-amber-500 to-yellow-500", 
      link: "/hall-of-fame" 
    },
    { 
      name: "Player Profiles", 
      description: "Custom profiles with stats, badges, and match history.", 
      icon: Users, 
      color: "from-pink-500 to-rose-500", 
      link: "/dashboard/profile" 
    },
    { 
      name: "Real-time Stats", 
      description: "Live rankings, goal difference, and player performance metrics.", 
      icon: TrendingUp, 
      color: "from-cyan-500 to-blue-500", 
      link: "/dashboard/statistics" 
    },
    { 
      name: "Awards & Achievements", 
      description: "Golden Boot, Player of the Season, and more.", 
      icon: Award, 
      color: "from-orange-500 to-red-500", 
      link: "/dashboard/awards" 
    },
  ]

  const liveStats = [
    { label: "Active Players", value: stats.activePlayers || stats.totalPlayers, icon: Users, change: "Competing now", color: "text-blue-400" },
    { label: "Matches Played", value: stats.totalMatches, icon: Activity, change: "This season", color: "text-green-400" },
    { label: "Tournaments", value: stats.totalTournaments, icon: Trophy, change: "Active", color: "text-yellow-400" },
    { label: "Awards Given", value: stats.totalAwards, icon: Award, change: "All time", color: "text-purple-400" },
    { label: "Seasons", value: stats.totalSeasons, icon: Calendar, change: "Completed", color: "text-indigo-400" },
    { label: "News Articles", value: stats.totalNews, icon: Bell, change: "Published", color: "text-pink-400" },
  ]

  const testimonials = [
    {
      name: "John Mwangi",
      role: "League Champion",
      quote: "Nexus Esports League transformed our school's gaming culture. The competition is fierce but fair.",
      avatar: "J",
      rating: 5
    },
    {
      name: "Sarah Ochieng",
      role: "Tournament Winner",
      quote: "The best eFootball platform I've ever used. Love the squad showcase and community features.",
      avatar: "S",
      rating: 5
    },
    {
      name: "Michael Odhiambo",
      role: "Rising Star",
      quote: "From a casual player to competing at the top. The ranking system really pushes you to improve.",
      avatar: "M",
      rating: 5
    },
  ]

  const partners = [
    { name: "eFootball", icon: "⚽", color: "bg-blue-500/10" },
    { name: "PlayStation", icon: "🎮", color: "bg-indigo-500/10" },
    { name: "Xbox", icon: "🕹️", color: "bg-green-500/10" },
    { name: "Nintendo", icon: "🎯", color: "bg-red-500/10" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold text-white">Nexus Esports</span>
              <span className="hidden md:inline-block text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                BETA
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
  <Link href="/news" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
    <Bell size={14} />
    News
  </Link>
  <Link href="/hall-of-fame" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
    <Award size={14} />
    Hall of Fame
  </Link>
  <Link href="/tournaments" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
    <Trophy size={14} />
    Tournaments
  </Link>
  <Link href="/standings" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
    <TrendingUp size={14} />
    Rankings
  </Link>
</div>

            <div className="flex items-center gap-3">
              {session ? (
                <Link 
                  href={session.user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm flex items-center gap-2"
                >
                  Dashboard
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <div className="flex gap-3">
                  <Link 
                    href="/auth/signin"
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm hidden sm:flex items-center gap-1"
                  >
                    <LogIn size={14} />
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm flex items-center gap-2"
                  >
                    <UserPlus size={14} />
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20 mb-6 animate-pulse">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-400">{stats.totalPlayers.toLocaleString()} Players • {stats.totalMatches.toLocaleString()} Matches</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Premier eFootball
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">League Platform</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Join the ultimate school esports ecosystem. Compete in leagues, tournaments, 
            and connect with players. Win trophies and earn your place in the Hall of Fame.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href={session ? "/dashboard" : "/auth/signup"}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
            >
              {session ? "Go to Dashboard" : "Start Playing"}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/tournaments"
              className="px-8 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700 flex items-center gap-2 hover:border-indigo-500/50"
            >
              View Tournaments
              <Trophy size={16} />
            </Link>
            <Link 
              href="/about"
              className="px-8 py-3 bg-gray-800/50 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700/50 flex items-center gap-2"
            >
              Learn More
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mt-16">
            {liveStats.map((stat, i) => (
              <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-indigo-500/30 transition-all group">
                <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                {loading ? (
                  <div className="h-7 w-12 bg-gray-700 rounded animate-pulse mx-auto"></div>
                ) : (
                  <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                <p className="text-[10px] text-green-400/70 mt-0.5">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              <span>Verified Matches</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-blue-400" />
              <span>Admin Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-yellow-400" />
              <span>Live Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-purple-400" />
              <span>{stats.totalPlayers || 0}+ Players</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4">
              <Star className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-indigo-400">Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Compete</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A complete platform for school esports competitions with all the tools you need</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link key={i} href={feature.link}>
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all group h-full hover:bg-gray-800/70">
                  <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">{feature.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center text-sm text-indigo-400 group-hover:gap-2 transition-all">
                    Learn More <ChevronRight size={14} className="ml-1" />
                  </div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 mb-4">
              <Zap className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Getting Started</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Simple steps to start your esports journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
            
            {[
              { 
                step: "1", 
                title: "Create Account", 
                description: "Sign up as a player and complete your profile with your eFootball details and preferred playstyle.",
                icon: UserPlus,
                color: "from-indigo-500 to-purple-500"
              },
              { 
                step: "2", 
                title: "Join League", 
                description: "Participate in seasons, get fixtures, and compete against other players in the league.",
                icon: Trophy,
                color: "from-yellow-500 to-orange-500"
              },
              { 
                step: "3", 
                title: "Play & Win", 
                description: "Submit results, climb rankings, earn awards, and become a legend in the Hall of Fame.",
                icon: Crown,
                color: "from-purple-500 to-pink-500"
              },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-lg shadow-indigo-500/20`}>
                  {item.step}
                </div>
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-indigo-500/30 transition-all">
                  <item.icon className="h-8 w-8 mx-auto mb-3 text-indigo-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20 mb-4">
              <Star className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-400">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Players Say</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Real feedback from our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{t.name}</h4>
                    <p className="text-sm text-gray-400">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="flex gap-1 mt-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-wider">Supported by</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {partners.map((partner, i) => (
              <div key={i} className={`${partner.color} px-6 py-3 rounded-xl border border-white/5 flex items-center gap-2`}>
                <span className="text-2xl">{partner.icon}</span>
                <span className="text-gray-300 font-medium">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Join the League?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Start your esports journey today and compete with the best. 
              {stats.totalPlayers > 0 ? ` Join ${stats.totalPlayers} other players!` : " Be the first to join!"}
            </p>
            <Link 
              href={session ? "/dashboard" : "/auth/signup"}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              {session ? "Go to Dashboard" : "Get Started Now"}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <span className="text-xl font-bold text-white">Nexus Esports</span>
              </div>
              <p className="text-gray-400 text-sm">The premier school eFootball league platform. Compete, connect, and climb the ranks.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/tournaments" className="hover:text-white transition-colors">Tournaments</Link></li>
                <li><Link href="/hall-of-fame" className="hover:text-white transition-colors">Hall of Fame</Link></li>
                <li><Link href="/news" className="hover:text-white transition-colors">News</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/rules" className="hover:text-white transition-colors">Rules</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Mail size={14} /> support@nexusesports.com</li>
                <li className="flex items-center gap-2"><Globe size={14} /> www.nexusesports.com</li>
                <li className="flex items-center gap-2"><MapPin size={14} /> School Esports League</li>
              </ul>
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