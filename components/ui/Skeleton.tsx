"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "text" | "avatar" | "image" | "table-row"
}

export function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
  const variants = {
    card: "h-32 w-full rounded-xl bg-gray-700/50",
    text: "h-4 w-full rounded bg-gray-700/50",
    avatar: "h-12 w-12 rounded-full bg-gray-700/50",
    image: "h-48 w-full rounded-lg bg-gray-700/50",
    "table-row": "h-12 w-full rounded bg-gray-700/30",
  }

  return (
    <div
      className={cn(
        "animate-pulse",
        variants[variant] || variants.text,
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton variant="image" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <Skeleton variant="text" className="w-1/3" />
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between">
            <Skeleton variant="avatar" className="h-12 w-12" />
            <Skeleton variant="text" className="w-16 h-8" />
          </div>
          <Skeleton variant="text" className="w-24 h-4 mt-3" />
          <Skeleton variant="text" className="w-16 h-3 mt-1" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonMatchCard() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
        <Skeleton variant="text" className="w-32" />
        <Skeleton variant="text" className="w-16" />
      </div>
      <div className="p-5 text-center space-y-3">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton variant="avatar" className="h-10 w-10" />
            <Skeleton variant="text" className="w-20" />
          </div>
          <Skeleton variant="text" className="w-8 h-6" />
          <span className="text-gray-500 text-sm">vs</span>
          <Skeleton variant="text" className="w-8 h-6" />
          <div className="flex items-center gap-2">
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="avatar" className="h-10 w-10" />
          </div>
        </div>
        <Skeleton variant="text" className="w-32 mx-auto" />
        <Skeleton variant="text" className="w-24 mx-auto h-8" />
      </div>
    </div>
  )
}

export function SkeletonLeagueTable() {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <Skeleton variant="text" className="w-32 h-6" />
      </div>
      <div className="divide-y divide-gray-700">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton variant="text" className="w-6 h-4" />
            <Skeleton variant="avatar" className="h-8 w-8" />
            <Skeleton variant="text" className="flex-1 h-4" />
            <Skeleton variant="text" className="w-8 h-4" />
            <Skeleton variant="text" className="w-8 h-4" />
            <Skeleton variant="text" className="w-8 h-4" />
            <Skeleton variant="text" className="w-8 h-4" />
            <Skeleton variant="text" className="w-12 h-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonCommunityPost() {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 h-4" />
          <Skeleton variant="text" className="w-24 h-3 mt-1" />
        </div>
      </div>
      <Skeleton variant="text" className="w-3/4 h-4" />
      <Skeleton variant="text" className="w-1/2 h-4" />
      <div className="flex items-center gap-4 pt-2">
        <Skeleton variant="text" className="w-16 h-4" />
        <Skeleton variant="text" className="w-16 h-4" />
      </div>
    </div>
  )
}

export function SkeletonTournamentBracket() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 justify-center">
      {[...Array(3)].map((_, round) => (
        <div key={round} className="flex-1 min-w-[200px] max-w-[300px]">
          <Skeleton variant="text" className="w-32 h-5 mx-auto mb-4" />
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, match) => (
              <Skeleton key={match} variant="card" className="h-24" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}