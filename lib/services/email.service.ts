import { prisma } from "@/lib/prisma"
import nodemailer from 'nodemailer'

export class EmailService {
  private isDevelopment: boolean
  private fromEmail: string

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production'
    this.fromEmail = process.env.EMAIL_FROM || 'amosmark2332@gmail.com'
  }

  // 📧 Send email using Gmail SMTP
  async sendEmail({ to, subject, html, text }: {
    to: string
    subject: string
    html: string
    text?: string
  }) {
    // If no SMTP config, fallback to logging
    if (!process.env.EMAIL_HOST) {
      console.log('⚠️ EMAIL_HOST not found. Email not sent.')
      console.log('📧 EMAIL (FALLBACK)')
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`HTML: ${html.substring(0, 200)}...`)
      console.log('---')
      return { success: false, message: 'Email not sent (no SMTP config)' }
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      const info = await transporter.sendMail({
        from: this.fromEmail,
        to: to,
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, ''),
      })

      console.log(`✅ Email sent! ID: ${info.messageId}`)
      return { success: true, message: 'Email sent', id: info.messageId }

    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return { success: false, message: 'Failed to send email' }
    }
  }

  // ✅ Verification Email
  async sendVerificationEmail(email: string, name: string, token: string) {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
    
    return this.sendEmail({
      to: email,
      subject: '🔐 Verify Your Email - Nexus Esports',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; padding: 40px; border-radius: 16px; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px;">
              <span style="font-size: 28px;">🏆</span>
            </div>
            <h1 style="color: #fff; font-size: 24px; margin-top: 16px;">Nexus Esports</h1>
            <p style="color: #94a3b8; font-size: 14px;">Premier eFootball League</p>
          </div>
          
          <h2 style="color: #fff; font-size: 20px; margin-bottom: 16px;">Welcome to Nexus Esports, ${name}! 🎮</h2>
          
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Please verify your email address to start receiving match notifications, tournament updates, and important announcements.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
              Verify Email
            </a>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 24px;">
            This link expires in 24 hours.
          </p>
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            If you didn't create an account, you can ignore this email.
          </p>
          
          <div style="border-top: 1px solid #1e293b; margin-top: 32px; padding-top: 24px; text-align: center;">
            <p style="color: #475569; font-size: 12px;">
              Nexus Esports League • School eFootball Platform
            </p>
          </div>
        </div>
      `,
      text: `Welcome to Nexus Esports, ${name}!\n\nPlease verify your email address: ${verifyUrl}\n\nThis link expires in 24 hours.`
    })
  }

  // 🔑 Password Reset Email
  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    
    return this.sendEmail({
      to: email,
      subject: '🔑 Reset Your Password - Nexus Esports',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; padding: 40px; border-radius: 16px; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px;">
              <span style="font-size: 28px;">🔑</span>
            </div>
            <h1 style="color: #fff; font-size: 24px; margin-top: 16px;">Reset Your Password</h1>
          </div>
          
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            Hi ${name},
          </p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 24px;">
            This link expires in 1 hour.
          </p>
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            If you didn't request this, you can ignore this email.
          </p>
          
          <div style="border-top: 1px solid #1e293b; margin-top: 32px; padding-top: 24px; text-align: center;">
            <p style="color: #475569; font-size: 12px;">
              Nexus Esports League • School eFootball Platform
            </p>
          </div>
        </div>
      `,
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`
    })
  }

  // ⚽ Match Reminder Email
  async sendMatchReminder(email: string, name: string, match: any) {
    const opponent = match.homePlayerId === match.userId ? match.awayPlayer?.name || "Opponent" : match.homePlayer?.name || "Opponent"
    const homeOrAway = match.homePlayerId === match.userId ? '🏠 Home' : '✈️ Away'
    const matchDate = new Date(match.scheduledDate).toLocaleString()
    
    return this.sendEmail({
      to: email,
      subject: '⚽ Match Reminder - Nexus Esports',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; padding: 40px; border-radius: 16px; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px;">
              <span style="font-size: 28px;">⚽</span>
            </div>
            <h1 style="color: #fff; font-size: 24px; margin-top: 16px;">Match Reminder</h1>
          </div>
          
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            Hi ${name},
          </p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            You have a match tomorrow!
          </p>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <p style="color: #fff; margin: 8px 0;"><strong>Opponent:</strong> ${opponent}</p>
            <p style="color: #fff; margin: 8px 0;"><strong>Venue:</strong> ${homeOrAway}</p>
            <p style="color: #fff; margin: 8px 0;"><strong>Date:</strong> ${matchDate}</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/fixtures" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              View Match Details
            </a>
          </div>
          
          <div style="border-top: 1px solid #1e293b; margin-top: 32px; padding-top: 24px; text-align: center;">
            <p style="color: #475569; font-size: 12px;">
              Nexus Esports League • School eFootball Platform
            </p>
          </div>
        </div>
      `,
      text: `Match Reminder!\n\nOpponent: ${opponent}\nVenue: ${homeOrAway}\nDate: ${matchDate}\n\nView: ${process.env.NEXTAUTH_URL}/dashboard/fixtures`
    })
  }

  // 🏆 Result Approved Email
  async sendResultApprovedEmail(email: string, name: string, result: any) {
    return this.sendEmail({
      to: email,
      subject: '✅ Result Approved - Nexus Esports',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; padding: 40px; border-radius: 16px; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 16px;">
              <span style="font-size: 28px;">✅</span>
            </div>
            <h1 style="color: #fff; font-size: 24px; margin-top: 16px;">Result Approved</h1>
          </div>
          
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            Hi ${name},
          </p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Your match result has been approved!
          </p>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
            <p style="color: #fff; font-size: 28px; margin: 8px 0;">
              ${result.homeScore} - ${result.awayScore}
            </p>
            <p style="color: #94a3b8; font-size: 14px; margin: 8px 0;">
              Status: ${result.approved ? '✅ Approved' : '⏳ Pending'}
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/fixtures" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              View Match
            </a>
          </div>
          
          <div style="border-top: 1px solid #1e293b; margin-top: 32px; padding-top: 24px; text-align: center;">
            <p style="color: #475569; font-size: 12px;">
              Nexus Esports League • School eFootball Platform
            </p>
          </div>
        </div>
      `,
      text: `Result Approved!\n\nScore: ${result.homeScore} - ${result.awayScore}\nStatus: ${result.approved ? '✅ Approved' : '⏳ Pending'}`
    })
  }

  // 📧 Send match reminder to both players
  async sendMatchReminderToPlayers(match: any) {
    const homePlayer = await prisma.user.findUnique({
      where: { id: match.homePlayerId }
    })
    const awayPlayer = await prisma.user.findUnique({
      where: { id: match.awayPlayerId }
    })

    const results = []

    // @ts-ignore - These fields exist after migration
    if (homePlayer?.emailVerified && homePlayer?.emailNotificationsEnabled) {
      const result = await this.sendMatchReminder(homePlayer.email, homePlayer.name || "Player", {
        ...match,
        userId: homePlayer.id,
        homePlayerId: match.homePlayerId,
        awayPlayerId: match.awayPlayerId,
        awayPlayer: awayPlayer
      })
      results.push(result)
    }

    // @ts-ignore - These fields exist after migration
    if (awayPlayer?.emailVerified && awayPlayer?.emailNotificationsEnabled) {
      const result = await this.sendMatchReminder(awayPlayer.email, awayPlayer.name || "Player", {
        ...match,
        userId: awayPlayer.id,
        homePlayerId: match.homePlayerId,
        awayPlayerId: match.awayPlayerId,
        homePlayer: homePlayer
      })
      results.push(result)
    }

    return results
  }

  // ✅ Add this method to get match reminder time from settings
async getMatchReminderTime(userId: string): Promise<number> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/settings?category=competition&key=matchReminderTime`)
    // For server-side, we need to query directly
    const setting = await prisma.setting.findFirst({
      where: {
        userId,
        category: "competition",
        key: "matchReminderTime"
      }
    })
    
    if (setting) {
      const value = JSON.parse(setting.value)
      // Convert to minutes
      switch (value) {
        case "15m": return 15
        case "30m": return 30
        case "1h": return 60
        case "2h": return 120
        case "24h": return 1440
        default: return 60
      }
    }
    return 60 // Default: 1 hour
  } catch (error) {
    console.error("Error getting match reminder time:", error)
    return 60
  }
}

