import webpush from "web-push";
import { PushSubscription, getAllSubscriptions, getUserSubscriptions, removeSubscription } from "./subscription";

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:nexusesportshub@gmail.com",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// ✅ Send to a single user
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await getUserSubscriptions(userId);
  return sendPushToSubscriptions(subscriptions, payload);
}

// ✅ Send to all users
export async function sendPushToAll(
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await getAllSubscriptions();
  return sendPushToSubscriptions(subscriptions, payload);
}

// ✅ Send to specific subscriptions
async function sendPushToSubscriptions(
  subscriptions: PushSubscription[],
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/icon-192.png",
    data: payload.data || {},
    actions: payload.actions || [
      {
        action: "view",
        title: "View",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  });

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.keys.auth,
            p256dh: subscription.keys.p256dh,
          },
        },
        pushPayload
      );
      sent++;
    } catch (error: any) {
      // If subscription expired, remove it
      if (error.statusCode === 410 || error.statusCode === 404) {
        await removeSubscription(subscription.endpoint);
        console.log(`🗑️ Removed expired subscription: ${subscription.endpoint}`);
      } else {
        console.error(`❌ Failed to send push:`, error);
      }
      failed++;
    }
  }

  return { sent, failed };
}

// ✅ Send a specific notification type
export async function sendMatchReminderPush(
  userId: string,
  match: {
    homePlayer: string;
    awayPlayer: string;
    scheduledDate: string;
  }
): Promise<{ sent: number; failed: number }> {
  return sendPushToUser(userId, {
    title: "⚽ Match Reminder",
    body: `You have a match tomorrow: ${match.homePlayer} vs ${match.awayPlayer}`,
    icon: "/icons/icon-192.png",
    data: {
      url: "/dashboard/fixtures",
      type: "MATCH_REMINDER",
    },
    actions: [
      {
        action: "view",
        title: "View Match",
      },
    ],
  });
}

export async function sendResultPush(
  userId: string,
  result: {
    homePlayer: string;
    awayPlayer: string;
    homeScore: number;
    awayScore: number;
    status: "approved" | "rejected";
  }
): Promise<{ sent: number; failed: number }> {
  const isApproved = result.status === "approved";
  const emoji = isApproved ? "✅" : "❌";

  return sendPushToUser(userId, {
    title: `${emoji} Result ${isApproved ? "Approved" : "Rejected"}`,
    body: `${result.homePlayer} ${result.homeScore} - ${result.awayScore} ${result.awayPlayer}`,
    icon: "/icons/icon-192.png",
    data: {
      url: "/dashboard/fixtures",
      type: "RESULT_UPDATE",
    },
    actions: [
      {
        action: "view",
        title: "View Details",
      },
    ],
  });
}