"use client";

import { Users, Building2, AlertTriangle, HelpCircle } from "lucide-react";

interface DivisiRow {
  divisi: string;
  pemilik: string;
  kepemilikan: string;
  catatan: string;
  status: string;
  isHighlight: boolean;
}

function parseDivisiData(data: string[][] | null | undefined): DivisiRow[] {
  if (!data) return [];
  const rows: DivisiRow[] = [];
  for (const r of data) {
    if (!r[0] || r[0] === "Divisi" || r[0].startsWith("====") || r[0] === "KETERANGAN:") continue;
    const status = r[4] || "";
    rows.push({
      divisi: r[0],
      pemilik: r[1] || "",
      kepemilikan: r[2] || "",
      catatan: r[3] || "",
      status,
      isHighlight: status.toLowerCase().includes("restruktur") || status.toLowerCase().includes("rencana"),
    });
  }
  return rows;
}

export default function DivisiShareholderPanel({ data }: { data?: string[][] | null }) {
  const rows = parseDivisiData(data);
  const keteranganRows = data?.filter((r) => r[0] && /^\d+\./.test(r[0])) || [];
  const templateRows = data?.filter((r) => r[0] && !r[0].startsWith("====") && (r[1]?.includes("[") || r[0] === "Store")) || [];

  if (rows.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 size={36} className="mx-auto text-[var(--muted)] mb-3" />
        <p className="text-sm text-[var(--muted)]">Belum ada data kepemilikan divisi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-[var(--ink)]">Struktur Kepemilikan Per Divisi</h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Semua divisi saat ini 100% milik PT Sensasi Wangi Indonesia (Holding)
        </p>
      </div>

      {/* Info Banner */}
      <div className="border border-blue-200 rounded-xl bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <HelpCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <strong>Struktur saat ini:</strong> PT SWI (Holding) memiliki 100% kepemilikan atas semua divisi.
            Perubahan kepemilakan akan dicatat di sini dan di Google Sheets.
          </div>
        </div>
      </div>

      {/* Per Divisi Cards */}
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`border rounded-xl p-5 ${
              row.isHighlight
                ? "border-orange-300 bg-orange-50"
                : "border-[var(--line)] bg-white"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  row.isHighlight ? "bg-orange-200" : "bg-[var(--soft)]"
                }`}>
                  <Users size={18} className={row.isHighlight ? "text-orange-700" : "text-[var(--brand)]"} />
                </div>
                <div>
                  <div className="font-bold text-[var(--ink)]">{row.divisi}</div>
                  <div className="text-xs text-[var(--muted)]">{row.pemilik}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-extrabold ${
                  row.isHighlight ? "text-orange-600" : "text-[var(--brand)]"
                }`}>
                  {row.kepemilikan}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/60 rounded-lg p-2">
                <div className="text-[var(--muted)]">Catatan</div>
                <div className="font-medium mt-0.5">{row.catatan}</div>
              </div>
              <div className="bg-white/60 rounded-lg p-2">
                <div className="text-[var(--muted)]">Status</div>
                <div className={`font-bold mt-0.5 ${
                  row.isHighlight ? "text-orange-700" : "text-green-700"
                }`}>
                  {row.status}
                </div>
              </div>
            </div>
            {row.isHighlight && (
              <div className="flex items-center gap-2 mt-3 text-xs text-orange-700 bg-orange-100 rounded-lg p-2">
                <AlertTriangle size={14} />
                <span><strong>Perhatian:</strong> Divisi ini direncanakan untuk memiliki pemegang saham/investor tersendiri</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Keterangan */}
      {keteranganRows.length > 0 && (
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h3 className="font-bold text-[var(--ink)] mb-3">Keterangan</h3>
          <ol className="space-y-2">
            {keteranganRows.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[var(--ink)]">
                <span className="text-[var(--brand)] font-bold">{r[0]}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Template Area */}
      <div className="border border-dashed border-[var(--line)] rounded-xl bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-orange-500" />
          <h3 className="font-bold text-sm text-[var(--ink)]">Template Pemisahan Store (Nanti)</h3>
        </div>
        <p className="text-xs text-[var(--muted)] mb-3">
          Saat Store memiliki investor/partner, isi detailnya di Google Sheets. Template di baris 17-18 sudah disediakan.
        </p>
        {templateRows.length > 0 && (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--soft)] text-[var(--muted)]">
                <th className="py-1.5 px-2 text-left">Divisi</th>
                <th className="py-1.5 px-2 text-left">Pemegang Saham</th>
                <th className="py-1.5 px-2 text-right">%</th>
                <th className="py-1.5 px-2 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {templateRows.map((r, i) => (
                r[1]?.includes("[") && (
                  <tr key={i} className="border-b border-[var(--line)]">
                    <td className="py-1.5 px-2">{r[0]}</td>
                    <td className="py-1.5 px-2 text-orange-600 italic">{r[1]}</td>
                    <td className="py-1.5 px-2 text-right text-orange-600">{r[2]}</td>
                    <td className="py-1.5 px-2 text-[var(--muted)]">{r[3]}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-[var(--muted)] py-4 border-t border-[var(--line)]">
        <p>Data otomatis tersinkronisasi dari Google Sheets → sheet "DivisiShareholders"</p>
        <p className="mt-1">Untuk mengubah struktur kepemilikan, edit langsung di Google Sheets</p>
      </div>
    </div>
  );
}
