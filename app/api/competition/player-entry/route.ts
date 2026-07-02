import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const activeSeason = await prisma.season.findFirst({
      where: { isActive: true },
      include: {
        leagueSettings: true,
        prizePool: true,
      },
    })

    if (!activeSeason) {
      return NextResponse.json({
        hasEntry: false,
        seasonId: null,
        seasonName: null,
        paymentRequired: false,
        entryFee: 0,
        hasPaid: false,
        status: "NO_ACTIVE_SEASON",
      })
    }

    const leagueEntry = await prisma.leagueEntry.findUnique({
      where: {
        seasonId_playerId: {
          seasonId: activeSeason.id,
          playerId: session.user.id,
        },
      },
    })

    if (!leagueEntry) {
      return NextResponse.json({
        hasEntry: false,
        seasonId: activeSeason.id,
        seasonName: activeSeason.name,
        paymentRequired: activeSeason.leagueSettings?.paymentRequired || false,
        entryFee: activeSeason.leagueSettings?.entryFee || 0,
        hasPaid: false,
        status: "NOT_REGISTERED",
      })
    }

    // ✅ Check player's payment status
    const playerEntry = await prisma.playerSeasonEntry.findUnique({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId: activeSeason.id,
        },
      },
    })

    // ✅ Check SeasonEntry for payment status
    const seasonEntry = await prisma.seasonEntry.findUnique({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId: activeSeason.id,
        },
      },
    })

    const paymentRequired = activeSeason.leagueSettings?.paymentRequired || false
    const entryFee = activeSeason.leagueSettings?.entryFee || activeSeason.prizePool?.entryFee || 0

    // ✅ Determine payment status
    let hasPaid = false
    let status = "NOT_ENROLLED"

    if (seasonEntry) {
      if (seasonEntry.status === "ACTIVE") {
        hasPaid = true
        status = "PAID"
      } else if (seasonEntry.status === "PAYMENT_PENDING") {
        hasPaid = false
        status = "PAYMENT_PENDING"
      } else {
        hasPaid = false
        status = "NOT_ENROLLED"
      }
    } else if (playerEntry?.hasPaid) {
      hasPaid = true
      status = "PAID"
    }

    return NextResponse.json({
      hasEntry: true,
      seasonId: activeSeason.id,
      seasonName: activeSeason.name,
      paymentRequired,
      entryFee,
      hasPaid,
      status,
      paymentReceipt: seasonEntry?.mpesaReceipt || playerEntry?.paymentReceipt || null,
      paidAt: seasonEntry?.paidAt || playerEntry?.paidAt || null,
      checkoutRequestId: seasonEntry?.checkoutRequestId || null,
    })
  } catch (error) {
    console.error("Error fetching player entry:", error)
    return NextResponse.json({
      hasEntry: false,
      seasonId: null,
      seasonName: null,
      paymentRequired: false,
      entryFee: 0,
      hasPaid: false,
      status: "ERROR",
    })
  }
}