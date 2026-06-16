import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  try {
    const { fixtureId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { proposedTime, message } = await request.json()

    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homePlayer: { include: { profile: true } },
        awayPlayer: { include: { profile: true } }
      }
    })

    if (!fixture) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 })
    }

    const isHome = fixture.homePlayerId === session.user.id
    const opponent = isHome ? fixture.awayPlayer : fixture.homePlayer
    const opponentWhatsApp = opponent.profile?.whatsappNumber
    const opponentWhatsAppVisible = opponent.profile?.whatsappVisible

    if (!opponentWhatsApp || !opponentWhatsAppVisible) {
      return NextResponse.json({ error: "Opponent hasn't set WhatsApp" }, { status: 400 })
    }

    // Clean WhatsApp number
    let cleanNumber = opponentWhatsApp.replace(/\s/g, "")
    if (!cleanNumber.startsWith("+")) {
      cleanNumber = "+" + cleanNumber
    }

    const homeName = fixture.homePlayer.profile?.username || fixture.homePlayer.name
    const awayName = fixture.awayPlayer.profile?.username || fixture.awayPlayer.name
    const proposerName = session.user.name || "Player"

    const whatsappMessage = `🎮 *Match Time Suggestion* 🎮

${proposerName} proposed a time for your match:

🏆 *Match:* ${homeName} vs ${awayName}
📅 *Proposed Date:* ${new Date(proposedTime).toLocaleDateString()}
🕐 *Proposed Time:* ${new Date(proposedTime).toLocaleTimeString()}

💬 *Message:* ${message || "Let me know if this works for you!"}

Reply to confirm or suggest another time.

After playing, remember to submit the result on the Nexus Esports platform!`

  const encodedMessage = encodeURIComponent(whatsappMessage)
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`

  return NextResponse.json({ whatsappUrl })
  } catch (error) {
    console.error("Error suggesting time:", error)
    return NextResponse.json({ error: "Failed to suggest time" }, { status: 500 })
  }
}