import { NextResponse } from "next/server";
import { sendWhatsAppEvent } from "@/lib/services/whatsapp.service";

export async function GET() {
  try {
    console.log("🧪 Test endpoint called");
    
    const result = await sendWhatsAppEvent("test", {
      message: "Test from Nexus Service! 🚀"
    });

    return NextResponse.json({
      success: result,
      message: result ? "WhatsApp message sent!" : "Failed to send"
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}