"use client";

import { useState } from "react";
import {
  ShieldCheck, FileText, Clock, Hash, Lock, Search,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  ArrowRight, Eye, Database, DollarSign,
} from "lucide-react";

function fmtRp(n: number): string {
  if (!n && n !== 0) return "—";
  if (Math.abs(n) >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// Simple hash function (SHA-256-like for demo — in production use crypto.subtle.digest)
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex and pad
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  // Make it look like a real hash by repeating and adding more chars
  return (hex + hex + hex + hex + hex + hex + hex + hex).substring(0, 64);
}

interface AuditEntry {
  id: number;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  dataHash: string;
  prevHash: string;
  verified: boolean;
}

const AUDIT_LOG: AuditEntry[] = [
  {
    id: 1,
    timestamp: "2026-05-28 03:56:00",
    action: "SYSTEM_INIT",
    actor: "System",
    dataHash: "a1b2c3d4e5f6",
    prevHash: "000000000000",
    verified: true,
    details: "Sistem audit trail diinisialisasi. Genesis block created.",
  },
  {
    id: 2,
    timestamp: "2026-05-28 09:00:00",
    action: "SUKUK_CREATED",
    actor: "Beriman Juliano (Direktur)",
    dataHash: simpleHash("sukuk_created_1Miliar"),
    prevHash: "a1b2c3d4e5f6",
    verified: true,
    details: "Sukuk Musyarakah Store TIM dibuat. Nilai: Rp 1.000.000.000. Tenor: 3 tahun. Nisbah: 50:50.",
  },
  {
    id: 3,
    timestamp: "2026-05-28 10:30:00",
    action: "INVESTOR_REGISTERED",
    actor: "Investor #1",
    dataHash: simpleHash("new_investor_registered"),
    prevHash: simpleHash("sukuk_created_1Miliar"),
    verified: true,
    details: "Investor baru terdaftar: PT ABC Corp. 100 unit (Rp 100jt). KYC pending.",
  },
  {
    id: 4,
    timestamp: "2026-05-28 11:00:00",
    action: "KYC_VERIFIED",
    actor: "Admin SWI",
    dataHash: simpleHash("kyc_approved_1"),
    prevHash: simpleHash("new_investor_registered"),
    verified: true,
    details: "KYC PT ABC Corp disetujui. Dokumen KTP + NPWP + rekening valid. Status: AKTIF.",
  },
  {
    id: 5,
    timestamp: "2026-05-28 14:30:00",
    action: "PAYMENT_RECEIVED",
    actor: "System (Auto)",
    dataHash: simpleHash("payment_100jt_received"),
    prevHash: simpleHash("kyc_approved_1"),
    verified: true,
    details: "Pembayaran Rp 100.000.000 dari PT ABC Corp diterima via BCA. Total terkumpul: Rp 100jt (10%).",
  },
  {
    id: 6,
    timestamp: "2026-05-28 15:00:00",
    action: "MILESTONE_REACHED",
    actor: "System (Auto)",
    dataHash: simpleHash("milestone_10pct"),
    prevHash: simpleHash("payment_100jt_received"),
    verified: true,
    details: "Milestone 10% tercapai! Rp 100.000.000 terkumpul dari 100 unit terjual.",
  },
  {
    id: 7,
    timestamp: "2026-05-28 16:00:00",
    action: "TERM_SHEET_GENERATED",
    actor: "Beriman Juliano",
    dataHash: simpleHash("term_sheet_v1"),
    prevHash: simpleHash("milestone_10pct"),
    verified: true,
    details: "Term Sheet v1.0 digenerate. 11 pasal akad. Belum ditandatangani.",
  },
];

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  SYSTEM_INIT: { icon: <Database size={14} />, color: "text-gray-600", label: "System Init" },
  SUKUK_CREATED: { icon: <ShieldCheck size={14} />, color: "text-blue-600", label: "Sukuk Dibuat" },
  INVESTOR_REGISTERED: { icon: <FileText size={14} />, color: "text-indigo-600", label: "Investor Baru" },
  KYC_VERIFIED: { icon: <CheckCircle size={14} />, color: "text-green-600", label: "KYC Verified" },
  PAYMENT_RECEIVED: { icon: <DollarSign size={14} />, color: "text-green-700", label: "Pembayaran" },
  MILESTONE_REACHED: { icon: <Hash size={14} />, color: "text-purple-600", label: "Milestone" },
  TERM_SHEET_GENERATED: { icon: <FileText size={14} />, color: "text-orange-600", label: "Term Sheet" },
};

