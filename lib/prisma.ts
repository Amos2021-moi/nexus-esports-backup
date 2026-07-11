import { PrismaClient } from '@prisma/client'
import { eventService } from './services/event.service'

// ============================================ //
// ✅ CONNECTION POOLING & CACHING              //
// ============================================ //

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ✅ Prisma 5 doesn't need datasourceUrl - it reads from schema
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // ✅ Enable query logging in development
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

// ============================================ //
// ✅ PERFORMANCE: Query Caching Middleware     //
// ============================================ //

// ✅ Cache for expensive queries (5 minutes TTL)
const queryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// ============================================ //
// ✅ MIDDLEWARE: Events & Performance          //
// ============================================ //

prisma.$use(async (params, next) => {
  const startTime = performance.now()
  const model = params.model
  const action = params.action
  
  // ✅ Generate cache key for read operations
  const cacheKey = model && action && ['findMany', 'findUnique', 'findFirst'].includes(action)
    ? `${model}-${action}-${JSON.stringify(params.args)}`
    : null

  // ✅ Check cache for read operations
  if (cacheKey && process.env.NODE_ENV === 'production') {
    const cached = queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ Cache HIT: ${model}.${action}`)
      return cached.data
    }
  }

  // ✅ Execute query
  const result = await next(params)

  // ✅ Cache read results
  if (cacheKey && process.env.NODE_ENV === 'production') {
    queryCache.set(cacheKey, { data: result, timestamp: Date.now() })
    // ✅ Prevent memory leaks - limit cache size
    if (queryCache.size > 100) {
      const oldestKey = Array.from(queryCache.keys())[0]
      queryCache.delete(oldestKey)
    }
  }

  // ✅ Log slow queries (> 100ms)
  const duration = performance.now() - startTime
  if (duration > 100) {
    console.warn(`🐌 Slow query: ${model}.${action} took ${duration.toFixed(0)}ms`)
  }

  // ============================================ //
  // ✅ EVENT MIDDLEWARE (Optimized)              //
  // ============================================ //

  // 🔥 Season Created
  if (model === 'Season' && action === 'create') {
    try {
      await eventService.emit('season.created', {
        name: result.name,
        startDate: result.startDate.toISOString().split('T')[0],
        endDate: result.endDate.toISOString().split('T')[0],
      })
    } catch (error) {
      console.error('❌ Event error:', error)
    }
  }

  // 🔥 Fixtures Generated (batch create) - Optimized
  if (model === 'Fixture' && action === 'createMany') {
    try {
      const count = params.args.data?.length || 0
      const firstFixture = params.args.data?.[0]
      if (firstFixture?.seasonId) {
        const season = await prisma.season.findUnique({
          where: { id: firstFixture.seasonId },
          select: { name: true },
        })
        if (season) {
          await eventService.emit('fixtures.generated', {
            seasonName: season.name,
            count: count,
          })
        }
      }
    } catch (error) {
      console.error('❌ Event error:', error)
    }
  }

  // 🔥 Result Approved + Standings Update - Optimized
  if (model === 'Result' && action === 'update') {
    if (params.args.data?.approved === true) {
      try {
        const result = await prisma.result.findUnique({
          where: { id: params.args.where.id },
          include: {
            fixture: {
              include: {
                season: true,
                homePlayer: { include: { profile: true } },
                awayPlayer: { include: { profile: true } },
              },
            },
          },
        })

        if (result?.fixture) {
          // ✅ Send result notification
          await eventService.emit('result.approved', {
            homePlayer: result.fixture.homePlayer.profile?.username || 
                        result.fixture.homePlayer.name || 'Home',
            awayPlayer: result.fixture.awayPlayer.profile?.username || 
                        result.fixture.awayPlayer.name || 'Away',
            homeScore: result.homeScore,
            awayScore: result.awayScore,
          })

          // ✅ Send updated standings - Optimized with SELECT
          const standings = await prisma.leagueEntry.findMany({
            where: { seasonId: result.fixture.seasonId },
            select: {
              id: true,
              points: true,
              goalDifference: true,
              goalsFor: true,
              goalsAgainst: true,
              played: true,
              wins: true,
              draws: true,
              losses: true,
              player: {
                select: {
                  id: true,
                  name: true,
                  profile: {
                    select: {
                      username: true,
                      profilePicture: true,
                    },
                  },
                },
              },
            },
            orderBy: [
              { points: 'desc' },
              { goalDifference: 'desc' },
              { goalsFor: 'desc' },
            ],
            take: 50, // ✅ Limit for performance
          })

          if (standings.length > 0) {
            await eventService.emit('standings.updated', {
              seasonName: result.fixture.season.name,
              standings: standings,
            })
          }
        }
      } catch (error) {
        console.error('❌ Event error:', error)
      }
    }
  }

  return result
})

// ============================================ //
// ✅ CLEANUP: Clear cache periodically         //
// ============================================ //

if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of queryCache) {
      if (now - value.timestamp > CACHE_TTL) {
        queryCache.delete(key)
      }
    }
  }, CACHE_TTL)
}

// ============================================ //
// ✅ DEV ONLY: Global instance                 //
// ============================================ //

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// ============================================ //
// ✅ UTILITY: Clear cache on demand            //
// ============================================ //

export const clearQueryCache = () => {
  queryCache.clear()
  console.log('✅ Query cache cleared')
}

// ============================================ //
// ✅ UTILITY: Get cache stats                  //
// ============================================ //

export const getCacheStats = () => ({
  size: queryCache.size,
  keys: Array.from(queryCache.keys()),
})

export default prisma