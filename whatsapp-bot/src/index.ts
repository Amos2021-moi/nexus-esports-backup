import dotenv from "dotenv";
import path from "path";

// ✅ Force load .env from the root directory
const envPath = path.resolve(__dirname, "../.env");
console.log(`📁 Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ Failed to load .env:", result.error);
} else {
  console.log("✅ .env loaded successfully");
}

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as QRCode from "qrcode-terminal";
import * as fs from "fs";
import express, { Request, Response } from "express";
import { handleWebhook } from "./webhook";

const SESSION_DIR = path.join(__dirname, "../sessions");
const GROUP_JID = process.env.WHATSAPP_GROUP_JID || "";
const PORT = parseInt(process.env.PORT || "3001");

console.log(`🔑 WEBHOOK_SECRET loaded: "${process.env.WEBHOOK_SECRET || "NOT FOUND"}"`);
console.log(`📱 GROUP_JID loaded: "${GROUP_JID}"`);

// Create session directory if it doesn't exist
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

// ✅ Connection state
let isReady = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectTimeout: NodeJS.Timeout | null = null;

// ✅ Export sendToGroup for webhook
export async function sendToGroup(sock: any, message: string, retries: number = 5) {
  console.log(`📤 sendToGroup called`);
  console.log(`📱 Target group JID: "${GROUP_JID}"`);
  console.log(`🔌 Socket connected: ${!!sock}`);
  console.log(`🔌 Socket user: ${sock?.user?.id || "Not logged in"}`);
  console.log(`🟢 Bot ready: ${isReady}`);

  if (!GROUP_JID) {
    console.log("⚠️ No group JID configured");
    return false;
  }

  // ✅ Wait for bot to be ready
  if (!isReady || !sock?.user) {
    console.log("⏳ Bot not ready, waiting...");
    let waited = 0;
    while (!isReady || !sock?.user) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      waited++;
      if (waited > 30) {
        console.log("❌ Bot not ready after 30 seconds");
        return false;
      }
      console.log(`⏳ Waiting for bot... ${waited}s`);
    }
    console.log(`🟢 Bot ready after ${waited}s`);
  }

  // ✅ Check if socket is still alive
  if (!sock?.user) {
    console.log("❌ Socket died, reconnecting...");
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`⏳ Attempt ${attempt}/${retries}: Sending message...`);
      
      const sendPromise = sock.sendMessage(GROUP_JID, { 
        text: message,
        ephemeralExpiration: 86400,
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Send timeout")), 10000);
      });
      
      const result = await Promise.race([sendPromise, timeoutPromise]);
      console.log(`✅ Message sent (attempt ${attempt})`);
      return true;
      
    } catch (error: any) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (error.message?.includes("Connection") || error.message?.includes("timeout")) {
        console.log("🔄 Connection issue, waiting for recovery...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          await sock.sendPresenceUpdate('available');
          console.log("✅ Presence updated, connection seems alive");
        } catch (e) {
          console.log("⚠️ Presence update failed, connection may be dead");
        }
      }
      
      if (attempt === retries) {
        console.error("❌ All attempts failed to send message");
        return false;
      }
      
      const waitTime = attempt * 3000;
      console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  return false;
}

function getMessageText(message: any): string {
  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    ""
  );
}

function getSenderName(msg: any): string {
  return msg.pushName || "User";
}

async function connectToWhatsApp() {
  console.log("🚀 Starting Nexus WhatsApp Bot...");
  console.log(`📁 Session directory: ${SESSION_DIR}`);
  console.log(`📱 Group JID: ${GROUP_JID || "Not configured"}`);

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  const sock = makeWASocket({
    version: [3, 0, 0],
    auth: state,
    printQRInTerminal: false,
    //logger: require("pino")({ level: "silent" }),
    browser: ["Nexus Esports Bot", "Chrome", "120.0.0.0"],
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 SCAN THIS QR CODE WITH WHATSAPP:");
      QRCode.generate(qr, { small: true });
      console.log("\n⏳ Waiting for WhatsApp connection...\n");
    }

    if (connection === "close") {
      isReady = false;
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`❌ Connection closed. Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        reconnectAttempts++;
        if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
          console.log(`⚠️ Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Exiting...`);
          process.exit(1);
        }
        console.log(`🔄 Reconnecting in 5s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => connectToWhatsApp(), 5000);
      } else {
        console.log("🔴 Logged out. Please restart the bot.");
      }
    }

    if (connection === "open") {
      reconnectAttempts = 0;
      isReady = true;
      console.log("\n✅ WhatsApp Bot Connected Successfully!");
      console.log(`📱 Phone: ${sock.user?.id || "Unknown"}`);
      console.log("🤖 Bot is ready\n");

      // ✅ Silent test
      try {
        await sock.sendPresenceUpdate('available');
        console.log("✅ Presence updated");
      } catch (error) {
        console.error("❌ Presence update failed:", error);
      }

      // ✅ Get groups
      try {
        const groups = await sock.groupFetchAllParticipating();
        console.log(`\n📋 Groups: ${Object.keys(groups).length}`);
        let found = false;
        for (const [jid, group] of Object.entries(groups)) {
          if (jid === GROUP_JID) {
            console.log(`✅ Target group FOUND: ${group.subject}`);
            found = true;
          }
        }
        if (!found) {
          console.log(`⚠️ Target group ${GROUP_JID} not found in bot's groups`);
        }
      } catch (error) {
        console.error("❌ Failed to fetch groups:", error);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ✅ Silent keep-alive - no visible messages
  setInterval(async () => {
    try {
      if (sock?.user) {
        await sock.sendPresenceUpdate('available');
      }
    } catch (error) {
      // Silent fail
    }
  }, 60000);

  // Start Express server
  const app = express();
  app.use(express.json());

  app.post("/webhook", (req: Request, res: Response) => {
    handleWebhook(req, res, sock);
  });

  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", connected: !!sock?.user, ready: isReady });
  });

  app.listen(PORT, () => {
    console.log(`🌐 Webhook server on port ${PORT}`);
  });

  return sock;
}

connectToWhatsApp().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});