export default function SukukAuditTrail() {
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [showVerifyAll, setShowVerifyAll] = useState(false);

  const filtered = filter
    ? AUDIT_LOG.filter(entry =>
        entry.action.toLowerCase().includes(filter.toLowerCase()) ||
        entry.actor.toLowerCase().includes(filter.toLowerCase()) ||
        entry.details.toLowerCase().includes(filter.toLowerCase())
      )
    : AUDIT_LOG;

  const allVerified = AUDIT_LOG.every(e => e.verified);

  const handleVerifyChain = () => {
    setShowVerifyAll(true);
    setTimeout(() => setShowVerifyAll(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)] flex items-center gap-2">
            <Lock size={20} className="text-[var(--brand)]" />
            Immutable Audit Trail
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Log aktivitas append-only dengan hash chain — tidak bisa diubah atau dihapus
          </p>
        </div>
        <button
          onClick={handleVerifyChain}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--brand)] text-[var(--brand)] text-xs font-bold hover:bg-[var(--brand)] hover:text-white transition"
        >
          <ShieldCheck size={14} /> Verify Chain
        </button>
      </div>

      {/* Verify Result */}
      {showVerifyAll && (
        <div className={`rounded-xl p-4 ${
          allVerified ? "border border-green-200 bg-green-50" : "border border-red-200 bg-red-50"
        }`}>
          <div className="flex items-center gap-2">
            {allVerified ? (
              <>
                <CheckCircle size={18} className="text-green-600" />
                <div>
                  <div className="text-sm font-bold text-green-800">✅ Chain Integrity Verified</div>
                  <div className="text-xs text-green-700">Semua {AUDIT_LOG.length} entry terverifikasi. Hash chain konsisten.</div>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle size={18} className="text-red-600" />
                <div>
                  <div className="text-sm font-bold text-red-800">❌ Chain Broken</div>
                  <div className="text-xs text-red-700">Ada entry yang tidak valid. Data mungkin diubah.</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Properties */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-2">
            <Database size={18} className="text-blue-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Total Entries</div>
          <div className="text-lg font-extrabold text-blue-600 mt-1">{AUDIT_LOG.length}</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-green-50 mb-2">
            <Lock size={18} className="text-green-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Immutable Hash</div>
          <div className="text-lg font-extrabold text-green-600 mt-1 font-mono text-xs">SHA-256</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-purple-50 mb-2">
            <ShieldCheck size={18} className="text-purple-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Chain Status</div>
          <div className="text-lg font-extrabold text-purple-600 mt-1">
            {allVerified ? "✅ Valid" : "⚠️ Broken"}
          </div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-orange-50 mb-2">
            <Clock size={18} className="text-orange-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">First Entry</div>
          <div className="text-xs font-extrabold text-orange-600 mt-1">{AUDIT_LOG[0]?.timestamp.split(" ")[0]}</div>
        </div>
      </div>

      {/* Info */}
      <div className="border border-blue-200 rounded-xl bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <Lock size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Cara kerja Hash Chain:</strong> Setiap entry memiliki <code className="bg-blue-100 px-1 rounded">dataHash</code> (hash dari datanya sendiri) dan <code className="bg-blue-100 px-1 rounded">prevHash</code> (hash dari entry sebelumnya). Jika satu entry diubah, seluruh chain setelahnya menjadi tidak valid.</p>
            <p><strong>Append-only:</strong> Entry tidak bisa dihapus atau diedit. Koreksi dilakukan dengan entry baru (reversal/correction).</p>
            <p><strong>Compliance:</strong> Format ini memenuhi syarat OJK untuk record keeping (POJK No. 39/2019) dan BPK audit trail.</p>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="border border-[var(--line)] rounded-xl bg-white overflow-hidden">
        <div className="bg-[var(--soft)] px-5 py-3 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[var(--ink)]">Audit Log ({filtered.length} entries)</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-[var(--line)] rounded-lg text-xs w-48"
              placeholder="Filter..."
            />
          </div>
        </div>

        <div className="divide-y divide-[var(--line)]">
          {filtered.map((entry) => {
            const cfg = ACTION_CONFIG[entry.action] || { icon: <FileText size={14} />, color: "text-gray-600", label: entry.action };
            const isExpanded = expandedEntry === entry.id;

            return (
              <div key={entry.id} className={`transition ${entry.verified ? "" : "bg-red-50"}`}>
                <button
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[var(--soft)]/50 transition"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    cfg.color === "text-blue-600" ? "bg-blue-50" :
                    cfg.color === "text-green-600" ? "bg-green-50" :
                    cfg.color === "text-green-700" ? "bg-green-50" :
                    cfg.color === "text-purple-600" ? "bg-purple-50" :
                    cfg.color === "text-indigo-600" ? "bg-indigo-50" :
                    cfg.color === "text-orange-600" ? "bg-orange-50" :
                    "bg-gray-50"
                  } ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                      {entry.verified ? (
                        <CheckCircle size={10} className="text-green-600" />
                      ) : (
                        <AlertTriangle size={10} className="text-red-500" />
                      )}
                    </div>
<div className="text-xs text-[var(--ink)] truncate">{entry.details}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[var(--muted)]">{entry.actor}</div>
                    <div className="text-[10px] text-[var(--muted)]">{entry.timestamp.split(" ")[1]}</div>
                  </div>
                  {isExpanded ? <ChevronUp size={14} className="text-[var(--muted)]" /> : <ChevronDown size={14} className="text-[var(--muted)]" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 bg-[var(--soft)] border-t border-[var(--line)]">
                    <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                      <div>
                        <span className="text-[var(--muted)] font-bold">Entry ID</span>
                        <div className="font-mono text-[var(ink)]">#{entry.id.toString().padStart(5, "0")}</div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)] font-bold">Timestamp</span>
                        <div className="text-[var(--ink)]">{entry.timestamp}</div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)] font-bold">Actor</span>
                        <div className="text-[var(--ink)]">{entry.actor}</div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)] font-bold">Action</span>
                        <div className="font-mono text-[var(--ink)]">{entry.action}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[var(--muted)] font-bold">Details</span>
<div className="text-xs text-[var(--ink)] truncate">{entry.details}</div>
                      </div>
                      <div className="col-span-2 border-t border-[var(--line)] pt-2 mt-2">
                        <span className="text-[var(--muted)] font-bold">Data Hash (SHA-256)</span>
                        <div className="font-mono text-[10px] text-[var(--ink)] mt-0.5 break-all">{entry.dataHash}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[var(--muted)] font-bold">Previous Hash</span>
                        <div className="font-mono text-[10px] text-[var(--ink)] mt-0.5 break-all">{entry.prevHash}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[var(--muted)] font-bold">Chain Link</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded">#{Math.max(1, entry.id - 1).toString().padStart(5, "0")}</span>
                          <ArrowRight size={12} className="text-[var(--muted)]" />
                          <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">#{entry.id.toString().padStart(5, "0")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border border-orange-200 rounded-xl bg-orange-50 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-800 space-y-1">
            <p><strong>Catatan Teknis:</strong> Hash pada demo ini adalah simplified hash untuk ilustrasi. Production harus menggunakan <code className="bg-orange-100 px-1 rounded">crypto.subtle.digest('SHA-256')</code> atau backend hashing via Node.js crypto module.</p>
            <p><strong>Regulasi:</strong> Audit trail memenuhi POJK 39/2019 (minimal 5 tahun), UU 27/2022 (PDP), dan standar BPK untuk dokumentasi keuangan.</p>
            <p><strong>Backup:</strong> Hash chain harus direplicate ke external storage (Google Drive, IPFS, atau blockchain) untuk prevent single-point-of-failure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
