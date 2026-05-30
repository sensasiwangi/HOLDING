"use client";

import { useState, useEffect } from "react";

interface COAItem {
  code: string;
  name: string;
  type: string;
  category: string;
}

const DIVISI_LIST = [
  { value: "Holding", label: "Holding" },
  { value: "Produksi", label: "Produksi & Brands" },
  { value: "Event", label: "Event Organizer" },
  { value: "Store", label: "SWI Store" },
  { value: "Ecommerse", label: "Ecommerse & Marketplace" },
  { value: "Digital", label: "Digital Systems & AI" },
];

const CASHFLOW_TYPES = [
  { value: "operasional", label: "Operasional" },
  { value: "investasi", label: "Investasi" },
  { value: "pendanaan", label: "Pendanaan" },
];

export default function TransactionForm({ coa }: { coa: COAItem[] }) {
  const [formType, setFormType] = useState<"cash_harian" | "buku_kas">("cash_harian");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [cashflowType, setCashflowType] = useState("operasional");
  const [division, setDivision] = useState("Holding");
  const [accountId, setAccountId] = useState("101");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [txType, setTxType] = useState<"debit" | "kredit">("debit");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);

  const filteredCOA = coa.filter((c) => {
    if (txType === "debit") return c.type === "Pendapatan";
    return c.type === "Beban" || c.type === "Aset" || c.type === "Kewajiban";
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) {
      setMessage({ type: "error", text: "Deskripsi dan Nomor harus diisi" });
      return;
    }
    setSaving(true);
    setMessage(null);

    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
    const inflow = txType === "debit" ? numAmount : 0;
    const outflow = txType === "kredit" ? numAmount : 0;

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheet: formType === "cash_harian" ? "Cash_Harian" : "Buku_Kas",
          date,
          description,
          inflow,
          outflow,
          accountId,
          category: category || cashflowType,
          subcategory,
          division,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "✅ Transaksi berhasil dicatat!" });
        setRecentTx((prev) => [
          {
            date,
            description,
            amount: numAmount,
            type: txType,
            accountId,
            division,
            time: new Date().toLocaleTimeString("id-ID"),
          },
          ...prev.slice(0, 9),
        ]);
        setDescription("");
        setAmount("");
        setCategory("");
        setSubcategory("");
      } else {
        setMessage({ type: "error", text: data.error || "Gagal mencatat transaksi" });
      }
    } catch {
      setMessage({ type: "error", text: "Gagal terhubung ke server" });
    }
    setSaving(false);
  };

  const formatRupiah = (val: string) => {
    const num = val.replace(/[^0-9]/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(num));
  };

  const tips = [
    "Kode 1xx = Aset, 2xx = Kewajiban, 3xx = Modal",
    "Kode 4xx = Pendapatan, 5xx = Beban",
    "Mutasi bank selesai → catat di Cash_Harian",
    "Dekat akhir bulan → hitung setoran 30% ke Holding",
  ];
  const [tipIndex, setTipIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Tips Bar */}
      <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
        <span>💡</span>
        <span>{tips[tipIndex]}</span>
        <button
          onClick={() => setTipIndex((prev) => (prev + 1) % tips.length)}
          className="ml-auto text-amber-400/60 hover:text-amber-400"
        >
          →
        </button>
      </div>

      {/* Form Type Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setFormType("cash_harian")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            formType === "cash_harian"
              ? "bg-tosca text-white shadow-lg shadow-tosca/25"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          💰 Cash Harian (Bank)
        </button>
        <button
          onClick={() => setFormType("buku_kas")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            formType === "buku_kas"
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          📝 Buku Kas (Manual)
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Tanggal */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-tosca focus:outline-none transition-colors"
            />
          </div>

          {/* Divisi */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Divisi</label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-tosca focus:outline-none transition-colors"
            >
              {DIVISI_LIST.map((d) => (
                <option key={d.value} value={d.value} className="bg-gray-900">
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tipe Cashflow */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tipe Arus Kas</label>
          <div className="flex gap-2">
            {CASHFLOW_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setCashflowType(t.value)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  cashflowType === t.value
                    ? cashflowType === "operasional"
                      ? "bg-tosca/20 text-tosca border border-tosca/40"
                      : cashflowType === "investasi"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                      : "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                    : "bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Debit/Kredit Toggle */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Jenis Transaksi</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTxType("debit")}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                txType === "debit"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              ⬇️ Uang Masuk (Debit)
            </button>
            <button
              type="button"
              onClick={() => setTxType("kredit")}
              className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                txType === "kredit"
                  ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              ⬆️ Uang Keluar (Kredit)
            </button>
          </div>
        </div>

        {/* Kode Akun */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Kode Akun (COA)</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-tosca focus:outline-none transition-colors"
          >
            <optgroup label="── Aset (100) ──">
              {coa
                .filter((c) => c.type === "Aset")
                .map((c) => (
                  <option key={c.code} value={c.code} className="bg-gray-900">
                    {c.code} - {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="── Kewajiban (200) ──">
              {coa
                .filter((c) => c.type === "Kewajiban")
                .map((c) => (
                  <option key={c.code} value={c.code} className="bg-gray-900">
                    {c.code} - {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="── Modal (300) ──">
              {coa
                .filter((c) => c.type === "Modal")
                .map((c) => (
                  <option key={c.code} value={c.code} className="bg-gray-900">
                    {c.code} - {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="── Pendapatan (400) ──">
              {coa
                .filter((c) => c.type === "Pendapatan")
                .map((c) => (
                  <option key={c.code} value={c.code} className="bg-gray-900">
                    {c.code} - {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="── Beban (500) ──">
              {coa
                .filter((c) => c.type === "Beban")
                .map((c) => (
                  <option key={c.code} value={c.code} className="bg-gray-900">
                    {c.code} - {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="── Holding (700) ──">
              {coa
                .filter((c) => c.type === "Holding")
                .map((c) => (
                  <option key={c.code} value={c.code} className="bg-gray-900">
                    {c.code} - {c.name}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Kategori</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="cth: Penjualan, Gaji, Sewa"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-tosca focus:outline-none transition-colors placeholder:text-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Sub Kategori</label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="cth: Penjualan T-Shirt"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-tosca focus:outline-none transition-colors placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Deskripsi</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan transaksi ini..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-tosca focus:outline-none transition-colors placeholder:text-gray-600"
          />
        </div>

        {/* Jumlah */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Jumlah (Rp)</label>
          <input
            type="text"
            value={amount ? formatRupiah(amount) : ""}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-lg font-semibold focus:border-tosca focus:outline-none transition-colors placeholder:text-gray-600"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
            saving
              ? "bg-gray-600 cursor-not-allowed"
              : txType === "debit"
              ? "bg-gradient-to-r from-emerald-600 to-tosca hover:shadow-lg hover:shadow-emerald-500/25"
              : "bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg hover:shadow-orange-500/25"
          }`}
        >
          {saving ? "Menyimpan..." : txType === "debit" ? "⬇️ Catat Uang Masuk" : "⬆️ Catat Uang Keluar"}
        </button>
      </form>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Recent Transactions */}
      {recentTx.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Transaksi Terakhir</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {recentTx.map((tx, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-2 text-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    tx.type === "debit" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <span className="text-gray-400">{tx.date}</span>
                <span className="text-white flex-1 truncate">{tx.description}</span>
                <span className="text-gray-500">{tx.accountId}</span>
                <span
                  className={`font-semibold ${
                    tx.type === "debit" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {tx.type === "debit" ? "+" : "-"}
                  {new Intl.NumberFormat("id-ID").format(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
