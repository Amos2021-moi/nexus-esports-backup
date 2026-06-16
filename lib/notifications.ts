import { prisma } from "./prisma"

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  link?: string
) {
  await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link: link || null,
      read: false
    }
  })
}

export async function notifyTournamentMatchReady(matchId: string) {
  const match = await prisma.tournamentMatch.findUnique({
    where: { id: matchId },
    include: {
      homePlayer: true,
      awayPlayer: true,
      tournament: true
    }
  })
  
  if (match?.homePlayerId) {
    await createNotification(
      match.homePlayerId,
      `🎮 Tournament Match Ready!`,
      `Your match in ${match.tournament.name} is now available. Submit your result.`,
      "TOURNAMENT_MATCH",
      `/tournaments/matches/${match.id}/submit`
    )
  }
  
  if (match?.awayPlayerId) {
    await createNotification(
      match.awayPlayerId,
      `🎮 Tournament Match Ready!`,
      `Your match in ${match.tournament.name} is now available. Submit your result.`,
      "TOURNAMENT_MATCH",
      `/tournaments/matches/${match.id}/submit`
    )
  }
}

export async function notifyMatchResultApproved(matchId: string) {
  const match = await prisma.tournamentMatch.findUnique({
    where: { id: matchId },
    include: {
      winner: true,
      tournament: true
    }
  })
  
  if (match?.winner) {
    await createNotification(
      match.winnerId!,
      `🏆 Victory!`,
      `You won your match in ${match.tournament.name}! ${match.winner.profile?.username || match.winner.name} advances to the next round.`,
      "TOURNAMENT_WIN",
      `/tournaments/${match.tournamentId}`
    )
  }
}