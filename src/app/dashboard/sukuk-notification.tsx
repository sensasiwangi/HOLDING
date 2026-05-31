"use client";

import { useState } from "react";
import {
  Bell, Send, Mail, MessageSquare, Clock, CheckCircle,
  AlertTriangle, Settings, Zap, Users, DollarSign, ShieldCheck,
  Plus, Trash2, Edit3, Eye,
} from "lucide-react";

type NotificationChannel = "telegram" | "email" | "in_app";
type NotificationEvent =
  | "investor_registered"
  | "kyc_approved"
  | "kyc_rejected"
  | "payment_received"
  | "bagi_hasil_due"
  | "milestone_reached"
  | "milestone_100"
  | "sukuk_closed"
  | "audit_alert";
type NotificationStatus = "pending" | "sent" | "failed" | "read";

interface NotificationRule {
  id: string;
  event: NotificationEvent;
  label: string;
  channels: NotificationChannel[];
  enabled: boolean;
  template: string;
}

interface NotificationLog {
  id: string;
  timestamp: string;
  event: NotificationEvent;
  channel: NotificationChannel;
  recipient: string;
  status: NotificationStatus;
  message: string;
}

const EVENT_LABELS: Record<NotificationEvent, string> = {
  investor_registered: "Investor Baru Mendaftar",
  kyc_approved: "KYC Disetujui",
  kyc_rejected: "KYC Ditolak",
  payment_received: "Pembayaran Diterima",
  bagi_hasil_due: "Jatuh Tempo Bagi Hasil",
  milestone_reached: "Milestone Tercapai",
  milestone_100: "100% Fully Subscribed",
  sukuk_closed: "Sukuk Ditutup",
  audit_alert: "Alert Audit",
};

const CHANNEL_CONFIG: Record<NotificationChannel, { label: string; icon: React.ReactNode; color: string }> = {
  telegram: { label: "Telegram", icon: <MessageSquare size={14} />, color: "text-blue-600" },
  email: { label: "Email", icon: <Mail size={14} />, color: "text-red-600" },
  in_app: { label: "In-App", icon: <Bell size={14} />, color: "text-purple-600" },
};

const DEFAULT_RULES: NotificationRule[] = [
  {
    id: "1",
    event: "investor_registered",
    label: "Investor Baru Mendaftar",
    channels: ["telegram", "in_app"],
    enabled: true,
    template: "🆕 Investor baru: {{nama}} — {{unit}} unit ({{nominal}}). Total terkumpul: {{total}} ({{pct}}%)",
  },
  {
    id: "2",
    event: "kyc_approved",
    label: "KYC Disetujui",
    channels: ["telegram", "email"],
    enabled: true,
    template: "✅ KYC dari {{nama}} telah disetujui. Investor aktif: {{total_aktif}} orang.",
  },
  {
    id: "3",
    event: "payment_received",
    label: "Pembayaran Diterima",
    channels: ["telegram", "in_app"],
    enabled: true,
    template: "💰 Pembayaran {{nominal}} dari {{nama}} diterima. Total: {{total}} ({{pct}}%)",
  },
  {
    id: "4",
    event: "bagi_hasil_due",
    label: "Jatuh Tempo Bagi Hasil",
    channels: ["telegram", "email", "in_app"],
    enabled: true,
    template: "📅 Jatuh tempo bulan {{bulan}}: Total bagi hasil {{total_bagi_hasil}}. Investor: {{total_investor}} orang.",
  },
  {
    id: "5",
    event: "milestone_reached",
    label: "Milestone Tercapai",
    channels: ["telegram", "in_app"],
    enabled: true,
    template: "🎯 Milestone {{milestone}} tercapai! Total terkumpul: {{total}} ({{pct}}%)",
  },
  {
    id: "6",
    event: "milestone_100",
    label: "100% Fully Subscribed",
    channels: ["telegram", "email", "in_app"],
    enabled: true,
    template: "🎉 SUKUK 100% SUBSCRIBED! Seluruh {{total_unit}} unit terjual. Total: {{total}}. Siap penandatanganan akad!",
  },
  {
    id: "7",
    event: "sukuk_closed",
    label: "Sukuk Ditutup",
    channels: ["telegram", "email", "in_app"],
    enabled: true,
    template: "🔒 Penawaran sukuk ditutup. Total pendanaan: {{total}} dari {{total_investor}} investor.",
  },
];

// Simulated notification logs
const SAMPLE_LOGS: NotificationLog[] = [
  { id: "1", timestamp: "2026-05-28 14:30:00", event: "investor_registered", channel: "telegram", recipient: "@beriman_juliano", status: "sent", message: "🆕 Investor baru: PT ABC Corp — 100 unit (Rp 100jt). Total terkumpul: Rp 100jt (10.0%)" },
  { id: "2", timestamp: "2026-05-28 14:30:01", event: "investor_registered", channel: "in_app", recipient: "Dashboard", status: "sent", message: "🆕 Investor baru: PT ABC Corp — 100 unit (Rp 100jt)" },
  { id: "3", timestamp: "2026-05-27 09:15:00", event: "kyc_approved", channel: "telegram", recipient: "@beriman_juliano", status: "sent", message: "✅ KYC dari Budi Santoso telah disetujui. Investor aktif: 2 orang." },
  { id: "4", timestamp: "2026-05-26 16:00:00", event: "bagi_hasil_due", channel: "email", recipient: "sensasiwangi.id@gmail.com", status: "failed", message: "⚠️ Email gagal terkirim ke sensasiwangi.id@gmail.com" },
  { id: "5", timestamp: "2026-05-25 10:00:00", event: "payment_received", channel: "telegram", recipient: "@beriman_juliano", status: "sent", message: "💰 Pembayaran Rp 50.000.000 dari Andi Pratama diterima." },
];

