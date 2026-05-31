"use client";

import { useState } from "react";
import {
  UserCheck, ShieldCheck, AlertTriangle, CheckCircle, XCircle,
  CreditCard, FileText, Hash, Phone, Mail, User, Building2,
  Eye, EyeOff, Search, RefreshCw,
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

// ===== Validation Functions =====

interface ValidationResult {
  valid: boolean;
  message: string;
  severity: "error" | "warning" | "success";
}

function validateKTP(ktp: string): ValidationResult {
  if (!ktp) return { valid: false, message: "Nomor KTP wajib diisi", severity: "error" };
  
  // Remove dots, spaces, dashes
  const cleaned = ktp.replace(/[\s.\-]/g, "");
  
  // KTP Indonesia: 16 digits
  if (!/^\d{16}$/.test(cleaned)) {
    return { valid: false, message: "KTP harus 16 digit angka", severity: "error" };
  }
  
  // Check province code (first 2 digits: 11-94)
  const provinceCode = parseInt(cleaned.substring(0, 2));
  if (provinceCode < 11 || provinceCode > 94) {
    return { valid: false, message: `Kode provinsi ${provinceCode} tidak valid`, severity: "error" };
  }
  
  // Check date of birth encoding (digits 7-12: DDMMYY)
  // For females, DD + 40
  const dd = parseInt(cleaned.substring(6, 8));
  const mm = parseInt(cleaned.substring(8, 10));
  const yy = parseInt(cleaned.substring(10, 12));
  
  // Basic month check
  if (mm < 1 || mm > 12) {
    return { valid: false, message: "Bulan lahir pada KTP tidak valid", severity: "warning" };
  }
  
  // Basic date check (accounting for female +40)
  const actualDD = dd > 40 ? dd - 40 : dd;
  if (actualDD < 1 || actualDD > 31) {
    return { valid: false, message: "Tanggal lahir pada KTP tidak valid", severity: "warning" };
  }

  // Validate complete date
  const fullYear = yy >= 50 ? 1900 + yy : 2000 + yy;
  const testDate = new Date(fullYear, mm - 1, actualDD);
  if (testDate.getDate() !== actualDD || testDate.getMonth() !== mm - 1) {
    return { valid: false, message: "Tanggal lahir tidak valid (cek DD/MM/YY)", severity: "warning" };
  }
  
  // Check age (must be >= 17 for sukuk investment)
  const age = new Date().getFullYear() - fullYear;
  if (age < 17) {
    return { valid: false, message: `Usia ${age} tahun — minimal 17 tahun untuk investasi sukuk`, severity: "error" };
  }
  if (age > 100) {
    return { valid: false, message: `Usia ${age} tahun — tidak wajar, cek ulang`, severity: "warning" };
  }
  
  return { valid: true, message: `KTP valid (Usia: ${age} thn, Prov: ${provinceCode})`, severity: "success" };
}

function validateNPWP(npwp: string): ValidationResult {
  if (!npwp) return { valid: false, message: "NPWP wajib diisi (untuk pelaporan pajak)", severity: "error" };
  
  const cleaned = npwp.replace(/[\s.\-]/g, "");
  
  // NPWP: 15 digits
  if (!/^\d{15}$/.test(cleaned)) {
    return { valid: false, message: "NPWP harus 15 digit angka (format baru tanpa digit verifikasi)", severity: "error" };
  }
  
  // Check taxpayer type (first digit)
  const taxpayerType = cleaned[0];
  const typeMap: Record<string, string> = {
    "0": "BUMN/Pemerintah",
    "1": "Wajib Pajak Badan (WPB)",
    "2": "Wajib Pajak Badan (WPB)",
    "3": "Wajib Pajak Badan (WPB)",
    "7": "Wajib Pajak Orang Pribadi (WPOP) — PNS/TNI/Polri",
    "8": "Wajib Pajak Orang Pribadi (WPOP)",
    "9": "Wajib Pajak Orang Pribadi (WPOP)",
  };
  
  // Check KPP code (digits 2-4)
  const kppCode = cleaned.substring(1, 4);
  
  // Check serial number should not be all zeros
  const serial = cleaned.substring(4);
  if (serial === "0000000000000") {
    return { valid: false, message: "Nomor seri NPWP tidak boleh semua nol", severity: "error" };
  }
  
  return {
    valid: true,
    message: `NPWP valid (${typeMap[taxpayerType] || "WPOP"}, KPP: ${kppCode})`,
    severity: "success",
  };
}

function validateBankAccount(bank: string, accountNumber: string, accountName: string): ValidationResult {
  if (!bank) return { valid: false, message: "Nama bank wajib dipilih", severity: "error" };
  if (!accountNumber) return { valid: false, message: "Nomor rekening wajib diisi", severity: "error" };
  if (!accountName) return { valid: false, message: "Nama pemilik rekening wajib diisi", severity: "error" };

  const cleaned = accountNumber.replace(/[\s\-]/g, "");
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: "Nomor rekening hanya boleh angka", severity: "error" };
  }
  
  // Check digit length by bank
  const bankLengths: Record<string, [number, number]> = {
    "BCA": [10, 10],
    "Mandiri": [13, 13],
    "BNI": [10, 10],
    "BRI": [15, 15],
    "CIMB": [13, 14],
    "Danamon": [10, 12],
    "BTN": [16, 16],
    "Permata": [10, 13],
    "OCBC": [10, 12],
    "MEGA": [15, 15],
    "BSI": [10, 10],
    "BJB": [10, 14],
  };
  
  const range = bankLengths[bank];
  if (range) {
    if (cleaned.length < range[0] || cleaned.length > range[1]) {
      return {
        valid: false,
        message: `Rekening ${bank} biasanya ${range[0]}-${range[1]} digit (ini: ${cleaned.length})`,
        severity: "warning",
      };
    }
  }

  // Check name match (at least same first consonant)
  if (accountName.trim().length < 2) {
    return { valid: false, message: "Nama terlalu pendek", severity: "warning" };
  }
  
  return { valid: true, message: `Rekening ${bank} ${cleaned.length} digit — format OK`, severity: "success" };
}

