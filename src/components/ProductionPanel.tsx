// src/components/ProductionPanel.tsx
// Production Dashboard — UI untuk catat produksi per brand
"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────
interface ProductionItem {
  tanggal: string;
  tipe: string;
  kategori: string;
  deskripsi: string;
  jumlah: number;
  info: string;
}

interface BrandSummary {
  brand: string;
  totalProses: number;
  totalBahan: number;
  totalBottling: number;
  totalPackaging: number;
  totalProdukJadi: number;
  totalPenjualan: number;
  stokSiap: number;
}

const BRANDS = ["Produksi", "Event", "Store", "Ecommerse"];
const BRAND_COLORS: Record<string, { bg: string; text: string; border: string; icon: string; gradient: string }> = {
  Produksi:  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "🏭", gradient: "from-blue-500 to-indigo-600" },
  Event:     { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "🎪", gradient: "from-purple-500 to-pink-600" },
  Store:     { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "🏪", gradient: "from-emerald-500 to-teal-600" },
  Ecommerse: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "🌐", gradient: "from-orange-500 to-amber-600" },
};

const STEPS = [
  { key: "bahan", label: "Bahan Baku", icon: "📦", color: "blue" },
  { key: "bottling", label: "Bottling", icon: "🔧", color: "orange" },
  { key: "packaging", label: "Packaging", icon: "📦", color: "purple" },
  { key: "produk", label: "Produk Jadi", icon: "✅", color: "green" },
  { key: "penjualan", label: "Penjualan", icon: "💰", color: "emerald" },
];

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// ── Main Component ────────────────────────────────────────────────

