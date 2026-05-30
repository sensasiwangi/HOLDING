"use client";

import {
  Package, ShoppingBag, TrendingUp, Users,
  ArrowRight, FileSpreadsheet, CheckCircle, Clock,
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

interface Produk {
  id: string; nama: string; deskripsi: string; jenis: string;
  modal: number; targetInv: number; nisbah: string; status: string;
}

export default function SukukProdukPanel({
  produk,
  proyeksi,
}: {
  produk?: string[][] | null;
  proyeksi?: string[][] | null;
}) {
  if (!produk && !proyeksi) {
    return (
      <div className="text-center py-12">
        <Package size={36} className="mx-auto text-[var(--muted)] mb-3" />
        <p className="text-sm text-[var(--muted)]">Memuat data...</p>
      </div>
    );
  }

  // Parse produk list (rows 7-11 in produk sheet range)
  const products: Produk[] = [];
  if (produk) {
    for (let i = 0; i < produk.length; i++) {
      const r = produk[i];
      if (!r[0] || !r[0].startsWith("PRD-")) continue;
      products.push({
        id: r[0], nama: r[1], deskripsi: r[2], jenis: r[3],
        modal: safeNum(r[4]), targetInv: safeNum(r[5]),
        nisbah: r[6] || "50:50", status: r[7] || "",
      });
    }
  }

  // Parse proyeksi 12 bulan (rows 23-34 in proyeksi sheet range)
  const projBulan: {
    bulan: string; unit: number; harga: number; revenue: string;
    hpp: string; laba: string; inv: string; swi: string; sisa: string; status: string;
  }[] = [];
  let totalUnit = 0, totalLaba = 0, totalInv = 0, totalSWI = 0;
  if (proyeksi) {
    for (const r of proyeksi) {
      if (!r[0]) continue;
      const unit = safeNum(r[1]);
    if (unit === 0) continue;
    const laba = safeNum(r[5]);
    const inv = safeNum(r[6]);
    const swi = safeNum(r[7]);
    totalUnit += unit;
    if (laba > 0) totalLaba += laba;
    if (inv > 0) totalInv += inv;
    if (swi > 0) totalSWI += swi;
    projBulan.push({
      bulan: r[0], unit, harga: safeNum(r[2]),
      revenue: safeNum(r[3]).toString(), hpp: safeNum(r[4]).toString(),
      laba: laba.toString(), inv: inv.toString(), swi: swi.toString(),
      sisa: r[8] || "", status: r[9] || "",
    });
    }
  }

  const totalModal = products.reduce((s, p) => s + p.modal, 0);
  const totalTarget = products.reduce((s, p) => s + p.targetInv, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-[var(--ink)]">Sukuk Mikro Per Produk</h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Setor modal → buat produk → jual → bagi hasil. Stok sisa dijual terus, bagi hasil berkelanjutan.
        </p>
      </div>

      {/* Konsep Banner */}
      <div className="border border-indigo-200 rounded-xl bg-indigo-50 p-5">
        <h3 className="font-bold text-sm text-indigo-800 mb-3">💡 Konsep Sukuk Mikro SWI</h3>
        <div className="grid md:grid-cols-2 gap-3 text-xs text-indigo-800">
          <div className="space-y-1.5">
            <p><strong>1.</strong> Pilih produk yang mau disukukkan (T-Shirt, Tumbler, Candle, dll)</p>
            <p><strong>2.</strong> Investor setor modal (minimal Rp 5.000 = 1 unit)</p>
            <p><strong>3.</strong> Dana digunakan untuk produksi produk</p>
            <p><strong>4.</strong> Produk dijual di Store TIM & Marketplace</p>
          </div>
          <div className="space-y-1.5">
            <p><strong>5.</strong> Setiap bulan: bagi hasil 50:50 (atau sesuai nisbah)</p>
            <p><strong>6.</strong> Stok yang belum laku → dijual diskon</p>
            <p><strong>7.</strong> Hasil penjualan sisa → dibagi lagi 50:50</p>
            <p><strong>8.</strong> Tidak ada bunga — semua bagi hasil syariah ✅</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <Package size={18} className="text-[var(--brand)] mb-2" />
          <div className="text-xs text-[var(--muted)]">Total Produk</div>
          <div className="text-xl font-extrabold text-[var(--brand)]">{products.length}</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <TrendingUp size={18} className="text-green-600 mb-2" />
          <div className="text-xs text-[var(--muted)]">Total Modal Dibutuhkan</div>
          <div className="text-xl font-extrabold text-green-600">{fmtRp(totalModal)}</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <Users size={18} className="text-blue-600 mb-2" />
          <div className="text-xs text-[var(--muted)]">Target Investor</div>
          <div className="text-xl font-extrabold text-blue-600">{totalTarget}</div>
          <div className="text-[10px] text-[var(--muted)]">orang</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <ShoppingBag size={18} className="text-orange-600 mb-2" />
          <div className="text-xs text-[var(--muted)]">Proyeksi Laba/Tahun</div>
          <div className="text-xl font-extrabold text-orange-600">{fmtRp(totalLaba)}</div>
        </div>
      </div>

      {/* Produk Cards */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-4">Produk yang Bisa Disukukkan</h3>
        <div className="space-y-3">
          {products.map((p, i) => (
            <div key={i} className="border border-[var(--line)] rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-[var(--soft)] rounded">{p.id}</span>
                    <span className="font-bold text-[var(--ink)]">{p.nama}</span>
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1">{p.deskripsi}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  p.status === "Perencanaan" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>{p.status}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs mt-3">
                <div className="bg-[var(--soft)] rounded p-2">
                  <div className="text-[var(--muted)]">Modal</div>
                  <div className="font-bold">{fmtRp(p.modal)}</div>
                </div>
                <div className="bg-[var(--soft)] rounded p-2">
                  <div className="text-[var(--muted)]">Target Investor</div>
                  <div className="font-bold">{p.targetInv} orang</div>
                </div>
                <div className="bg-[var(--soft)] rounded p-2">
                  <div className="text-[var(--muted)]">Nisbah</div>
                  <div className="font-bold">{p.nisbah}</div>
                </div>
                <div className="bg-[var(--soft)] rounded p-2">
                  <div className="text-[var(--muted)]">Jenis</div>
                  <div className="font-bold">{p.jenis}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proyeksi Penjualan 12 Bulan */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-2">Proyeksi Penjualan & Bagi Hasil — PRD-001</h3>
        <p className="text-xs text-[var(--muted)] mb-4">
          T-Shirt Fragrantions Edition — 3.000 unit × Rp 150.000. Nisbah 50:50.
        </p>
        {projBulan.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-6">Belum ada proyeksi</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--soft)] text-xs text-[var(--muted)]">
                    <th className="py-2 px-2 text-left">Bulan</th>
                    <th className="py-2 px-2 text-right">Unit</th>
                    <th className="py-2 px-2 text-right">Harga</th>
                    <th className="py-2 px-2 text-right">Laba Kotor</th>
                    <th className="py-2 px-2 text-right">Bagi Investor</th>
                    <th className="py-2 px-2 text-right">Bagi SWI</th>
                    <th className="py-2 px-2 text-left">Stok Sisa</th>
                    <th className="py-2 px-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projBulan.map((p, i) => (
                    <tr key={i} className={`border-b border-[var(--line)] ${p.status === "Payback" ? "bg-orange-50" : p.status === "Launch" ? "bg-blue-50" : ""}`}>
                      <td className="py-2 px-2 font-medium text-xs">{p.bulan}</td>
                      <td className="py-2 px-2 text-right text-xs">{p.unit}</td>
                      <td className="py-2 px-2 text-right text-xs">{fmtRp(p.harga)}</td>
                      <td className="py-2 px-2 text-right text-xs font-medium">{fmtRp(safeNum(p.laba))}</td>
                      <td className="py-2 px-2 text-right text-xs text-green-700">{fmtRp(safeNum(p.inv))}</td>
                      <td className="py-2 px-2 text-right text-xs text-blue-700">{fmtRp(safeNum(p.swi))}</td>
                      <td className="py-2 px-2 text-xs">{safeNum(p.sisa).toLocaleString()} unit</td>
                      <td className="py-2 px-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          p.status === "Launch" ? "bg-blue-200 text-blue-800" :
                          p.status === "Payback" ? "bg-orange-200 text-orange-800" :
                          p.status === "Berkelanjutan" ? "bg-green-200 text-green-800" :
                          p.status === "Clearance" ? "bg-red-200 text-red-800" :
                          "bg-gray-200 text-gray-800"
                        }`}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Summary */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-[var(--soft)] rounded-lg text-center">
                <div className="text-[10px] text-[var(--muted)]">Total Unit Terjual</div>
                <div className="text-xl font-extrabold text-[var(--ink)]">{totalUnit.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-[10px] text-green-700">Bagi Investor</div>
                <div className="text-xl font-extrabold text-green-700">{fmtRp(totalInv)}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-[10px] text-blue-700">Bagi SWI</div>
                <div className="text-xl font-extrabold text-blue-700">{fmtRp(totalSWI)}</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <div className="text-[10px] text-orange-700">ROI Investor</div>
                <div className="text-xl font-extrabold text-orange-700">~400%</div>
                <div className="text-[9px] text-orange-600">/ tahun (estimasi)</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Alur Sukuk Mikro */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-4">Alur Sukuk Mikro Per Produk</h3>
        <div className="space-y-3">
          {[
            { step: "1", title: "Pilih Produk", desc: "Pilih produk yang mau disukukkan (T-Shirt, Tumbler, Candle, dll)", icon: <Package size={16} />, color: "blue" },
            { step: "2", title: "Gabung & Setor", desc: "Investor gabung di platform & setor modal (minimal Rp 5.000 / 1 unit)", icon: <Users size={16} />, color: "indigo" },
            { step: "3", title: "Produksi", desc: "Dana digunakan untuk produksi produk oleh SWI Store", icon: <ShoppingBag size={16} />, color: "purple" },
            { step: "4", title: "Penjualan", desc: "Produk dijual di Store TIM, Marketplace, dan Online", icon: <TrendingUp size={16} />, color: "green" },
            { step: "5", title: "Bagi Hasil", desc: "Tiap bulan: bagi hasil sesuai nisbah (default 50:50)", icon: <CheckCircle size={16} />, color: "amber" },
            { step: "6", title: "Berkelanjutan", desc: "Stok sisa dijual terus → bagi hasil berkelanjutan tanpa batas waktu", icon: <Clock size={16} />, color: "teal" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                item.color === "blue" ? "bg-blue-100 text-blue-600" :
                item.color === "indigo" ? "bg-indigo-100 text-indigo-600" :
                item.color === "purple" ? "bg-purple-100 text-purple-600" :
                item.color === "green" ? "bg-green-100 text-green-600" :
                item.color === "amber" ? "bg-orange-100 text-orange-600" :
                "bg-teal-100 text-teal-600"
              }`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-[var(--ink)]">{item.step}. {item.title}</div>
                <div className="text-xs text-[var(--muted)]">{item.desc}</div>
              </div>
              {i < 5 && <ArrowRight size={14} className="text-[var(--muted)] mt-2 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Ketentuan */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-3">Ketentuan Umum</h3>
        <div className="grid md:grid-cols-2 gap-2 text-xs">
          {[
            "Minimal investasi: Rp5.000 (1 unit)",
            "Maksimal: Rp50.000.000 per produk",
            "Bagi hasil: Bulanan (tgl 1-5)",
            "Stok sisa: dijual diskon, bagi hasil 50:50",
            "Tidak ada bunga — murni bagi hasil syariah",
            "Monitoring real-time via dashboard",
            "Kerugian ditanggung bersama (Musyarakah)",
            "Investor bisa ambil bonus produk fisik",
            "Biaya platform ditanggung dari bagian SWI",
            "Transparansi penuh: laporan harian di Sheets",
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <CheckCircle size={12} className="text-green-600 mt-0.5 shrink-0" />
              <span className="text-[var(--ink)]">{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