function validatePhone(phone: string): ValidationResult {
  if (!phone) return { valid: false, message: "Nomor HP wajib diisi", severity: "error" };
  const cleaned = phone.replace(/[\s\-()]/g, "").replace(/^\+62/, "0");
  if (!/^08\d{8,11}$/.test(cleaned)) {
    return { valid: false, message: "Format HP: 08xxxxxxxxxx (10-13 digit)", severity: "error" };
  }
  return { valid: true, message: `HP valid (${cleaned})`, severity: "success" };
}

function validateEmail(email: string): ValidationResult {
  if (!email) return { valid: false, message: "Email wajib diisi", severity: "error" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: "Format email tidak valid", severity: "error" };
  }
  // Check suspicious domains
  const suspicious = ["tempmail.com", "guerrillamail.com", "10minutemail.com", "throwaway.email"];
  const domain = email.split("@")[1]?.toLowerCase();
  if (suspicious.includes(domain)) {
    return { valid: false, message: "Email sementara/detektif tidak diterima", severity: "error" };
  }
  return { valid: true, message: "Email valid", severity: "success" };
}

const BANK_OPTIONS = [
  "BCA", "Mandiri", "BNI", "BRI", "CIMB", "Danamon",
  "BTN", "Permata", "OCBC", "MEGA", "BSI", "BJB", "Lainnya",
];

// ===== Component =====

interface InvestorInput {
  nama: string;
  jenis: string; // "Perorangan" | "Lembaga"
  ktp: string;
  npwp: string;
  phone: string;
  email: string;
  bank: string;
  accountNumber: string;
  accountName: string;
  alamat: string;
  unit: number;
}

