// src/components/AuditPanel.tsx
// Audit Trail Dashboard — Log aktivitas & chain integrity
"use client";

import { useState, useEffect } from "react";

interface AuditEntry {
  action: string;
  actor: string;
  entityType: string;
  entityId?: number;
  description: string;
  hash: string;
  prevHash?: string;
  createdAt: string;
}

interface ChainResult {
  isValid: boolean;
  totalEntries: number;
  brokenAt?: number;
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  view: "bg-gray-100 text-gray-600",
  login: "bg-purple-100 text-purple-700",
  logout: "bg-gray-100 text-gray-600",
  approve: "bg-green-100 text-green-700",
  reject: "bg-red-100 text-red-700",
  pay: "bg-emerald-100 text-emerald-700",
};

export default function AuditPanel() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [chainResult, setChainResult] = useState<ChainResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ actor: "", entityType: "", action: "" });

  useEffect(() => {
    fetchTrail();
    verifyChain();
  }, []);

  async function fetchTrail() {
    try {
      const params = new URLSearchParams();
      if (filter.actor) params.set("actor", filter.actor);
      if (filter.entityType) params.set("entityType", filter.entityType);
      if (filter.action) params.set("action", filter.action);

      const res = await fetch(`/api/audit?${params}`);
      const data = await res.json();
      if (data.success) setEntries(data.entries);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function verifyChain() {
    try {
      const res = await fetch("/api/audit?type=verify");
      const data = await res.json();
      if (data.success) setChainResult(data);
    } catch { /* ignore */ }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-2 border-tosca border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-[var(--ink)]">Audit Trail</h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">Log semua aktivitas — immutable & verifiable</p>
      </div>

      {/* Chain Status */}
      {chainResult && (
        <div className={`border rounded-xl p-4 ${
          chainResult.isValid
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{chainResult.isValid ? "🔒" : "⚠️"}</span>
            <div>
              <div className={`font-bold ${chainResult.isValid ? "text-green-700" : "text-red-700"}`}>
                {chainResult.isValid ? "Chain Integrity Verified" : "Chain Broken!"}
              </div>
              <div className="text-xs text-gray-600">
                {chainResult.totalEntries} entries {chainResult.brokenAt ? `| Broken at entry #${chainResult.brokenAt}` : "| All hashes match"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Filter actor..."
          value={filter.actor}
          onChange={(e) => setFilter((f) => ({ ...f, actor: e.target.value }))}
          className="border border-[var(--line)] rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-tosca focus:outline-none"
        />
        <select
          value={filter.entityType}
          onChange={(e) => setFilter((f) => ({ ...f, entityType: e.target.value }))}
          className="border border-[var(--line)] rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-tosca focus:outline-none"
        >
          <option value="">Semua Entity</option>
          <option value="investor">Investor</option>
          <option value="sukuk">Sukuk</option>
          <option value="transaksi">Transaksi</option>
          <option value="rab">RAB</option>
          <option value="kyc">KYC</option>
          <option value="user">User</option>
        </select>
        <select
          value={filter.action}
          onChange={(e) => setFilter((f) => ({ ...f, action: e.target.value }))}
          className="border border-[var(--line)] rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-tosca focus:outline-none"
        >
          <option value="">Semua Action</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="approve">Approve</option>
        </select>
        <button
          onClick={fetchTrail}
          className="px-3 py-1.5 bg-tosca text-white rounded-lg text-xs font-medium"
        >
          Filter
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="border border-[var(--line)] rounded-xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500">
                <th className="py-2 px-3 text-left">Waktu</th>
                <th className="py-2 px-3 text-left">Action</th>
                <th className="py-2 px-3 text-left">Actor</th>
                <th className="py-2 px-3 text-left">Entity</th>
                <th className="py-2 px-3 text-left">Deskripsi</th>
                <th className="py-2 px-3 text-left">Hash</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada audit log</td></tr>
              ) : (
                entries.slice(0, 50).map((entry, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ACTION_COLORS[entry.action] || "bg-gray-100 text-gray-600"}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium">{entry.actor}</td>
                    <td className="py-2 px-3">
                      <span className="text-xs">{entry.entityType}</span>
                      {entry.entityId && <span className="text-xs text-gray-400">#{entry.entityId}</span>}
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-600 max-w-xs truncate">{entry.description}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-gray-400">{entry.hash?.slice(0, 12)}...</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
        <p className="font-bold mb-1">Tentang Audit Trail</p>
        <ul className="space-y-1">
          <li>• Setiap aktivitas dicatat dengan SHA-256 hash</li>
          <li>• Hash di-chain: setiap entry menyimpan hash sebelumnya</li>
          <li>• Jika ada data yang diubah, chain akan terdeteksi broken</li>
          <li>• Immutable: data yang sudah dicatat tidak bisa diubah tanpa meninggalkan jejak</li>
        </ul>
      </div>
    </div>
  );
}