// ✅ Update sendMatchReminder to use the user's preference
async sendMatchReminderWithPreference(match: any) {
  const homePlayer = await prisma.user.findUnique({
    where: { id: match.homePlayerId }
  })
  const awayPlayer = await prisma.user.findUnique({
    where: { id: match.awayPlayerId }
  })

  const results = []

  // Get reminder times
  const homeReminderTime = await this.getMatchReminderTime(match.homePlayerId)
  const awayReminderTime = await this.getMatchReminderTime(match.awayPlayerId)

  // Send to home player
  // @ts-ignore - These fields exist after migration
  if (homePlayer?.isVerified && homePlayer?.emailNotificationsEnabled) {
    // Check if it's time to send based on their preference
    const matchTime = new Date(match.scheduledDate).getTime()
    const now = Date.now()
    const hoursUntilMatch = (matchTime - now) / (1000 * 60 * 60)
    
    // Send reminder based on their preference (in minutes)
    if (hoursUntilMatch * 60 <= homeReminderTime) {
      const result = await this.sendMatchReminder(homePlayer.email, homePlayer.name || "Player", {
        ...match,
        userId: homePlayer.id,
        awayPlayer: awayPlayer
      })
      results.push(result)
    }
  }

  // Send to away player
  // @ts-ignore - These fields exist after migration
  if (awayPlayer?.isVerified && awayPlayer?.emailNotificationsEnabled) {
    const matchTime = new Date(match.scheduledDate).getTime()
    const now = Date.now()
    const hoursUntilMatch = (matchTime - now) / (1000 * 60 * 60)
    
    if (hoursUntilMatch * 60 <= awayReminderTime) {
      const result = await this.sendMatchReminder(awayPlayer.email, awayPlayer.name || "Player", {
        ...match,
        userId: awayPlayer.id,
        homePlayer: homePlayer
      })
      results.push(result)
    }
  }

  return results
}
}

export const emailService = new EmailService()