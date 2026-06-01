// src/components/KycPanel.tsx
// KYC Investor — Form pendaftaran & validasi dokumen
"use client";

import { useState } from "react";

interface KycForm {
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  ktp: string;
  npwp: string;
  bank: string;
  rekening: string;
  namaRekening: string;
  totalInvestasi: string;
  hasKtp: boolean;
  hasNpwp: boolean;
  hasRekeningKoran: boolean;
  hasSuratKemampuan: boolean;
  hasFormMt4: boolean;
  hasFormRf: boolean;
  hasVideo: boolean;
}

const INITIAL_FORM: KycForm = {
  nama: "", email: "", telepon: "", alamat: "", ktp: "", npwp: "",
  bank: "", rekening: "", namaRekening: "", totalInvestasi: "",
  hasKtp: false, hasNpwp: false, hasRekeningKoran: false,
  hasSuratKemampuan: false, hasFormMt4: false, hasFormRf: false, hasVideo: false,
};

const KYC_ITEMS = [
  { key: "hasKtp", label: "KTP / Identitas Diri", required: true, desc: "Scan KTP atau paspor yang masih berlaku" },
  { key: "hasNpwp", label: "NPWP", required: true, desc: "Nomor Pokok Wajib Pajak" },
  { key: "hasRekeningKoran", label: "Rekening Koran 3 Bulan Terakhir", required: true, desc: "Mutasi rekening 3 bulan terakhir" },
  { key: "hasSuratKemampuan", label: "Surat Kemampuan Finansial", required: false, desc: "Surat pernyataan kemampuan finansial" },
  { key: "hasFormMt4", label: "Formulir MT4", required: true, desc: "Formulir Modal, Tujuan, Tenor, 4-eyes" },
  { key: "hasFormRf", label: "Formulir Risk Profile", required: true, desc: "Formulir profil risiko investor" },
  { key: "hasVideo", label: "Video Perjanjian", required: true, desc: "Rekaman video kesepakatan bagi hasil" },
];

export default function KycPanel() {
  const [form, setForm] = useState<KycForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const completedCount = KYC_ITEMS.filter((item) => form[item.key as keyof KycForm]).length;
  const totalRequired = KYC_ITEMS.filter((i) => i.required).length;
  const requiredCompleted = KYC_ITEMS.filter((i) => i.required && form[i.key as keyof KycForm]).length;
  const score = Math.round((completedCount / KYC_ITEMS.length) * 100);

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/kyc?action=submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        if (data.validation?.isComplete) {
          setForm(INITIAL_FORM);
        }
      } else {
        setMessage({ type: "error", text: data.error || "Gagal submit KYC" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-[var(--ink)]">KYC Investor</h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Pendaftaran & validasi dokumen investor sukuk — prinsip syariah
        </p>
      </div>

      {/* Progress */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-700">Kelengkapan Dokumen</span>
          <span className={`text-lg font-extrabold ${score === 100 ? "text-green-600" : score >= 70 ? "text-blue-600" : "text-orange-500"}`}>
            {score}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${score === 100 ? "bg-green-500" : "bg-tosca"}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {completedCount}/{KYC_ITEMS.length} dokumen | {requiredCompleted}/{totalRequired} wajib
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Data Pribadi */}
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h4 className="font-bold text-[var(--ink)] mb-4">Data Investor</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[
              { key: "nama", label: "Nama Lengkap", required: true },
              { key: "email", label: "Email", type: "email", required: true },
              { key: "telepon", label: "No. Telepon", required: true },
              { key: "ktp", label: "No. KTP", required: true },
              { key: "npwp", label: "No. NPWP", required: true },
              { key: "bank", label: "Bank", required: true },
              { key: "rekening", label: "No. Rekening", required: true },
              { key: "namaRekening", label: "Nama di Rekening", required: true },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type={(field as any).type || "text"}
                  value={form[field.key as keyof KycForm] as string}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Alamat</label>
              <textarea
                value={form.alamat}
                onChange={(e) => handleChange("alamat", e.target.value)}
                rows={2}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nominal Investasi (Rp)</label>
              <input
                type="text"
                value={form.totalInvestasi}
                onChange={(e) => handleChange("totalInvestasi", e.target.value)}
                placeholder="cth: 10000000"
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Dokumen KYC */}
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h4 className="font-bold text-[var(--ink)] mb-4">Checklist Dokumen</h4>
          <div className="space-y-3">
            {KYC_ITEMS.map((item) => (
              <label
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  form[item.key as keyof KycForm]
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form[item.key as keyof KycForm] as boolean}
                  onChange={(e) => handleChange(item.key, e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-tosca focus:ring-tosca"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    {item.required && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Wajib</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                {form[item.key as keyof KycForm] && (
                  <span className="text-green-500 text-lg">✓</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-tosca to-emerald-600 hover:shadow-lg"
          }`}
        >
          {saving ? "Menyimpan..." : "📋 Submit KYC"}
        </button>
      </form>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
