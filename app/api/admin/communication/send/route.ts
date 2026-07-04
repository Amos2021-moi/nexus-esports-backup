import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/services/email.service";
import { smartNotificationService } from "@/lib/services/smartNotification.service";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { channel, recipients, subject, message } = body;

    // Validate input
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    if (!channel || !["EMAIL", "IN_APP", "BOTH"].includes(channel)) {
      return NextResponse.json(
        { error: "Invalid channel. Must be EMAIL, IN_APP, or BOTH" },
        { status: 400 }
      );
    }

    // Determine recipient type
    const recipientType = recipients === "all" ? "ALL" : "SPECIFIC";
    const recipientIds = recipients === "all" ? [] : recipients;

    // Get the list of users to send to
    let users: any[] = [];
    if (recipients === "all") {
      users = await prisma.user.findMany({
        where: {
          role: "PLAYER",
        },
        include: {
          profile: true,
        },
      });
    } else if (Array.isArray(recipients) && recipients.length > 0) {
      users = await prisma.user.findMany({
        where: {
          id: { in: recipients },
          role: "PLAYER",
        },
        include: {
          profile: true,
        },
      });
    } else {
      return NextResponse.json(
        { error: "No recipients selected" },
        { status: 400 }
      );
    }

    // Create communication log
    const log = await prisma.communicationLog.create({
      data: {
        adminId: session.user.id,
        subject,
        message,
        channel,
        recipientType,
        recipientIds: recipientIds,
        recipientCount: users.length,
        status: "PENDING",
        metadata: {
          channel,
          totalRecipients: users.length,
        },
      },
    });

    // Send messages based on channel
    const results = {
      email: { sent: 0, failed: 0, skipped: 0 },
      inApp: { sent: 0, failed: 0, skipped: 0 },
    };

    const sendEmail = channel === "EMAIL" || channel === "BOTH";
    const sendInApp = channel === "IN_APP" || channel === "BOTH";

    for (const user of users) {
      const receiptData = {
        logId: log.id,
        userId: user.id,
      };

      // Send Email
      if (sendEmail) {
        try {
          if (user.emailNotificationsEnabled && user.emailVerified) {
            const emailResult = await emailService.sendNotification(
              user.email,
              subject,
              message,
              "HIGH"
            );

            if (emailResult.success) {
              results.email.sent++;
              await prisma.communicationReceipt.create({
                data: {
                  ...receiptData,
                  channel: "EMAIL",
                  status: "SENT",
                },
              });
            } else {
              results.email.failed++;
              await prisma.communicationReceipt.create({
                data: {
                  ...receiptData,
                  channel: "EMAIL",
                  status: "FAILED",
                  error: emailResult.error || "Email send failed",
                },
              });
            }
          } else {
            results.email.skipped++;
            await prisma.communicationReceipt.create({
              data: {
                ...receiptData,
                channel: "EMAIL",
                status: "FAILED",
                error: user.emailNotificationsEnabled
                  ? "Email not verified"
                  : "Email notifications disabled",
              },
            });
          }
        } catch (error: any) {
          results.email.failed++;
          await prisma.communicationReceipt.create({
            data: {
              ...receiptData,
              channel: "EMAIL",
              status: "FAILED",
              error: error.message || "Email send error",
            },
          });
        }
      }

      // Send In-App Notification
      if (sendInApp) {
        try {
          const notification = await smartNotificationService.createNotification(
            user.id,
            "ADMIN_ALERT",
            subject,
            message,
            { adminId: session.user.id },
            null,
            "IN_APP"
          );

          if (notification) {
            results.inApp.sent++;
            await prisma.communicationReceipt.create({
              data: {
                ...receiptData,
                channel: "IN_APP",
                status: "DELIVERED",
              },
            });
          } else {
            results.inApp.failed++;
            await prisma.communicationReceipt.create({
              data: {
                ...receiptData,
                channel: "IN_APP",
                status: "FAILED",
                error: "Failed to create notification",
              },
            });
          }
        } catch (error: any) {
          results.inApp.failed++;
          await prisma.communicationReceipt.create({
            data: {
              ...receiptData,
              channel: "IN_APP",
              status: "FAILED",
              error: error.message || "Notification creation failed",
            },
          });
        }
      }
    }

    // Update log status
    const totalSends =
      (sendEmail ? results.email.sent + results.email.failed + results.email.skipped : 0) +
      (sendInApp ? results.inApp.sent + results.inApp.failed + results.inApp.skipped : 0);

    let logStatus = "SENT";
    if (totalSends > 0) {
      const totalFailures =
        (sendEmail ? results.email.failed : 0) +
        (sendInApp ? results.inApp.failed : 0);
      if (totalFailures === totalSends) {
        logStatus = "FAILED";
      } else if (totalFailures > 0) {
        logStatus = "PARTIAL";
      }
    }

    await prisma.communicationLog.update({
      where: { id: log.id },
      data: {
        status: logStatus,
        deliveredAt: new Date(),
        metadata: {
          ...((log.metadata as Record<string, any>) || {}),
          results,
        },
      },
    });

    return NextResponse.json({
      success: true,
      logId: log.id,
      message: `Message sent to ${users.length} players`,
      stats: {
        totalRecipients: users.length,
        email: results.email,
        inApp: results.inApp,
      },
    });

  } catch (error) {
    console.error("Error sending communication:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}