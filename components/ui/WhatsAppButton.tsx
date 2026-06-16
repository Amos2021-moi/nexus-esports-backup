"use client"

import { MessageCircle } from "lucide-react"

interface WhatsAppButtonProps {
  opponentWhatsApp: string | null
  opponentWhatsAppVisible: boolean | null
  opponentName: string
  fixtureId: string
  seasonName?: string
  deadline?: string
  homePlayer?: string
  awayPlayer?: string
}

export default function WhatsAppButton({
  opponentWhatsApp,
  opponentWhatsAppVisible,
  opponentName,
  fixtureId,
  seasonName,
  deadline,
  homePlayer,
  awayPlayer,
}: WhatsAppButtonProps) {
  // Check if opponent has WhatsApp and allows visibility
  if (!opponentWhatsApp || !opponentWhatsAppVisible) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-gray-400 text-sm">
          <MessageCircle size={16} />
          <span>Opponent hasn't set WhatsApp</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ask them to update their profile with contact info
        </p>
      </div>
    )
  }

  // Clean WhatsApp number (remove spaces, ensure format)
  let cleanNumber = opponentWhatsApp.replace(/\s/g, "")
  if (!cleanNumber.startsWith("+")) {
    cleanNumber = "+" + cleanNumber
  }

  // Create match details message
  const season = seasonName || "Current Season"
  const matchDeadline = deadline ? new Date(deadline).toLocaleDateString() : "Season end"
  
  const message = `Hello! 👋

I'm your opponent for the Nexus Esports match:

🏆 Match: ${homePlayer || "Player 1"} vs ${awayPlayer || "Player 2"}
📅 Season: ${season}
⏰ Deadline: ${matchDeadline}
🆔 Match ID: ${fixtureId}

Let's coordinate a time to play our match.

What time works for you?

After playing, remember to submit the result on the Nexus Esports platform.

Thanks and good luck! 🎮`

  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`

  return (
    <div className="text-center">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all transform hover:scale-105"
      >
        <MessageCircle size={18} />
        <span>Chat on WhatsApp</span>
      </a>
      <p className="text-xs text-gray-500 mt-1">
        Click to message {opponentName} directly
      </p>
    </div>
  )
}