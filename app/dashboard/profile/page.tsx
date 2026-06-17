"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Camera, Edit2, Mail, Users, Trophy, Calendar, Award, MapPin, Shield, TrendingUp, Target, Activity, Phone, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import TrustBadge from "@/components/ui/TrustBadge"

interface ProfileData {
  username: string
  class: string
  bio: string
  favoriteClub: string
  preferredFormation: string
  preferredPlaystyle: string
  profilePicture: string
  bannerImage: string
  totalWins: number
  totalDraws: number
  totalLosses: number
  totalPoints: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  matchesPlayed: number
  winRate: number
  whatsappNumber: string
  whatsappVisible: boolean
  verifiedBadge: boolean
  trustScore: number
  isVerified: boolean
  name: string
  email: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [trustScore, setTrustScore] = useState<number>(0)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile")
        const data = await response.json()
        
        const matchesPlayed = (data.totalWins || 0) + (data.totalDraws || 0) + (data.totalLosses || 0)
        const winRate = matchesPlayed > 0 ? Math.round(((data.totalWins || 0) / matchesPlayed) * 100) : 0
        const goalDifference = (data.goalsFor || 0) - (data.goalsAgainst || 0)
        
        setProfile({
          ...data,
          matchesPlayed,
          winRate,
          goalDifference,
          trustScore: data.trustScore || 0,
          isVerified: data.isVerified || false,
          verifiedBadge: data.verifiedBadge || false
        })

        // ✅ Also fetch trust score separately
        if (session?.user?.id) {
          const trustRes = await fetch(`/api/admin/trust-score?userId=${session.user.id}`)
          if (trustRes.ok) {
            const trustData = await trustRes.json()
            setTrustScore(trustData.trustScore || 0)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    )
  }

  const displayTrustScore = profile?.trustScore || trustScore || 0
  // ✅ Check both isVerified and verifiedBadge
  const isVerified = profile?.isVerified || profile?.verifiedBadge || false

  return (
    <div className="max-w-5xl mx-auto">
      {/* Banner Section */}
      <div className="relative h-48 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
        {profile?.bannerImage && (
          <img src={profile.bannerImage} alt="Banner" className="h-full w-full object-cover" />
        )}
        <Link
          href="/dashboard/profile/edit"
          className="absolute bottom-4 right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-all"
        >
          <Camera size={20} />
        </Link>
      </div>

      {/* Profile Picture */}
      <div className="relative mx-6 -mt-16 flex items-end justify-between">
        <div className="relative">
          <div className="h-28 w-28 rounded-full border-4 border-gray-800 bg-gray-700 overflow-hidden">
            {profile?.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.username} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-3xl text-white">
                {profile?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <Link
            href="/dashboard/profile/edit"
            className="absolute bottom-0 right-0 rounded-full bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 transition-all"
          >
            <Camera size={14} />
          </Link>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-6 px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{profile?.username}</h1>
              {/* ✅ Show Verified Badge */}
              {isVerified && (
                <TrustBadge type="verified" />
              )}
              {displayTrustScore >= 80 && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                  <Star size={12} />
                  <span>High Trust</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Mail size={14} className="text-gray-500" />
              <p className="text-gray-400 text-sm">{profile?.email || session?.user?.email}</p>
            </div>
            {/* Trust Score Display */}
            <div className="flex items-center gap-2 mt-1">
              <Shield size={14} className="text-indigo-400" />
              <p className="text-gray-400 text-sm">
                Trust Score: <span className={`font-semibold ${displayTrustScore >= 80 ? "text-green-400" : displayTrustScore >= 50 ? "text-yellow-400" : "text-white"}`}>
                  {displayTrustScore}/100
                </span>
              </p>
            </div>
            {profile?.whatsappNumber && profile?.whatsappVisible && (
              <div className="flex items-center gap-2 mt-1">
                <Phone size={14} className="text-green-500" />
                <p className="text-gray-400 text-sm">WhatsApp available for match coordination</p>
              </div>
            )}
          </div>
          <Link
            href="/dashboard/profile/edit"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            <Edit2 size={16} />
            Edit Profile
          </Link>
        </div>

        {profile?.bio && (
          <p className="mt-4 text-gray-300">{profile.bio}</p>
        )}

        {/* Player Details */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-500">Class</p>
            <p className="text-sm font-semibold text-white mt-1">{profile?.class || "Not set"}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-500">Favorite Club</p>
            <p className="text-sm font-semibold text-white mt-1">{profile?.favoriteClub || "Not set"}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-500">Formation</p>
            <p className="text-sm font-semibold text-white mt-1">{profile?.preferredFormation || "Not set"}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-500">Playstyle</p>
            <p className="text-sm font-semibold text-white mt-1">{profile?.preferredPlaystyle || "Not set"}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-500">Total Points</p>
            <p className="text-sm font-semibold text-indigo-400 mt-1">{profile?.totalPoints || 0}</p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            Player Statistics
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-500/10 rounded-xl p-4 text-center border border-blue-500/20">
              <Activity className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-400">{profile?.matchesPlayed || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Matches</p>
            </div>
            <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
              <Trophy className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{profile?.totalWins || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Wins</p>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-4 text-center border border-yellow-500/20">
              <Target className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-400">{profile?.winRate || 0}%</p>
              <p className="text-xs text-gray-400 mt-1">Win Rate</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-4 text-center border border-purple-500/20">
              <Award className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-400">{profile?.totalPoints || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Points</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/20">
              <p className="text-xs text-gray-500">Wins</p>
              <p className="text-lg font-bold text-green-400">{profile?.totalWins || 0}</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-3 text-center border border-yellow-500/20">
              <p className="text-xs text-gray-500">Draws</p>
              <p className="text-lg font-bold text-yellow-400">{profile?.totalDraws || 0}</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/20">
              <p className="text-xs text-gray-500">Losses</p>
              <p className="text-lg font-bold text-red-400">{profile?.totalLosses || 0}</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/20">
              <p className="text-xs text-gray-500">Goals For</p>
              <p className="text-lg font-bold text-blue-400">{profile?.goalsFor || 0}</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-3 text-center border border-orange-500/20">
              <p className="text-xs text-gray-500">Goals Against</p>
              <p className="text-lg font-bold text-orange-400">{profile?.goalsAgainst || 0}</p>
            </div>
            <div className="bg-indigo-500/10 rounded-lg p-3 text-center border border-indigo-500/20">
              <p className="text-xs text-gray-500">Goal Diff</p>
              <p className={`text-lg font-bold ${(profile?.goalDifference || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {(profile?.goalDifference || 0) >= 0 ? `+${profile?.goalDifference}` : profile?.goalDifference}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}