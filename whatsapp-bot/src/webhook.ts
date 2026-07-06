// src/webhook.ts
import dotenv from "dotenv";
import path from "path";

// ✅ Force load .env from the root directory using absolute path
const envPath = path.resolve(__dirname, "../.env");
console.log(`📁 webhook loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

import { Request, Response } from "express";
import { sendToGroup } from "./index.js";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
console.log(`🔑 WEBHOOK_SECRET loaded in webhook: "${WEBHOOK_SECRET}"`);

export async function handleWebhook(req: Request, res: Response, sock: any) {
  try {
    // Verify secret
    const secret = req.headers["x-webhook-secret"];
    console.log(`🔍 Received secret: "${secret}"`);
    console.log(`🔑 Expected secret: "${WEBHOOK_SECRET}"`);

    if (secret !== WEBHOOK_SECRET) {
      console.log(`❌ Secret mismatch!`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { event, data } = req.body;

    console.log(`📨 Webhook received: ${event}`);

    let message = "";

    switch (event) {
      case "season.created":
        message = `📢 *New Season Started!*\n\n🏆 *${data.name}*\n📅 ${data.startDate} - ${data.endDate}\n\nGet ready to compete! 🚀`;
        break;

      case "fixtures.generated":
        message = `📅 *Fixtures Released!*\n\nSeason: *${data.seasonName}*\n📊 ${data.count} fixtures generated\n👥 ${data.playersCount || 'Multiple'} players competing\n\nCheck your fixtures now! 🏆`;
        break;

      case "result.approved":
        message = `🏆 *Match Result Approved!*\n\n${data.homePlayer} *${data.homeScore}* - *${data.awayScore}* ${data.awayPlayer}\n\nStandings updated! 📊`;
        break;

      case "payment.confirmed":
        message = `💰 *Payment Confirmed!*\n\n✅ ${data.player} has paid *KES ${data.amount}*\n\nPrize Pool: *KES ${data.prizePool}* 🏆`;
        break;

      case "tournament.created":
        message = `🏆 *New Tournament!*\n\n*${data.name}*\n📅 Starts: ${data.startDate}\n👥 Max Players: ${data.maxPlayers}\n\nRegister now! 🚀`;
        break;

      case "news.published":
        message = `📰 *${data.title}*\n\n${data.content.substring(0, 200)}${data.content.length > 200 ? "..." : ""}\n\nRead more at Nexus Esports! 📱`;
        break;

      case "award.earned":
        message = `🏅 *Award Earned!*\n\nCongratulations to *${data.player}* for winning *${data.awardName}*! 🎉\n\nWell deserved! 🏆`;
        break;

      case "maintenance.start":
        message = `⚠️ *Maintenance Notice*\n\nNexus Esports will undergo maintenance in *${data.minutes}* minutes.\n\nExpected duration: *${data.duration}* minutes.\n\nWe'll be back soon! 🔧`;
        break;

      case "season.champion":
        message = `🏆 *SEASON CHAMPION!*\n\nCongratulations to *${data.player}*! 🎉\n\nWinner of Season *${data.seasonName}*!\n\nHall of Fame entry confirmed! 🌟`;
        break;

      case "standings.updated":
        // ✅ Use the pre-formatted message from Nexus
        message = data.message || "📊 *Standings Updated*";
        break;

      case "test":
        message = `🧪 *Test Message*\n\n${data.message || "This is a test from Nexus!"}`;
        break;

      default:
        console.log(`⚠️ Unknown event: ${event}`);
        return res.status(200).json({ success: true, message: "Event ignored" });
    }

    if (message) {
      await sendToGroup(sock, message);
      console.log(`✅ Webhook message sent: ${event}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}