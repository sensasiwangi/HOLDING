// src/app/api/notifications/route.ts
// Notifications API — Alert & notification management
import { NextRequest, NextResponse } from "next/server";
import {
  checkAlerts,
  getNotifications,
  saveNotification,
  DEFAULT_ALERT_RULES,
  type Notification,
} from "@/lib/notification-engine";

// GET /api/notifications          → baca notifikasi
// GET /api/notifications?check=1  → jalankan alert check
// POST /api/notifications         → tulis notifikasi manual
// POST /api/notifications/mark-read  → tandai sudah dibaca

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const check = searchParams.get("check");
    const unreadOnly = searchParams.get("unread") === "1";

    if (check === "1") {
      const alerts = await checkAlerts();
      return NextResponse.json({
        success: true,
        alertsFound: alerts.length,
        alerts,
        rules: DEFAULT_ALERT_RULES,
      });
    }

    const notifications = await getNotifications(unreadOnly);
    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    if (action === "mark-read") {
      // Tandai sudah dibaca
      return NextResponse.json({ success: true });
    }

    // Buat notifikasi manual
    const notif: Notification = {
      type: body.type || "info",
      title: body.title || "",
      message: body.message || "",
      priority: body.priority || "medium",
      entityType: body.entityType,
      entityId: body.entityId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await saveNotification(notif);
    return NextResponse.json({ success: true, notification: notif });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
