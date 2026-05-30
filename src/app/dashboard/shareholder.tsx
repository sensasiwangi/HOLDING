"use client";

import {
  Users, ArrowDownUp, ShieldCheck, AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

interface ShareholderRow {
  nama: string;
  saham: number;
  kewajiban: number;
  sudahSetor: number;
  sisa: number;
  pct: number;
}

interface ShareholderData {
  spreadsheetId: string;
  shareholders: ShareholderRow[];
  totalKewajiban: number;
  totalSetor: number;
  totalSisa: number;
  totalPct: number;
  rincianTanggal: { tanggal: string; nama: string; jumlah: number; keterangan: string }[];
  modalDasar: number;
  modalDitempatkan: number;
}

function fmtRp(n: number): string {
  if (!n && n !== 0) return "—";
  if (Math.abs(n) >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function safeNum(v: string | number | undefined): number {
  if (v === undefined || v === null || v === "") return 0;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export default function ShareholderPanel({ data }: { data?: string[][] | null }) {
  if (!data || data.length < 3) {
    return (
      <div className="text-center py-12">
        <Users size={36} className="mx-auto text-[var(--muted)] mb-3" />
        <p className="text-sm text-[var(--muted)]">Belum ada data pemegang saham</p>
      </div>
    );
  }

  // Parse from sheet rows:
  // Row 0: Title
  // Row 1: Subtitle
  // Row 2: Header (Pemegang Saham, Jabatan, Lembar Saham, Nominal/Saham, Kewajiban, Sudah Disetor, Sisa)
  // Row 3-5: 3 shareholders
  // Row 6: TOTAL
  // Row 7-8: percentage rows
  // Row 10+: Rincian setoran

  const rows = data;
  const shareholders: ShareholderRow[] = [];

  for (let i = 3; i <= 5; i++) {
    const r = rows[i];
    if (!r || !r[0] || r[0] === "TOTAL") continue;
    const kew = safeNum(r[4]);
    const setor = safeNum(r[5]);
    const sisa = r[6] && r[6].includes("=") ? kew - setor : safeNum(r[6]);
    shareholders.push({
      nama: r[0],
      saham: safeNum(r[2]),
      kewajiban: kew,
      sudahSetor: setor,
      sisa,
      pct: kew > 0 ? (setor / kew) * 100 : 0,
    });
  }

  // TOTAL row
  const totalRow = rows.find((r) => r[0] === "TOTAL");
  const totalKewajiban = totalRow ? safeNum(totalRow[4]) : shareholders.reduce((s, r) => s + r.kewajiban, 0);
  const totalSetor = totalRow ? safeNum(totalRow[5]) : shareholders.reduce((s, r) => s + r.sudahSetor, 0);
  const totalSisa = totalRow ? safeNum(totalRow[6]) : shareholders.reduce((s, r) => s + r.sisa, 0);
  const totalPct = totalKewajiban > 0 ? (totalSetor / totalKewajiban) * 100 : 0;

  // Modal info from subtitle row
  const subtitleRow = rows[1];
  const modalDitempatkan = 250000000;
  const modalDasar = 1000000000;

  // Rincian setoran (rows from index 12 onwards)
  const rincian: { tanggal: string; nama: string; jumlah: number; keterangan: string }[] = [];
  for (let i = 12; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;
    rincian.push({ tanggal: r[0], nama: r[1], jumlah: safeNum(r[2]), keterangan: r[3] || "" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">Pemegang Saham & Modal</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Data dari akta pendirian + rekap setoran modal
          </p>
        </div>
        <a
          href="https://docs.google.com/spreadsheets/d/1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA/edit"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--line)] text-xs font-bold hover:border-[var(--brand)] transition"
        >
          <FileSpreadsheet size={14} /> Google Sheets
        </a>
      </div>

      {/* Modal Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-2">
            <ShieldCheck size={18} className="text-blue-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Modal Dasar</div>
          <div className="text-lg font-extrabold text-blue-600 mt-1">{fmtRp(modalDasar)}</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-indigo-50 mb-2">
            <ArrowDownUp size={18} className="text-indigo-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Ditempatkan</div>
          <div className="text-lg font-extrabold text-indigo-600 mt-1">{fmtRp(modalDitempatkan)}</div>
          <div className="text-[10px] text-[var(--muted)]">(2.500 saham × Rp100rb)</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-green-50 mb-2">
            <Users size={18} className="text-green-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Sudah Disetor</div>
          <div className="text-lg font-extrabold text-green-600 mt-1">{fmtRp(totalSetor)}</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-orange-50 mb-2">
            <AlertTriangle size={18} className="text-orange-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Sisa Setoran</div>
          <div className="text-lg font-extrabold text-orange-600 mt-1">{fmtRp(totalSisa)}</div>
        </div>
      </div>

      {/* Progress bar total */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--muted)]">Progress Setoran Total</span>
          <span className="text-sm font-extrabold text-[var(--brand)]">{totalPct.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(totalPct, 100)}%`,
              background: totalPct >= 100
                ? "linear-gradient(90deg, #10b981, #059669)"
                : totalPct >= 50
                  ? "linear-gradient(90deg, #3b82f6, #6366f1)"
                  : "linear-gradient(90deg, #f59e0b, #ef4444)",
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-[var(--muted)]">
          <span>Target: {fmtRp(modalDitempatkan)}</span>
          <span>Terisi: {fmtRp(totalSetor)}</span>
        </div>
      </div>

      {/* Per Orang Table */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-4">Detail Per Pemegang Saham</h3>
        <div className="space-y-3">
          {shareholders.map((sh, i) => (
            <div key={i} className="border border-[var(--line)] rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-[var(--ink)]">{sh.nama}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {i === 0 ? "Direktur Utama" : i === 1 ? "Komisaris Utama" : "Komisaris"} • {sh.saham} lembar
                  </div>
                </div>
                <div className={`text-right text-xs font-bold px-2 py-1 rounded-full ${
                  sh.pct >= 100
                    ? "bg-green-100 text-green-700"
                    : sh.pct >= 30
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                }`}>
                  {sh.pct.toFixed(1)}%
                </div>
              </div>
              {/* Progress */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(sh.pct, 100)}%`,
                    background: sh.pct >= 100
                      ? "#10b981"
                      : sh.pct >= 30
                        ? "#3b82f6"
                        : "#ef4444",
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-[var(--muted)]">Kewajiban</div>
                  <div className="font-bold">{fmtRp(sh.kewajiban)}</div>
                </div>
                <div>
                  <div className="text-[var(--muted)]">Disetor</div>
                  <div className="font-bold text-green-700">{fmtRp(sh.sudahSetor)}</div>
                </div>
                <div>
                  <div className="text-[var(--muted)]">Sisa</div>
                  <div className={`font-bold ${sh.sisa <= 0 ? "text-green-700" : "text-red-600"}`}>
                    {fmtRp(sh.sisa)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rincian Setoran */}
      {rincian.length > 0 && (
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h3 className="font-bold text-[var(--ink)] mb-4">Rincian Setoran Modal</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--soft)] text-xs text-[var(--muted)]">
                  <th className="py-2 px-3 text-left">Tanggal</th>
                  <th className="py-2 px-3 text-left">Pemegang Saham</th>
                  <th className="py-2 px-3 text-right">Jumlah</th>
                  <th className="py-2 px-3 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {rincian.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--line)]">
                    <td className="py-2 px-3 text-xs">{r.tanggal}</td>
                    <td className="py-2 px-3 text-xs font-medium">{r.nama}</td>
                    <td className="py-2 px-3 text-xs text-right font-bold text-green-700">{fmtRp(r.jumlah)}</td>
                    <td className="py-2 px-3 text-xs text-[var(--muted)]">{r.keterangan}</td>
                  </tr>
                ))}
                <tr className="bg-[var(--soft)] font-bold">
                  <td className="py-2 px-3 text-xs" colSpan={2}>TOTAL</td>
                  <td className="py-2 px-3 text-xs text-right text-green-700">{fmtRp(totalSetor)}</td>
                  <td className="py-2 px-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div className="border border-orange-200 rounded-xl bg-orange-50 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-800">
            <strong>Catatan:</strong> Hanya setoran bertuliskan <code className="bg-orange-100 px-1 rounded">SETORAN MODAL</code> yang
            dihitung. Pengeluaran pribadi PIC tidak dianggap setoran saham. Data dari ekspor REKAP KEUANGAN SWI.
            Hingga saat ini baru <strong>{totalPct.toFixed(1)}%</strong> dari Rp 250 juta yang telah disetor.
          </div>
        </div>
      </div>

      {/* Ringkasan Visual */}
      <div className="grid grid-cols-3 gap-3">
        {shareholders.map((sh, i) => {
          const colors = ["blue", "purple", "indigo"];
          const bgClass = [
            "bg-blue-50 border-blue-200",
            "bg-purple-50 border-purple-200",
            "bg-indigo-50 border-indigo-200",
          ][i];
          const textClass = ["text-blue-700", "text-purple-700", "text-indigo-700"][i];
          return (
            <div key={i} className={`border rounded-xl p-4 ${bgClass}`}>
              <div className="text-xs font-bold opacity-70 mb-1">{sh.nama.split(" ")[0]}</div>
              <div className={`text-2xl font-extrabold ${textClass}`}>{sh.pct.toFixed(1)}%</div>
              <div className="text-xs opacity-60 mt-1">{fmtRp(sh.sudahSetor)} / {fmtRp(sh.kewajiban)}</div>
              <div className="h-1.5 bg-white/50 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-current opacity-60"
                  style={{ width: `${Math.min(sh.pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
