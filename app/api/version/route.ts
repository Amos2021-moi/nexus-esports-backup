import { NextResponse } from "next/server";
import { getCurrentVersion, getVersionStats } from "@/lib/version";

export async function GET() {
  try {
    const version = getCurrentVersion();

    return NextResponse.json({
      success: true,
      version: {
        current: version.full,
        version: version.version,
        build: version.build,
        hash: version.hash,
        environment: version.environment,
        date: version.date,
        major: version.major,
        minor: version.minor,
        patch: version.patch,
      },
    });

  } catch (error) {
    console.error("Error fetching version:", error);
    return NextResponse.json(
      { error: "Failed to fetch version" },
      { status: 500 }
    );
  }
}