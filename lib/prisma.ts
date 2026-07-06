import { PrismaClient } from '@prisma/client'
import { eventService } from './services/event.service'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ✅ Prisma 5 doesn't need datasourceUrl - it reads from schema
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// ✅ Prisma Middleware for automatic events
prisma.$use(async (params, next) => {
  const result = await next(params)

  // 🔥 Season Created
  if (params.model === 'Season' && params.action === 'create') {
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

  // 🔥 Fixtures Generated (batch create)
  if (params.model === 'Fixture' && params.action === 'createMany') {
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

  // 🔥 Result Approved + Standings Update
  if (params.model === 'Result' && params.action === 'update') {
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
            homePlayer: result.fixture.homePlayer.profile?.username || result.fixture.homePlayer.name || 'Home',
            awayPlayer: result.fixture.awayPlayer.profile?.username || result.fixture.awayPlayer.name || 'Away',
            homeScore: result.homeScore,
            awayScore: result.awayScore,
          })

          // ✅ Send updated standings
          const standings = await prisma.leagueEntry.findMany({
            where: { seasonId: result.fixture.seasonId },
            include: {
              player: {
                include: { profile: true },
              },
            },
            orderBy: [
              { points: 'desc' },
              { goalDifference: 'desc' },
              { goalsFor: 'desc' },
            ],
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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma