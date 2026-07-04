import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const status = searchParams.get("status") || "";
    const channel = searchParams.get("channel") || "";

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (channel) where.channel = channel;

    // Fetch logs
    const [logs, total] = await Promise.all([
      prisma.communicationLog.findMany({
        where,
        include: {
          admin: {
            select: {
              name: true,
              email: true,
              profile: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: { sentAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.communicationLog.count({ where }),
    ]);

    // For each log, get receipt stats
    const logsWithStats = await Promise.all(
      logs.map(async (log: typeof logs[number]) => {
        const receipts = await prisma.communicationReceipt.groupBy({
          by: ["channel", "status"],
          where: { logId: log.id },
          _count: true,
        });

        const stats = {
          email: { sent: 0, delivered: 0, read: 0, failed: 0 },
          inApp: { sent: 0, delivered: 0, read: 0, failed: 0 },
        };

        receipts.forEach((r: { channel: string; status: string; _count: number }) => {
          const channelKey = r.channel.toLowerCase() as "email" | "inApp";
          if (r.status === "SENT") stats[channelKey].sent += r._count;
          else if (r.status === "DELIVERED") stats[channelKey].delivered += r._count;
          else if (r.status === "READ") stats[channelKey].read += r._count;
          else if (r.status === "FAILED") stats[channelKey].failed += r._count;
        });

        return {
          ...log,
          stats,
        };
      })
    );

    return NextResponse.json({
      logs: logsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching communication history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}