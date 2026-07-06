import { NextResponse } from "next/server";
import { eventService } from "@/lib/services/event.service";

export async function GET() {
  try {
    // Test all events
    const events = [
      {
        event: "season.created",
        data: {
          name: "Test Season",
          startDate: "2026-07-01",
          endDate: "2026-07-31",
        },
      },
      {
        event: "fixtures.generated",
        data: {
          seasonName: "Test Season",
          count: 6,
          playersCount: 3,
        },
      },
      {
        event: "result.approved",
        data: {
          homePlayer: "Mark Amos",
          awayPlayer: "Brian Ochieng",
          homeScore: 3,
          awayScore: 2,
        },
      },
      {
        event: "standings.updated",
        data: {
          seasonName: "Test Season",
          standings: [
            {
              player: { profile: { username: "Mark Amos" }, name: "Mark Amos" },
              played: 5,
              wins: 4,
              draws: 1,
              losses: 0,
              points: 13,
              goalsFor: 12,
              goalsAgainst: 3,
            },
            {
              player: { profile: { username: "Brian Ochieng" }, name: "Brian Ochieng" },
              played: 5,
              wins: 3,
              draws: 1,
              losses: 1,
              points: 10,
              goalsFor: 8,
              goalsAgainst: 5,
            },
            {
              player: { profile: { username: "Kevin Odhiambo" }, name: "Kevin Odhiambo" },
              played: 5,
              wins: 2,
              draws: 2,
              losses: 1,
              points: 8,
              goalsFor: 6,
              goalsAgainst: 4,
            },
          ],
        },
      },
    ];

    const results = [];
    for (const test of events) {
      const result = await eventService.emit(test.event as any, test.data);
      results.push({ event: test.event, success: result.success });
    }

    return NextResponse.json({
      success: true,
      message: "Test events sent! Check your WhatsApp group.",
      results,
    });
  } catch (error) {
    console.error("Test event error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}