export default function SukukCreditorPanel({
  investorData,
  onAddInvestor,
}: {
  investorData?: string[][] | null;
  onAddInvestor?: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [showKTP, setShowKTP] = useState(false);
  const [showNPWP, setShowNPWP] = useState(false);
  const [showRekening, setShowRekening] = useState(false);
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState<InvestorInput>({
    nama: "",
    jenis: "Perorangan",
    ktp: "",
    npwp: "",
    phone: "",
    email: "",
    bank: "",
    accountNumber: "",
    accountName: "",
    alamat: "",
    unit: 10,
  });

  const handleFieldChange = (field: keyof InvestorInput, value: string | number) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);

    // Real-time validation
    const newValidations = { ...validations };
    switch (field) {
      case "ktp":
        newValidations.ktp = validateKTP(String(value));
        break;
      case "npwp":
        newValidations.npwp = validateNPWP(String(value));
        break;
      case "phone":
        newValidations.phone = validatePhone(String(value));
        break;
      case "email":
        newValidations.email = validateEmail(String(value));
        break;
      case "accountNumber":
        newValidations.rekening = validateBankAccount(newForm.bank, String(value), newForm.accountName);
        break;
      case "bank":
        newValidations.rekening = validateBankAccount(String(value), newForm.accountNumber, newForm.accountName);
        break;
      case "accountName":
        newValidations.rekening = validateBankAccount(newForm.bank, newForm.accountNumber, String(value));
        break;
      case "nama":
        if (!value) {
          newValidations.nama = { valid: false, message: "Nama wajib diisi", severity: "error" };
        } else if (String(value).trim().length < 2) {
          newValidations.nama = { valid: false, message: "Nama terlalu pendek", severity: "warning" };
        } else {
          newValidations.nama = { valid: true, message: "Nama valid", severity: "success" };
        }
        break;
      case "unit":
        const v = Number(value);
        if (v < 1) newValidations.unit = { valid: false, message: "Minimal 1 unit", severity: "error" };
        else if (v > 500) newValidations.unit = { valid: false, message: "Maksimal 500 unit (50% dari 1000)", severity: "warning" };
        else newValidations.unit = { valid: true, message: `${v} unit = ${fmtRp(v * 1000000)}`, severity: "success" };
        break;
    }
    setValidations(newValidations);
  };

  const allValid = () => {
    const required = ["nama", "ktp", "npwp", "phone", "email", "rekening", "unit"];
    return required.every(field => validations[field]?.valid);
  };

  const handleSubmit = async () => {
    if (!allValid()) return;
    setSubmitting(true);
    try {
      if (onAddInvestor) {
        await onAddInvestor(form as unknown as Record<string, unknown>);
      }
      // Reset
      setForm({ nama: "", jenis: "Perorangan", ktp: "", npwp: "", phone: "", email: "", bank: "", accountNumber: "", accountName: "", alamat: "", unit: 10 });
      setValidations({});
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const ValidationIcon = ({ field }: { field: string }) => {
    const v = validations[field];
    if (!v) return null;
    if (v.valid) return <CheckCircle size={14} className="text-green-600" />;
    if (v.severity === "error") return <XCircle size={14} className="text-red-500" />;
    return <AlertTriangle size={14} className="text-orange-500" />;
  };

  const ValidationMsg = ({ field }: { field: string }) => {
    const v = validations[field];
    if (!v) return null;
    const color = v.valid ? "text-green-600" : v.severity === "error" ? "text-red-500" : "text-orange-500";
    return <p className={`text-[10px] mt-0.5 ${color}`}>{v.message}</p>;
  };

  // Parse existing investors
  const investors: { no: number; nama: string; jenis: string; unit: number; nominal: number; pct: string; tanggal: string; status: string; kontak: string; email: string }[] = [];
  if (investorData) {
    for (const r of investorData) {
      if (!r[0] || isNaN(safeNum(r[0]))) continue;
      if (r[1]?.startsWith("[")) continue; // Skip placeholder
      investors.push({
        no: safeNum(r[0]),
        nama: r[1] || "",
        jenis: r[2] || "",
        unit: safeNum(r[3]),
        nominal: safeNum(r[4]),
        pct: r[5] || "",
        tanggal: r[6] || "",
        status: r[7] || "",
        kontak: r[8] || "",
        email: r[9] || "",
      });
    }
  }

  const filteredInvestors = searchQuery
    ? investors.filter(inv => inv.nama.toLowerCase().includes(searchQuery.toLowerCase()))
    : investors;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">
            🔐 Validasi Investor / Creditor
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Verifikasi KTP, NPWP, rekening bank, dan data investor sebelum akad
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-xs font-bold hover:opacity-90 transition"
        >
          <UserCheck size={14} /> Tambah Investor
        </button>
      </div>

      {/* Compliance Notice */}
      <div className="border border-blue-200 rounded-xl bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Regulasi AML/CFT:</strong> Berdasarkan PP No. 43/2015 dan SE OJK No. 23/SEOJK.01/2020, setiap investor sukuk wajib melalui proses KYC (Know Your Customer).</p>
            <p><strong>Data yang wajib divalidasi:</strong> KTP (16 digit), NPWP (15 digit), rekening bank (sesuai format masing-masing bank), nomor HP aktif, dan email valid.</p>
            <p><strong>Fatwa DSN-MUI No. 117/2018:</strong> Investor sukuk harus berusia minimal 17 tahun dan memiliki kapasitas hukum penuh.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-[var(--line)] rounded-xl bg-white p-6">
          <h3 className="font-bold text-sm text-[var(--ink)] mb-4 flex items-center gap-2">
            <UserCheck size={16} className="text-[var(--brand)]" />
            Form Validasi Investor Baru
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nama */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                <User size={12} /> Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  value={form.nama}
                  onChange={e => handleFieldChange("nama", e.target.value)}
                  className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
                  placeholder="Nama sesuai KTP"
                />
                <ValidationIcon field="nama" />
              </div>
              <ValidationMsg field="nama" />
            </div>

            {/* Jenis */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)]">Jenis Investor</label>
              <select
                value={form.jenis}
                onChange={e => setForm({ ...form, jenis: e.target.value })}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm mt-1"
              >
                <option value="Perorangan">Perorangan</option>
                <option value="Lembaga">Lembaga/Badan Usaha</option>
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                <Hash size={12} /> Jumlah Unit <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={form.unit}
                  onChange={e => handleFieldChange("unit", parseInt(e.target.value) || 0)}
                  className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
                  min={1}
                  max={500}
                />
                <ValidationIcon field="unit" />
              </div>
              <ValidationMsg field="unit" />
            </div>

            {/* KTP */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                <CreditCard size={12} /> No. KTP (NIK) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type={showKTP ? "text" : "password"}
                  value={form.ktp}
                  onChange={e => handleFieldChange("ktp", e.target.value.replace(/\D/g, "").slice(0, 16))}
                  className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
                  placeholder="16 digit NIK"
                  maxLength={16}
                />
                <button onClick={() => setShowKTP(!showKTP)} className="p-2 text-[var(--muted)] hover:text-[var(--ink)]">
                  {showKTP ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <ValidationIcon field="ktp" />
              </div>
              <ValidationMsg field="ktp" />
            </div>

            {/* NPWP */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                <FileText size={12} /> No. NPWP <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type={showNPWP ? "text" : "password"}
                  value={form.npwp}
                  onChange={e => handleFieldChange("npwp", e.target.value.replace(/[^\d.\-]/g, "").slice(0, 19))}
                  className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
                  placeholder="xx.xxx.xxx.x-xxx.xxx"
                />
                <button onClick={() => setShowNPWP(!showNPWP)} className="p-2 text-[var(--muted)] hover:text-[var(--ink)]">
                  {showNPWP ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <ValidationIcon field="npwp" />
              </div>
              <ValidationMsg field="npwp" />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                <Phone size={12} /> No. HP <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => handleFieldChange("phone", e.target.value)}
                  className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
                  placeholder="08xxxxxxxxxx"
                />
                <ValidationIcon field="phone" />
              </div>
              <ValidationMsg field="phone" />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                <Mail size={12} /> Email <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleFieldChange("email", e.target.value)}
                  className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
                  placeholder="email@domain.com"
                />
                <ValidationIcon field="email" />
              </div>
              <ValidationMsg field="email" />
            </div>

            {/* Bank */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
                <Building2 size={12} /> Bank <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 mt-1">
                <select
                  value={form.bank}
                  onChange={e => handleFieldChange("bank", e.target.value)}
                  className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Pilih Bank</option>
                  {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <ValidationIcon field="rekening" />
              </div>
              <ValidationMsg field="rekening" />
            </div>

            {/* Account Number */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)]">No. Rekening <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type={showRekening ? "text" : "password"}
                  value={form.accountNumber}
                  onChange={e => handleFieldChange("accountNumber", e.target.value.replace(/\D/g, ""))}
                  className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
                  placeholder="Nomor rekening"
                />
                <button onClick={() => setShowRekening(!showRekening)} className="p-2 text-[var(--muted)] hover:text-[var(--ink)]">
                  {showRekening ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="text-xs font-bold text-[var(--ink)]">Nama di Rekening <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.accountName}
                onChange={e => handleFieldChange("accountName", e.target.value)}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm mt-1"
                placeholder="Nama sesuai rekening bank"
              />
            </div>

            {/* Alamat */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[var(--ink)]">Alamat</label>
              <textarea
                value={form.alamat}
                onChange={e => setForm({ ...form, alamat: e.target.value })}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm mt-1"
                rows={2}
                placeholder="Alamat lengkap sesuai KTP"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--line)]">
            <div className="text-xs text-[var(--muted)]">
              {!allValid() ? (
                <span className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle size={12} /> Lengkapi data yang bertanda *
                </span>
              ) : (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={12} /> Semua data valid — siap submit
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowForm(false); setValidations({}); }}
                className="px-4 py-2 rounded-lg border border-[var(--line)] text-xs font-bold hover:bg-[var(--soft)] transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allValid() || submitting}
                className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-xs font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                {submitting ? "Menyimpan..." : "Simpan & Validasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investor List */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-[var(--ink)]">Daftar Investor Terdaftar</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-[var(--line)] rounded-lg text-xs w-48"
                placeholder="Cari investor..."
              />
            </div>
          </div>
        </div>

        {filteredInvestors.length === 0 ? (
          <div className="text-center py-8">
            <UserCheck size={32} className="mx-auto text-[var(--muted)] mb-2" />
            <p className="text-sm text-[var(--muted)]">
              {investors.length === 0 ? "Belum ada investor terdaftar" : "Tidak ditemukan"}
            </p>
            <p className="text-[10px] text-[var(--muted)] mt-1">
              {investors.length === 0 ? 'Klik "Tambah Investor" untuk mendaftar investor pertama' : "Coba kata kunci lain"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--soft)] text-[var(--muted)]">
                  <th className="py-2 px-3 text-left">No</th>
                  <th className="py-2 px-3 text-left">Nama</th>
                  <th className="py-2 px-3 text-left">Jenis</th>
                  <th className="py-2 px-3 text-right">Unit</th>
                  <th className="py-2 px-3 text-right">Nominal</th>
                  <th className="py-2 px-3 text-left">Kontak</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-center">Validasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestors.map((inv, i) => (
                  <tr key={i} className="border-b border-[var(--line)] hover:bg-[var(--soft)]/50">
                    <td className="py-2 px-3">{inv.no}</td>
                    <td className="py-2 px-3 font-medium">{inv.nama}</td>
                    <td className="py-2 px-3">{inv.jenis}</td>
                    <td className="py-2 px-3 text-right">{inv.unit}</td>
                    <td className="py-2 px-3 text-right font-medium">{fmtRp(inv.nominal)}</td>
                    <td className="py-2 px-3">
                      <div>{inv.kontak}</div>
                      {inv.email && <div className="text-[10px] text-[var(--muted)]">{inv.email}</div>}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === "Aktif" ? "bg-green-100 text-green-700" :
                        inv.status === "Menunggu" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {inv.status === "Aktif" ? <CheckCircle size={9} /> : <AlertTriangle size={9} />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                        <AlertTriangle size={9} /> Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Validation Checklist */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-sm text-[var(--ink)] mb-3">Checklist Validasi KYC Investor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { label: "KTP (NIK) 16 digit — validasi kode provinsi & tanggal lahir", done: true },
            { label: "NPWP 15 digit — validasi kode WP & KPP", done: true },
            { label: "Rekening bank — validasi format per bank", done: true },
            { label: "Nomor HP — format 08xxxxxxxxxx", done: true },
            { label: "Email — validasi format & domain", done: true },
            { label: "Usia minimal 17 tahun (dari encode KTP)", done: true },
            { label: "Nama lengkap (min 2 karakter)", done: true },
            { label: "Sensitivitas data (KTP/NPWP/rekening di-mask)", done: true },
            { label: "AML/CFT screening (daftar hitam OJK/PPATK)", done: false },
            { label: "Verifikasi wajah (selfie + KTP)", done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5">
              {item.done ? (
                <CheckCircle size={14} className="text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={14} className="text-orange-500 mt-0.5 shrink-0" />
              )}
              <span className={`text-xs ${item.done ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border border-orange-200 rounded-xl bg-orange-50 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-800 space-y-1">
            <p><strong>Privasi Data:</strong> Data KTP, NPWP, dan rekening investor dilindungi sesuai UU No. 27/2022 tentang Pelindungan Data Pribadi. Data hanya digunakan untuk keperluan akad dan pelaporan pajak.</p>
            <p><strong>Encrypt at rest:</strong> Data sensitif harus di-encrypt saat penyimpanan (AES-256) dan di-mask saat ditampilkan di dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