export default function ProductionPanel() {
  const [activeBrand, setActiveBrand] = useState("Produksi");
  const [activeStep, setActiveStep] = useState("bahan");
  const [data, setData] = useState<Record<string, ProductionItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    kategori: "",
    deskripsi: "",
    jumlah: "",
    unit: "",
    upahPerUnit: "",
    biayaPerUnit: "",
    batch: "",
    pic: "",
    catatan: "",
    // Bahan baku
    namaBahan: "",
    qtyBahan: "",
    hargaBahan: "",
    supplier: "",
    satuan: "pcs",
    kode: "",
  });

  useEffect(() => {
    fetchProductionData();
  }, []);

  async function fetchProductionData() {
    try {
      const res = await fetch("/api/finance");
      const financeData = await res.json();

      // Parse data per brand dari finance data
      const brandData: Record<string, ProductionItem[]> = {};
      for (const brand of BRANDS) {
        brandData[brand] = [];
      }

      // Ambil dari cashHarian
      if (financeData.cashHarian) {
        for (const row of financeData.cashHarian.slice(1)) {
          if (!row[0]) continue;
          const divisi = row[7] || "";
          const inflow = parseFloat(String(row[4] || "0").replace(/[^\d.-]/g, "")) || 0;
          const outflow = parseFloat(String(row[5] || "0").replace(/[^\d.-]/g, "")) || 0;
          const item: ProductionItem = {
            tanggal: row[0] || "",
            tipe: inflow > 0 ? "Pemasukan" : "Pengeluaran",
            kategori: row[2] || "",
            deskripsi: row[3] || "",
            jumlah: inflow || outflow,
            info: row[6] || "",
          };
          for (const brand of BRANDS) {
            if (divisi.toLowerCase().includes(brand.toLowerCase().replace("ecommerse", "ecommerse"))) {
              brandData[brand].push(item);
            }
          }
        }
      }

      setData(brandData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      let res: Response;

      if (activeStep === "bahan") {
        res = await fetch("/api/production?type=bahan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tanggal: formData.tanggal,
            nama: formData.namaBahan,
            kategori: formData.kategori || "Bahan",
            satuan: formData.satuan,
            hargaSatuan: parseFloat(formData.hargaBahan) || 0,
            qtyBeli: parseFloat(formData.qtyBahan) || 0,
            supplier: formData.supplier,
            brand: activeBrand,
          }),
        });
      } else if (activeStep === "bottling") {
        res = await fetch("/api/production?type=bottling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: activeBrand,
            skuProduk: formData.kode || "",
            namaProduk: formData.deskripsi,
            tanggal: formData.tanggal,
            batchProduk: formData.batch || `B-${Date.now().toString(36).slice(-4)}`,
            unitDiproduksi: parseFloat(formData.unit) || 0,
            upahPerUnit: parseFloat(formData.upahPerUnit) || 0,
            pic: formData.pic,
            catatan: formData.catatan,
          }),
        });
      } else if (activeStep === "packaging") {
        res = await fetch("/api/production?type=packaging", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: activeBrand,
            skuProduk: formData.kode || "",
            namaProduk: formData.deskripsi,
            tanggal: formData.tanggal,
            unitDipackaging: parseFloat(formData.unit) || 0,
            biayaPerUnit: parseFloat(formData.biayaPerUnit) || 0,
            pic: formData.pic,
          }),
        });
      } else if (activeStep === "penjualan") {
        res = await fetch("/api/production?type=penjualan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: activeBrand,
            sku: formData.kode || "",
            namaProduk: formData.deskripsi,
            tanggal: formData.tanggal,
            unitTerjual: parseFloat(formData.unit) || 0,
            hargaJual: parseFloat(formData.jumlah) || 0,
            batch: formData.batch,
            catatan: formData.catatan,
          }),
        });
      } else {
        res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sheet: "Cash_Harian",
            date: formData.tanggal,
            accountId: "501",
            category: formData.kategori,
            description: formData.deskripsi,
            inflow: 0,
            outflow: parseFloat(formData.jumlah) || 0,
            division: activeBrand,
          }),
        });
      }

      const result = await res.json();
      if (result.success || result.ok) {
        setMessage({ type: "success", text: `✅ ${getStepLabel(activeStep)} berhasil dicatat!` });
        // Reset form
        setFormData((prev) => ({ ...prev, deskripsi: "", jumlah: "", unit: "", kode: "" }));
        fetchProductionData();
      } else {
        setMessage({ type: "error", text: result.error || "Gagal menyimpan" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal terhubung" });
    }
    setSaving(false);
  }

  function getStepLabel(key: string) {
    return STEPS.find((s) => s.key === key)?.label || key;
  }

  function handleInput(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // Hitung summary per brand
  const brandSummary: BrandSummary | null = data[activeBrand]
    ? (() => {
        const items = data[activeBrand];
        return {
          brand: activeBrand,
          totalProses: items.length,
          totalBahan: items.filter((i) => i.tipe === "Pembelian Bahan").reduce((s, i) => s + i.jumlah, 0),
          totalBottling: items.filter((i) => i.tipe === "Bottling").reduce((s, i) => s + i.jumlah, 0),
          totalPackaging: items.filter((i) => i.tipe === "Packaging").reduce((s, i) => s + i.jumlah, 0),
          totalProdukJadi: items.filter((i) => i.tipe === "Produk Jadi").reduce((s, i) => s + i.jumlah, 0),
          totalPenjualan: items.filter((i) => i.tipe === "Penjualan").reduce((s, i) => s + i.jumlah, 0),
          stokSiap: 0,
        };
      })()
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-tosca border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">Produksi & Operasional</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Catat seluruh alur produksi per brand — dari bahan baku sampai penjualan
          </p>
        </div>
      </div>

      {/* Brand Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {BRANDS.map((brand) => {
          const color = BRAND_COLORS[brand];
          const isActive = activeBrand === brand;
          const items = data[brand] || [];
          const totalBahan = items.filter((i) => i.tipe === "Pembelian Bahan").reduce((s, i) => s + i.jumlah, 0);
          const totalPenjualan = items.filter((i) => i.tipe === "Penjualan").reduce((s, i) => s + i.jumlah, 0);

          return (
            <button
              key={brand}
              onClick={() => setActiveBrand(brand)}
              className={`text-left border rounded-xl p-4 transition-all ${
                isActive ? `${color.bg} ${color.border} shadow-lg` : "border-[var(--line)] bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{color.icon}</span>
                <span className={`font-bold text-sm ${isActive ? color.text : "text-[var(--ink)]"}`}>
                  {brand}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Bahan</span>
                  <span className="font-bold text-red-500">{fmt(totalBahan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Penjualan</span>
                  <span className="font-bold text-green-600">{fmt(totalPenjualan)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[var(--line)]">
                  <span className="text-[var(--muted)]">Margin</span>
                  <span className={`font-bold ${totalPenjualan - totalBahan >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {fmt(totalPenjualan - totalBahan)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Production Pipeline Visual */}
      {brandSummary && (
        <div className={`border rounded-xl p-5 ${BRAND_COLORS[activeBrand].bg} ${BRAND_COLORS[activeBrand].border}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{BRAND_COLORS[activeBrand].icon}</span>
            <h3 className={`text-lg font-extrabold ${BRAND_COLORS[activeBrand].text}`}>
              {activeBrand} — Production Pipeline
            </h3>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {STEPS.map((step) => {
              const isActive = activeStep === step.key;
              const value =
                step.key === "bahan" ? brandSummary.totalBahan :
                step.key === "bottling" ? brandSummary.totalBottling :
                step.key === "packaging" ? brandSummary.totalPackaging :
                step.key === "produk" ? brandSummary.totalProdukJadi :
                brandSummary.totalPenjualan;

              return (
                <button
                  key={step.key}
                  onClick={() => setActiveStep(step.key)}
                  className={`rounded-lg p-3 text-center transition-all ${
                    isActive ? "bg-white shadow-lg ring-2 ring-tosca" : "bg-white/60 hover:bg-white/80"
                  }`}
                >
                  <div className="text-2xl mb-1">{step.icon}</div>
                  <div className="text-xs font-bold text-gray-700">{step.label}</div>
                  <div className={`text-sm font-extrabold mt-1 ${
                    step.key === "penjualan" ? "text-green-600" : "text-gray-800"
                  }`}>
                    {fmt(value)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{STEPS.find((s) => s.key === activeStep)?.icon}</span>
          <h4 className="font-bold text-[var(--ink)]">
            Catat {getStepLabel(activeStep)} — {activeBrand}
          </h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => handleInput("tanggal", e.target.value)}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
              />
            </div>

            {/* Kode/SKU */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kode / SKU</label>
              <input
                type="text"
                value={formData.kode || ""}
                onChange={(e) => handleInput("kode", e.target.value)}
                placeholder="cth: ARC-001, BTL-001"
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
              />
            </div>

            {/* Batch */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Batch</label>
              <input
                type="text"
                value={formData.batch}
                onChange={(e) => handleInput("batch", e.target.value)}
                placeholder="cth: B-2026-003"
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
              />
            </div>
          </div>

          {/* Bahan Baku specific */}
          {activeStep === "bahan" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  value={formData.namaBahan}
                  onChange={(e) => handleInput("namaBahan", e.target.value)}
                  placeholder="cth: Botol kaca 30ml, Essence woody"
                  className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                <input
                  type="text"
                  value={formData.qtyBahan}
                  onChange={(e) => handleInput("qtyBahan", e.target.value)}
                  placeholder="jumlah"
                  className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Satuan</label>
                <select
                  value={formData.satuan}
                  onChange={(e) => handleInput("satuan", e.target.value)}
                  className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                >
                  <option value="pcs">pcs</option>
                  <option value="ml">ml</option>
                  <option value="gram">gram</option>
                  <option value="liter">liter</option>
                  <option value="kg">kg</option>
                  <option value="box">box</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Harga Satuan</label>
                <input
                  type="text"
                  value={formData.hargaBahan}
                  onChange={(e) => handleInput("hargaBahan", e.target.value)}
                  placeholder="Rp"
                  className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleInput("supplier", e.target.value)}
                  placeholder="cth: BotolCo, AromaCraft"
                  className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Bottling / Packaging / Penjualan specific */}
          {["bottling", "packaging", "penjualan", "produk"].includes(activeStep) && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => handleInput("unit", e.target.value)}
                  placeholder="jumlah unit"
                  className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                />
              </div>
              {(activeStep === "bottling") && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Upah/Unit</label>
                  <input
                    type="text"
                    value={formData.upahPerUnit}
                    onChange={(e) => handleInput("upahPerUnit", e.target.value)}
                    placeholder="Rp"
                    className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                  />
                </div>
              )}
              {activeStep === "packaging" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Biaya/Unit</label>
                  <input
                    type="text"
                    value={formData.biayaPerUnit}
                    onChange={(e) => handleInput("biayaPerUnit", e.target.value)}
                    placeholder="Rp"
                    className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                  />
                </div>
              )}
              {activeStep === "penjualan" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Harga Jual/Unit</label>
                  <input
                    type="text"
                    value={formData.jumlah}
                    onChange={(e) => handleInput("jumlah", e.target.value)}
                    placeholder="Rp"
                    className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">PIC</label>
                <input
                  type="text"
                  value={formData.pic}
                  onChange={(e) => handleInput("pic", e.target.value)}
                  placeholder="nama PIC"
                  className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {activeStep === "bahan" ? "Keterangan" : "Deskripsi / Nama Produk"}
            </label>
            <input
              type="text"
              value={formData.deskripsi}
              onChange={(e) => handleInput("deskripsi", e.target.value)}
              placeholder={
                activeStep === "bahan" ? "keterangan tambahan" :
                activeStep === "bottling" ? "nama produk yang dibottling" :
                activeStep === "packaging" ? "nama produk yang dipackaging" :
                activeStep === "penjualan" ? "nama produk yang dijual" :
                "deskripsi"
              }
              className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Catatan</label>
            <input
              type="text"
              value={formData.catatan}
              onChange={(e) => handleInput("catatan", e.target.value)}
              placeholder="catatan tambahan (opsional)"
              className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
            />
          </div>

          {/* Auto-calculated preview */}
          {activeStep === "bahan" && formData.qtyBahan && formData.hargaBahan && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <span className="font-bold text-blue-700">Total: </span>
              <span className="font-extrabold text-blue-800">
                {fmt((parseFloat(formData.qtyBahan) || 0) * (parseFloat(formData.hargaBahan) || 0))}
              </span>
              <span className="text-blue-600 ml-2">
                ({formData.qtyBahan} {formData.satuan} × {fmt(parseFloat(formData.hargaBahan) || 0)})
              </span>
            </div>
          )}

          {activeStep === "bottling" && formData.unit && formData.upahPerUnit && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
              <span className="font-bold text-orange-700">Total Upah: </span>
              <span className="font-extrabold text-orange-800">
                {fmt((parseFloat(formData.unit) || 0) * (parseFloat(formData.upahPerUnit) || 0))}
              </span>
            </div>
          )}

          {activeStep === "penjualan" && formData.unit && formData.jumlah && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <span className="font-bold text-green-700">Pendapatan: </span>
              <span className="font-extrabold text-green-800">
                {fmt((parseFloat(formData.unit) || 0) * (parseFloat(formData.jumlah) || 0))}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : `bg-gradient-to-r ${BRAND_COLORS[activeBrand].gradient} hover:shadow-lg`
            }`}
          >
            {saving ? "Menyimpan..." : `💾 Catat ${getStepLabel(activeStep)}`}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {data[activeBrand] && data[activeBrand].length > 0 && (
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h4 className="font-bold text-[var(--ink)] mb-3">Transaksi Terakhir — {activeBrand}</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data[activeBrand]
              .filter((item) => {
                if (activeStep === "bahan") return item.tipe === "Pembelian Bahan";
                if (activeStep === "bottling") return item.tipe === "Bottling";
                if (activeStep === "packaging") return item.tipe === "Packaging";
                if (activeStep === "produk") return item.tipe === "Produk Jadi";
                if (activeStep === "penjualan") return item.tipe === "Penjualan";
                return true;
              })
              .slice(0, 15)
              .map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-[var(--soft)] rounded-lg px-3 py-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${
                    item.tipe === "Penjualan" ? "bg-green-500" :
                    item.tipe === "Bottling" ? "bg-orange-500" :
                    item.tipe === "Packaging" ? "bg-purple-500" :
                    item.tipe === "Produk Jadi" ? "bg-emerald-500" :
                    "bg-red-400"
                  }`} />
                  <span className="text-gray-500 w-20">{item.tanggal}</span>
                  <span className="text-gray-800 flex-1 truncate">{item.deskripsi}</span>
                  <span className={`font-bold ${
                    item.tipe === "Penjualan" ? "text-green-600" : "text-red-500"
                  }`}>
                    {item.tipe === "Penjualan" ? "+" : "-"}{fmt(item.jumlah)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
