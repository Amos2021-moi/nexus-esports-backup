import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push/send";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId = session.user.id } = body;

    const result = await sendPushToUser(userId, {
      title: "🧪 Test Push Notification",
      body: "Your push notifications are working!",
      icon: "/icons/icon-192.png",
      data: {
        url: "/dashboard",
        type: "TEST",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Sent to ${result.sent} devices, ${result.failed} failed`,
      result,
    });
  } catch (error) {
    console.error("Error sending test push:", error);
    return NextResponse.json(
      { error: "Failed to send test push" },
      { status: 500 }
    );
  }
}