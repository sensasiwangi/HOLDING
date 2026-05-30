"use client";

import {
  ShieldCheck, TrendingUp, Users, FileSpreadsheet,
  AlertTriangle, CheckCircle, Clock,
} from "lucide-react";

function fmtRp(n: number): string {
  if (!n && n !== 0) return "—";
  if (Math.abs(n) >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function safeNum(v: string | number | undefined): number {
  if (v === undefined || v === null || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/[^\d.-]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export default function SukukPanel({
  info,
  investor,
  proyeksi,
}: {
  info?: string[][] | null;
  investor?: string[][] | null;
  proyeksi?: string[][] | null;
}) {
  // Parse info sukuk (rows 4-9)
  const sukukInfo: Record<string, string> = {};
  if (info) {
    for (const r of info) {
      if (r[0] && r[1]) sukukInfo[r[0]] = r[1];
      if (r[4] && r[5]) sukukInfo[r[4]] = r[5];
    }
  }

  // Parse investor list (rows 12-26)
  const investors: {
    no: number; nama: string; jenis: string; unit: number;
    nominal: number; pct: string; tanggal: string; status: string;
  }[] = [];
  let totalUnit = 0, totalNominal = 0, totalAktif = 0;
  if (investor) {
    for (const r of investor) {
      if (!r[0] || isNaN(safeNum(r[0]))) continue;
      const unit = safeNum(r[3]);
      const nominal = safeNum(r[4]);
      totalUnit += unit;
      totalNominal += nominal;
      if (r[7] === "Aktif") totalAktif += nominal;
      investors.push({
        no: safeNum(r[0]),
        nama: r[1] || "",
        jenis: r[2] || "",
        unit,
        nominal,
        pct: r[5] || "",
        tanggal: r[6] || "",
        status: r[7] || "",
      });
    }
  }

  // Parse proyeksi (rows 29-44)
  const projBulan: {
    bulan: string; revenue: number; biayaOp: number; labaKotor: number;
    biayaLain: number; labaBersih: number; bagiInvestor: number; bagiSWI: number;
  }[] = [];
  let totalLaba = 0, totalBagiInvestor = 0, totalBagiSWI = 0;
  if (proyeksi) {
    for (const r of proyeksi) {
      if (!r[0] || r[0] === "Bulan" || r[0] === "TOTAL" || r[0] === "RATA-RATA") continue;
      const rev = safeNum(r[1]);
      const laba = safeNum(r[5]);
      const gi = safeNum(r[6]);
      const gs = safeNum(r[7]);
      if (laba > 0) totalLaba += laba;
      if (gi > 0) totalBagiInvestor += gi;
      if (gs > 0) totalBagiSWI += gs;
      projBulan.push({
        bulan: r[0],
        revenue: rev,
        biayaOp: safeNum(r[2]),
        labaKotor: safeNum(r[3]),
        biayaLain: safeNum(r[4]),
        labaBersih: laba,
        bagiInvestor: gi,
        bagiSWI: gs,
      });
    }
  }

  const nilaiSukuk = 1000000000;
  const pctTerjual = totalNominal > 0 ? (totalNominal / nilaiSukuk) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">Sukuk Musyarakah — SWI Store</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Sistem pendanaan syariah bagi hasil untuk Divisi Store
          </p>
        </div>
        <a
          href="https://docs.google.com/spreadsheets/d/1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA/edit"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--line)] text-xs font-bold hover:border-[var(--brand)] transition"
        >
          <FileSpreadsheet size={14} /> Sheets
        </a>
      </div>

      {/* Info Sukuk Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-2">
            <ShieldCheck size={18} className="text-blue-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Nilai Sukuk</div>
          <div className="text-lg font-extrabold text-blue-600 mt-1">
            {fmtRp(nilaiSukuk)}
          </div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-indigo-50 mb-2">
            <Users size={18} className="text-indigo-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Unit Terjual</div>
          <div className="text-lg font-extrabold text-indigo-600 mt-1">
            {totalUnit} <span className="text-xs font-normal">/ 1.000</span>
          </div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-green-50 mb-2">
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Terisi</div>
          <div className="text-lg font-extrabold text-green-600 mt-1">
            {fmtRp(totalNominal)}
          </div>
          <div className="text-[10px] text-[var(--muted)]">{pctTerjual.toFixed(1)}%</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-orange-50 mb-2">
            <AlertTriangle size={18} className="text-orange-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Sisa</div>
          <div className="text-lg font-extrabold text-orange-600 mt-1">
            {fmtRp(nilaiSukuk - totalNominal)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--muted)]">Progress Penawaran Sukuk</span>
          <span className="text-sm font-extrabold text-[var(--brand)]">{pctTerjual.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
            style={{ width: `${Math.min(pctTerjual, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-[var(--muted)]">
          <span>Target: 1.000 unit (Rp 1 Miliar)</span>
          <span>{fmtRp(totalNominal)} terkumpul</span>
        </div>
      </div>

      {/* Info Detail */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-4">Informasi Sukuk</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            ["Jenis Akad", "Musyarakah (Kemitraan)", "Status", "Perencanaan"],
            ["Nilai Sukuk", "Rp 1.000.000.000", "Unit", "1.000 unit × Rp 1.000.000"],
            ["Nisbah Bagi Hasil", "50:50 (Investor : SWI)", "Frekuensi", "Bulanan / Quarterly"],
            ["Underlying Asset", "Aset Store TIM", "Yield Estimasi", "8-12% p.a."],
            ["Platform", "Private Placement / Crowdfunding", "Dewan Syariah", "[TBD]"],
          ].map(([l1, v1, l2, v2], i) => (
            <div key={i} className="contents">
              <div className="py-1 border-b border-[var(--line)]">
                <div className="text-[var(--muted)] text-xs">{l1}</div>
                <div className="font-medium text-[var(--ink)]">{v1}</div>
              </div>
              <div className="py-1 border-b border-[var(--line)]">
                <div className="text-[var(--muted)] text-xs">{l2}</div>
                <div className="font-medium text-[var(--ink)]">{v2}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daftar Investor */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-4">Daftar Investor Sukuk</h3>
        {investors.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-6">Belum ada investor terdaftar</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--soft)] text-xs text-[var(--muted)]">
                  <th className="py-2 px-3 text-left">No</th>
                  <th className="py-2 px-3 text-left">Nama</th>
                  <th className="py-2 px-3 text-left">Jenis</th>
                  <th className="py-2 px-3 text-right">Unit</th>
                  <th className="py-2 px-3 text-right">Nominal</th>
                  <th className="py-2 px-3 text-right">%</th>
                  <th className="py-2 px-3 text-left">Tanggal</th>
                  <th className="py-2 px-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv, i) => (
                  <tr key={i} className="border-b border-[var(--line)]">
                    <td className="py-2 px-3">{inv.no}</td>
                    <td className="py-2 px-3 font-medium">{inv.nama}</td>
                    <td className="py-2 px-3 text-xs">{inv.jenis}</td>
                    <td className="py-2 px-3 text-right">{inv.unit}</td>
                    <td className="py-2 px-3 text-right font-medium">{fmtRp(inv.nominal)}</td>
                    <td className="py-2 px-3 text-right">{inv.pct}</td>
                    <td className="py-2 px-3 text-xs">{inv.tanggal}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        inv.status === "Aktif"
                          ? "bg-green-100 text-green-700"
                          : inv.status === "Menunggu"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-600"
                      }`}>
                        {inv.status === "Aktif" ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proyeksi Bagi Hasil 12 Bulan */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-4">Proyeksi Bagi Hasil 12 Bulan</h3>
        {projBulan.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-6">Belum ada proyeksi</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--soft)] text-xs text-[var(--muted)]">
                    <th className="py-2 px-3 text-left">Bulan</th>
                    <th className="py-2 px-3 text-right">Revenue</th>
                    <th className="py-2 px-3 text-right">Biaya Op</th>
                    <th className="py-2 px-3 text-right">Laba Kotor</th>
                    <th className="py-2 px-3 text-right">Laba Bersih</th>
                    <th className="py-2 px-3 text-right">Bagi Investor (50%)</th>
                    <th className="py-2 px-3 text-right">Bagi SWI (50%)</th>
                  </tr>
                </thead>
                <tbody>
                  {projBulan.map((p, i) => (
                    <tr key={i} className="border-b border-[var(--line)]">
                      <td className="py-2 px-3 font-medium text-xs">{p.bulan}</td>
                      <td className="py-2 px-3 text-right">{fmtRp(p.revenue)}</td>
                      <td className="py-2 px-3 text-right text-red-600">{fmtRp(p.biayaOp)}</td>
                      <td className="py-2 px-3 text-right">{fmtRp(p.labaKotor)}</td>
                      <td className="py-2 px-3 text-right font-medium">{fmtRp(p.labaBersih)}</td>
                      <td className="py-2 px-3 text-right text-green-700">{fmtRp(p.bagiInvestor)}</td>
                      <td className="py-2 px-3 text-right text-blue-700">{fmtRp(p.bagiSWI)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Summary */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-xs text-green-700">Total Bagi Investor</div>
                <div className="text-lg font-extrabold text-green-700 mt-1">{fmtRp(totalBagiInvestor)}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-xs text-blue-700">Total Bagi SWI</div>
                <div className="text-lg font-extrabold text-blue-700 mt-1">{fmtRp(totalBagiSWI)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-xs text-gray-600">Total Laba Bersih</div>
                <div className="text-lg font-extrabold text-gray-700 mt-1">{fmtRp(totalLaba)}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Struktur Kepemilikan */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-3">Struktur Kepemilikan Pasca Sukuk</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="text-xs text-green-700 font-bold mb-1">Investor Sukuk (Kolektif)</div>
            <div className="text-2xl font-extrabold text-green-700">
              {pctTerjual > 0 ? (100 * totalNominal / nilaiSukuk).toFixed(1) : "—"}{pctTerjual > 0 ? "%" : ""}
            </div>
            <div className="text-xs text-green-600 mt-1">Bagi hasil sesuai nisbah</div>
          </div>
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="text-xs text-blue-700 font-bold mb-1">PT SWI (Holding)</div>
            <div className="text-2xl font-extrabold text-blue-700">
              {pctTerjual > 0 ? (100 - 100 * totalNominal / nilaiSukuk).toFixed(1) : "—"}{pctTerjual > 0 ? "%" : ""}
            </div>
            <div className="text-xs text-blue-600 mt-1">Bagi hasil + kendali manajemen</div>
          </div>
        </div>
      </div>

      {/* Catatan */}
      <div className="border border-orange-200 rounded-xl bg-orange-50 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-800 space-y-1">
            <p><strong>Sukuk Musyarakah:</strong> Risiko ditanggung bersama. Jika rugi, investor ikut menanggung sesuai porsi.</p>
            <p><strong>Nisbah 50:50</strong> bersifat estimasi. Nisbah akhir ditentukan saat akad ditandatangani.</p>
            <p><strong>Yield 8-12% p.a.</strong> adalah proyeksi, bukan jaminan. Aktual tergantung kinerja bisnis Store.</p>
            <p><strong>Holding tetap mengendalikan</strong> operasional Store sebagai Mudharib (pengelola).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
