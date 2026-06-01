// src/components/NotificationPanel.tsx
// Notification Dashboard — Alert & notification management
"use client";

import { useState, useEffect } from "react";

interface Notif {
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 border-red-300 text-red-800",
  high: "bg-orange-100 border-orange-300 text-orange-800",
  medium: "bg-blue-100 border-blue-300 text-blue-800",
  low: "bg-gray-100 border-gray-300 text-gray-600",
};

const TYPE_ICONS: Record<string, string> = {
  stok_menipis: "📦", stok_habis: "🚫", jatuh_tempo: "⏰",
  target_tercapai: "🎯", produksi_selesii: "✅", pemasukan_besar: "💰",
  pengeluaran_besar: "💸", saldo_rendah: "⚠️", rab_overrun: "📊",
  kyc_pending: "👤", bagi_hasil: "🤝",
};

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [checking, setChecking] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch { /* ignore */ }
  }

  async function runCheck() {
    setChecking(true);
    try {
      const res = await fetch("/api/notifications?check=1");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.alerts.map((a: any) => ({ ...a, isRead: false })));
      }
    } catch { /* ignore */ }
    setChecking(false);
  }

  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">Notifikasi & Alert</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Monitoring stok, jatuh tempo, target, dan saldo</p>
        </div>
        <button
          onClick={runCheck}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 bg-tosca text-white rounded-lg text-sm font-medium hover:bg-tosca/80 disabled:opacity-50"
        >
          {checking ? "Checking..." : "🔍 Check Alerts"}
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: "all", label: `Semua (${notifications.length})` },
          { key: "unread", label: `Belum Dibaca (${notifications.filter((n) => !n.isRead).length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === f.key ? "bg-tosca text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Urgent", count: notifications.filter((n) => n.priority === "urgent").length, color: "bg-red-50 text-red-700 border-red-200" },
          { label: "High", count: notifications.filter((n) => n.priority === "high").length, color: "bg-orange-50 text-orange-700 border-orange-200" },
          { label: "Medium", count: notifications.filter((n) => n.priority === "medium").length, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Low", count: notifications.filter((n) => n.priority === "low").length, color: "bg-gray-50 text-gray-600 border-gray-200" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-lg p-3 text-center ${s.color}`}>
            <div className="text-2xl font-extrabold">{s.count}</div>
            <div className="text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🔔</div>
            <p>Tidak ada notifikasi</p>
          </div>
        ) : (
          filtered.map((notif, i) => (
            <div
              key={i}
              className={`border rounded-lg p-4 transition ${
                notif.isRead ? "bg-white border-gray-200 opacity-60" : PRIORITY_COLORS[notif.priority] || "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{TYPE_ICONS[notif.type] || "📌"}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{notif.title}</span>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  </div>
                  <p className="text-xs mt-1 opacity-80">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] opacity-60">
                    <span>{notif.type.replace(/_/g, " ")}</span>
                    <span>•</span>
                    <span>{new Date(notif.createdAt).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Rules */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h4 className="font-bold text-[var(--ink)] mb-3">Alert Rules</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {[
            { rule: "Stok menipis", threshold: "stok ≤ min stok" },
            { rule: "Stok habis", threshold: "stok = 0" },
            { rule: "Jatuh tempo", threshold: "≤ 3 hari" },
            { rule: "Target tercapai", threshold: "≥ 100%" },
            { rule: "Saldo rendah", threshold: "≤ Rp 5jt" },
            { rule: "RAB overrun", threshold: "≥ 90% anggaran" },
          ].map((r, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2">
              <div className="font-medium text-gray-700">{r.rule}</div>
              <div className="text-gray-500">{r.threshold}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