export default function SukukNotificationPanel({ investorData }: { investorData?: string[][] | null }) {
  const [activeTab, setActiveTab] = useState<"rules" | "logs" | "settings">("rules");
  const [rules, setRules] = useState<NotificationRule[]>(DEFAULT_RULES);
  const [logs] = useState<NotificationLog[]>(SAMPLE_LOGS);
  const [showAddRule, setShowAddRule] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [telegramChatId, setTelegramChatId] = useState("1499368727");
  const [emailRecipient, setEmailRecipient] = useState("sensasiwangi.id@gmail.com");

  const toggleRuleChannel = (ruleId: string, channel: NotificationChannel) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const has = r.channels.includes(channel);
      return { ...r, channels: has ? r.channels.filter(c => c !== channel) : [...r.channels, channel] };
    }));
  };

  const toggleRuleEnabled = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const sendTestNotification = (rule: NotificationRule) => {
    alert(`Test notifikasi "${rule.label}" akan dikirim ke:\n${rule.channels.map(c => `- ${CHANNEL_CONFIG[c].label}`).join("\n")}\n\nTemplate: ${rule.template.substring(0, 100)}...`);
  };

  const sentCount = logs.filter(l => l.status === "sent").length;
  const failedCount = logs.filter(l => l.status === "failed").length;
  const enabledRules = rules.filter(r => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">
            🔔 Notification Center
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Multi-channel notification system — Telegram, Email, In-App
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted)]">{enabledRules} rule aktif</span>
          <button className="p-2 rounded-lg border border-[var(--line)] hover:border-[var(--brand)] transition relative">
            <Bell size={16} className="text-[var(--muted)]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">3</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-green-200 rounded-xl bg-green-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-600" />
            <span className="text-xs text-green-700 font-bold">Terkirim</span>
          </div>
          <div className="text-2xl font-extrabold text-green-700">{sentCount}</div>
          <div className="text-[10px] text-green-600">notifikasi sukses</div>
        </div>
        <div className="border border-red-200 rounded-xl bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-600" />
            <span className="text-xs text-red-700 font-bold">Gagal</span>
          </div>
          <div className="text-2xl font-extrabold text-red-700">{failedCount}</div>
          <div className="text-[10px] text-red-600">perlu retry</div>
        </div>
        <div className="border border-blue-200 rounded-xl bg-blue-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-blue-600" />
            <span className="text-xs text-blue-700 font-bold">Rule Aktif</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-700">{enabledRules}/{rules.length}</div>
          <div className="text-[10px] text-blue-600">event terdaftar</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={14} className="text-[var(--muted)]" />
            <span className="text-xs text-[var(--muted)] font-bold">Channel</span>
          </div>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Telegram</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded">Email</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded">In-App</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--soft)] rounded-xl p-1">
        {[
          { key: "rules" as const, label: "Rules", icon: <Settings size={13} /> },
          { key: "logs" as const, label: "Log", icon: <Clock size={13} /> },
          { key: "settings" as const, label: "Settings", icon: <Zap size={13} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === tab.key ? "bg-white shadow-sm text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <div className="space-y-3">
          {rules.map(rule => {
            const config = PHASE_CONFIG as Record<string, { label: string; color: string }>;
            return (
              <div key={rule.id} className={`border rounded-xl bg-white overflow-hidden transition ${
                rule.enabled ? "border-[var(--line)]" : "border-gray-200 opacity-60"
              }`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => toggleRuleEnabled(rule.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      rule.enabled ? "bg-[var(--brand)] border-[var(--brand)]" : "border-gray-300"
                    }`}
                  >
                    {rule.enabled && <CheckCircle size={12} className="text-white" />}
                  </button>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[var(--ink)]">{rule.label}</div>
                    <div className="flex gap-1 mt-1">
                      {(["telegram", "email", "in_app"] as NotificationChannel[]).map(ch => {
                        const chCfg = CHANNEL_CONFIG[ch];
                        const active = rule.channels.includes(ch);
                        return (
                          <button
                            key={ch}
                            onClick={() => toggleRuleChannel(rule.id, ch)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                              active ? `${chCfg.color} border-current bg-current/10` : "border-gray-200 text-gray-400"
                            }`}
                          >
                            {chCfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => sendTestNotification(rule)}
                      className="p-1.5 rounded-lg hover:bg-[var(--soft)] transition"
                      title="Kirim test"
                    >
                      <Send size={13} className="text-[var(--muted)]" />
                    </button>
                    <button
                      onClick={() => setEditingRule(editingRule === rule.id ? null : rule.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--soft)] transition"
                      title="Edit"
                    >
                      <Edit3 size={13} className="text-[var(--muted)]" />
                    </button>
                  </div>
                </div>

                {/* Template Preview */}
                {editingRule === rule.id && (
                  <div className="border-t border-[var(--line)] px-4 py-3 bg-[var(--soft)]">
                    <div className="text-[10px] font-bold text-[var(--muted)] mb-1">Template Pesan:</div>
                    <div className="text-xs text-[var(--ink)] bg-white border border-[var(--line)] rounded-lg p-3 font-mono">
                      {rule.template}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] mt-2">
                      Variables: {"{{nama}}"}, {"{{unit}}"}, {"{{nominal}}"}, {"{{total}}"}, {"{{pct}}%"}, {"{{bulan}}"}, {"{{milestone}}"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="border border-[var(--line)] rounded-xl bg-white overflow-hidden">
          <div className="bg-[var(--soft)] px-5 py-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--ink)]">Notification Log</h3>
            <span className="text-[10px] text-[var(--muted)]">{logs.length} entries</span>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {logs.map(log => {
              const chCfg = CHANNEL_CONFIG[log.channel];
              return (
                <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${
                    log.status === "sent" ? "bg-green-50" : "bg-red-50"
                  }`}>
                    {log.status === "sent" ? (
                      <CheckCircle size={12} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={12} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${chCfg.color}`}>{chCfg.label}</span>
                      <span className="text-[10px] text-[var(--muted)]">→</span>
                      <span className="text-[10px] text-[var(--ink)]">{log.recipient}</span>
                    </div>
                    <div className="text-xs text-[var(--ink)] mt-0.5 truncate">{log.message}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[var(--muted)]">{log.timestamp.split(" ")[1]}</div>
                    <div className="text-[10px] text-[var(--muted)]">{log.timestamp.split(" ")[0]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="border border-[var(--line)] rounded-xl bg-white p-5 space-y-4">
          <h3 className="font-bold text-sm text-[var(--ink)]">Channel Configuration</h3>

          <div className="space-y-4">
            {/* Telegram */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-blue-800">Telegram Bot</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Connected</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-blue-700">Chat ID</label>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={e => setTelegramChatId(e.target.value)}
                    className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-xs mt-1 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-700">Bot Token</label>
                  <input
                    type="password"
                    className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-xs mt-1 bg-white"
                    value="••••••••••••••••"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <Mail size={16} className="text-red-600" />
                <span className="text-sm font-bold text-red-800">Email (SMTP)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">Setup Required</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-red-700">Recipient Email</label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={e => setEmailRecipient(e.target.value)}
                    className="w-full border border-red-200 rounded-lg px-3 py-1.5 text-xs mt-1 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-red-700">SMTP Server</label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com:587"
                    className="w-full border border-red-200 rounded-lg px-3 py-1.5 text-xs mt-1 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Webhook */}
            <div className="border border-[var(--line)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-[var(--brand)]" />
                <span className="text-sm font-bold text-[var(--ink)]">Webhook / API</span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Kirim notifikasi ke sistem eksternal via POST request. Berguna untuk integrasi dengan OJK reporting atau DSN-MUI monitoring.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://api.example.com/webhook/sukuk"
                  className="flex-1 border border-[var(--line)] rounded-lg px-3 py-1.5 text-xs"
                />
                <button className="px-3 py-1.5 rounded-lg bg-[var(--brand)] text-white text-xs font-bold">Save</button>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="border-t border-[var(--line)] pt-4 mt-4">
            <h4 className="text-xs font-bold text-[var(--ink)] mb-2">Scheduled Notifications</h4>
            <div className="space-y-2">
              {[
                { name: "Reminder Bagi Hasil Bulanan", schedule: "Setiap tgl 1, 09:00 WIB", enabled: true },
                { name: "Laporan Mingguan", schedule: "Setiap Senin, 08:00 WIB", enabled: true },
                { name: "Audit Trail Report", schedule: "Setiap tgl 1 & 15, 10:00 WIB", enabled: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-[var(--soft)] rounded-lg">
                  <div>
                    <div className="text-xs font-medium text-[var(--ink)]">{item.name}</div>
                    <div className="text-[10px] text-[var(--muted)]">{item.schedule}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                  }`}>
                    {item.enabled ? "Aktif" : "Off"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="border border-orange-200 rounded-xl bg-orange-50 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-800 space-y-1">
            <p><strong>Privasi Notifikasi:</strong> Pastikan bot Telegram dan email terenkripsi. Jangan kirim data sensitif (KTP, NPWP, rekening) via notifikasi — hanya summary.</p>
            <p><strong>File-based queue:</strong> Notifikasi yang gagal akan di-retry maksimal 3 kali dengan backoff exponential (1 menit, 5 menit, 15 menit).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for the rules tab
const PHASE_CONFIG: Record<string, { label: string; color: string }> = {};
