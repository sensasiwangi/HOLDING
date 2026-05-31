"use client";

import { useState } from "react";
import {
  Building2, TrendingUp, DollarSign, ArrowRight, Shield, Star,
  CheckCircle, AlertTriangle, XCircle, Eye, EyeOff, User, Mail,
  Phone, CreditCard, FileText, Hash, Home, Send, Loader2,
  Users, Award, Target, Clock,
} from "lucide-react";
import Link from "next/link";

// ===== Validation Functions =====
interface ValResult { valid: boolean; message: string; severity: "error" | "warning" | "success"; }

function validateKTP(ktp: string): ValResult {
  if (!ktp) return { valid: false, message: "Nomor KTP wajib diisi", severity: "error" };
  const cleaned = ktp.replace(/[\s.\-]/g, "");
  if (!/^\d{16}$/.test(cleaned)) return { valid: false, message: "KTP harus 16 digit", severity: "error" };
  const prov = parseInt(cleaned.substring(0, 2));
  if (prov < 11 || prov > 94) return { valid: false, message: `Kode provinsi ${prov} tidak valid`, severity: "error" };
  const dd = parseInt(cleaned.substring(6, 8));
  const mm = parseInt(cleaned.substring(8, 10));
  const yy = parseInt(cleaned.substring(10, 12));
  if (mm < 1 || mm > 12) return { valid: false, message: "Bulan lahir tidak valid", severity: "warning" };
  const actualDD = dd > 40 ? dd - 40 : dd;
  if (actualDD < 1 || actualDD > 31) return { valid: false, message: "Tanggal lahir tidak valid", severity: "warning" };
  const fullYear = yy >= 50 ? 1900 + yy : 2000 + yy;
  const age = new Date().getFullYear() - fullYear;
  if (age < 17) return { valid: false, message: `Usia ${age} thn — minimal 17 tahun`, severity: "error" };
  return { valid: true, message: `KTP valid (usia ${age} thn)`, severity: "success" };
}

function validateNPWP(v: string): ValResult {
  if (!v) return { valid: false, message: "NPWP wajib diisi", severity: "error" };
  const c = v.replace(/[\s.\-]/g, "");
  if (!/^\d{15}$/.test(c)) return { valid: false, message: "NPWP harus 15 digit", severity: "error" };
  return { valid: true, message: "NPWP valid", severity: "success" };
}

function validatePhone(v: string): ValResult {
  if (!v) return { valid: false, message: "No. HP wajib diisi", severity: "error" };
  const c = v.replace(/[\s\-()]/g, "").replace(/^\+62/, "0");
  if (!/^08\d{8,11}$/.test(c)) return { valid: false, message: "Format: 08xxxxxxxxxx", severity: "error" };
  return { valid: true, message: "HP valid", severity: "success" };
}

function validateEmail(v: string): ValResult {
  if (!v) return { valid: false, message: "Email wajib diisi", severity: "error" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { valid: false, message: "Format email salah", severity: "error" };
  return { valid: true, message: "Email valid", severity: "success" };
}

function validateBank(bank: string, num: string, name: string): ValResult {
  if (!bank) return { valid: false, message: "Pilih bank", severity: "error" };
  if (!num) return { valid: false, message: "No. rekening wajib", severity: "error" };
  if (!name) return { valid: false, message: "Nama di rekening wajib", severity: "error" };
  const c = num.replace(/[\s\-]/g, "");
  if (!/^\d+$/.test(c)) return { valid: false, message: "Rekening hanya angka", severity: "error" };
  const lens: Record<string, [number, number]> = { "BCA": [10,10], "Mandiri": [13,13], "BNI": [10,10], "BRI": [15,15], "BSI": [10,10], "CIMB": [13,14] };
  const r = lens[bank];
  if (r && (c.length < r[0] || c.length > r[1])) return { valid: false, message: `${bank} biasanya ${r[0]}-${r[1]} digit`, severity: "warning" };
  return { valid: true, message: `${bank} — ${c.length} digit OK`, severity: "success" };
}

const BANKS = ["BCA","Mandiri","BNI","BRI","CIMB","Danamon","BTN","Permata","OCBC","MEGA","BSI","BJB","Lainnya"];
const NILAI_SUKUK = 1_000_000_000;
const HARGA_UNIT = 1_000_000;
const MAX_UNIT = 500;

export default function InvestorPage() {
  const [showKTP, setShowKTP] = useState(false);
  const [showNPWP, setShowNPWP] = useState(false);
  const [showRek, setShowRek] = useState(false);
  const [vals, setVals] = useState<Record<string, ValResult>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const [form, setForm] = useState({
    nama: "", jenis: "Perorangan", ktp: "", npwp: "", phone: "", email: "",
    bank: "", rekNum: "", rekName: "", alamat: "", unit: 10,
  });

  const unitPrice = form.unit * HARGA_UNIT;
  const pct = (unitPrice / NILAI_SUKUK * 100).toFixed(3);

  const change = (field: string, value: string | number) => {
    const nf = { ...form, [field]: value };
    setForm(nf);
    const nv = { ...vals };
    switch (field) {
      case "nama": nv.nama = !value ? { valid: false, message: "Nama wajib", severity: "error" } : { valid: true, message: "OK", severity: "success" }; break;
      case "ktp": nv.ktp = validateKTP(String(value)); break;
      case "npwp": nv.npwp = validateNPWP(String(value)); break;
      case "phone": nv.phone = validatePhone(String(value)); break;
      case "email": nv.email = validateEmail(String(value)); break;
      case "rekNum": case "bank": case "rekName":
        nv.rek = validateBank(nf.bank, nf.rekNum, nf.rekName); break;
      case "unit":
        const u = Number(value);
        nv.unit = u < 1 ? { valid: false, message: "Min 1 unit", severity: "error" }
          : u > MAX_UNIT ? { valid: false, message: `Max ${MAX_UNIT} unit`, severity: "warning" }
          : { valid: true, message: `${u} unit = Rp ${(u*HARGA_UNIT/1_000_000).toFixed(0)}jt`, severity: "success" };
        break;
    }
    setVals(nv);
  };

  const allValid = ["nama","ktp","npwp","phone","email","rek","unit"].every(f => vals[f]?.valid);

  const submit = async () => {
    if (!allValid) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch("/api/investor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          nominal: unitPrice,
          pct: pct + "%",
          tanggal: new Date().toISOString().split("T")[0],
          status: "Menunggu",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitResult({ success: true, message: "Pendaftaran berhasil! Tim kami akan menghubungi Anda untuk verifikasi KYC dalam 1x24 jam." });
        setForm({ nama: "", jenis: "Perorangan", ktp: "", npwp: "", phone: "", email: "", bank: "", rekNum: "", rekName: "", alamat: "", unit: 10 });
        setVals({});
      } else {
        setSubmitResult({ success: false, message: data.error || "Gagal mendaftar. Silakan coba lagi." });
      }
    } catch {
      setSubmitResult({ success: false, message: " jaringan error. Cek koneksi Anda." });
    }
    setSubmitting(false);
  };

  const VI = ({ f }: { f: string }) => {
    const v = vals[f];
    if (!v) return null;
    return v.valid ? <CheckCircle size={14} className="text-green-500 shrink-0" />
      : v.severity === "error" ? <XCircle size={14} className="text-red-500 shrink-0" />
      : <AlertTriangle size={14} className="text-yellow-500 shrink-0" />;
  };
  const VM = ({ f }: { f: string }) => {
    const v = vals[f];
    if (!v) return null;
    return <p className={`text-[10px] mt-0.5 ${v.valid ? "text-green-600" : v.severity === "error" ? "text-red-500" : "text-yellow-600"}`}>{v.message}</p>;
  };

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-20 left-0 w-96 h-96 rounded-full bg-[#c9a84c]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#0D9488]/10 blur-[100px]" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Star size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-[#8aae9e] uppercase tracking-wider">Sukuk Musyarakah</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-[#0D9488] to-[#5EEAD4] bg-clip-text text-transparent">Investasi Syariah</span>
            <br />
            <span className="text-gradient-orange">SWI Store TIM</span>
          </h1>
          <p className="text-lg text-[#7a9e8f] max-w-2xl">
            Sukuk Musyarakah — Bagi hasil 50:50, tanpa bunga, 100% syariah. Modal dari Rp 10jt (1 unit). Buka parfum store di Trans Studio Mall Bandung.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Target size={18} />, label: "Target Pendanaan", value: "Rp 1 Miliar", color: "text-teal-400" },
            { icon: <DollarSign size={18} />, label: "Harga per Unit", value: "Rp 10 Juta", color: "text-orange-400" },
            { icon: <TrendingUp size={18} />, label: "Nisbah", value: "50:50", color: "text-emerald-400" },
            { icon: <Clock size={18} />, label: "Tenor", value: "3 Tahun", color: "text-blue-400" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-xs text-[#5a7a6a]">{s.label}</div>
                <div className={`text-sm font-extrabold ${s.color}`}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-5 gap-8">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Award size={18} className="text-orange-400" /> Keunggulan</h3>
            <div className="space-y-3">
              {[
                "✅ 100% syariah — tanpa bunga (riba)",
                "✅ Bagi hasil 50:50 sesuai nisbah akad",
                "✅ Bisa mulai dari 1 unit (Rp 10jt)",
                "✅ Pengelolaan profesional oleh SWI Holding",
                "✅ Underlying asset jelas: parfum store di TIM",
                "✅ Supervisi Dewan Pengawas Syariah",
                "✅ Laporan keuangan transparan bulanan",
                "✅ Potensi yield 8-12% p.a. (estimasi)",
              ].map((t, i) => (
                <p key={i} className="text-sm text-[#8aae9e]">{t}</p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={18} className="text-teal-400" /> Siapa yang Boleh Investasi?</h3>
            <div className="space-y-2 text-sm text-[#8aae9e]">
              <p>👤 <strong className="text-white">Perorangan</strong> — Warga Negara Indonesia, minimal 17 tahun, memiliki KTP & NPWP</p>
              <p>🏢 <strong className="text-white">Lembaga</strong> — PT, Yayasan, atau koperasi yang memiliki NPWP badan</p>
              <p className="text-[#5a7a6a] text-xs mt-3">* Wajib melalui proses KYC sebelum akad ditandatangani</p>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-yellow-400"><AlertTriangle size={16} /> Risiko</h3>
            <ul className="text-xs text-yellow-200/80 space-y-1">
              <li>• Kerugian ditanggung oleh investor sesuai porsi modal</li>
              <li>• Bagi hasil tidak fixed — tergantung kinerja bisnis</li>
              <li>• Sukuk tidak bisa dicairkan sewaktu-waktu (lock-up 1 tahun)</li>
              <li>• Bukan produk perbankan, tidak dijamin LPS</li>
            </ul>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Send size={18} className="text-[#0D9488]" /> Formulir Pendaftaran</h3>
            <p className="text-xs text-[#5a7a6a] mb-6">Data Anda akan diverifikasi tim SWI sebelum akad. Field wajib bertanda *</p>

            {submitResult && (
              <div className={`rounded-xl p-4 mb-6 flex items-start gap-3 ${submitResult.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                {submitResult.success ? <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" /> : <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <div className={`text-sm font-bold ${submitResult.success ? "text-green-400" : "text-red-400"}`}>
                    {submitResult.success ? "Berhasil!" : "Gagal"}
                  </div>
                  <div className={`text-xs mt-1 ${submitResult.success ? "text-green-300/80" : "text-red-300/80"}`}>{submitResult.message}</div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Nama */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-[#8aae9e] flex items-center gap-1"><User size={12} /> Nama Lengkap *</label>
                <div className="flex items-center gap-1 mt-1">
                  <input value={form.nama} onChange={e => change("nama", e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#0D9488] focus:outline-none" placeholder="Nama sesuai KTP" />
                  <VI f="nama" />
                </div>
                <VM f="nama" />
              </div>

              {/* Jenis */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e]">Jenis Investor</label>
                <select value={form.jenis} onChange={e => setForm({...form, jenis: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-1 focus:border-[#0D9488] focus:outline-none">
                  <option value="Perorangan">Perorangan</option>
                  <option value="Lembaga">Lembaga / Badan Usaha</option>
                </select>
              </div>

              {/* Unit */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e] flex items-center gap-1"><Hash size={12} /> Jumlah Unit * (1 unit = Rp 10jt)</label>
                <div className="flex items-center gap-1 mt-1">
                  <input type="number" value={form.unit} onChange={e => change("unit", parseInt(e.target.value)||0)} min={1} max={MAX_UNIT} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#0D9488] focus:outline-none" />
                  <VI f="unit" />
                </div>
                <VM f="unit" />
                {form.unit > 0 && (
                  <div className="mt-2 p-2 rounded-lg bg-white/5 text-xs">
                    <span className="text-[#5a7a6a]">Total investasi: </span>
                    <span className="text-[#0D9488] font-bold">Rp {(unitPrice).toLocaleString("id-ID")}</span>
                    <span className="text-[#5a7a6a]"> ({pct}% dari sukuk)</span>
                  </div>
                )}
              </div>

              {/* KTP */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e] flex items-center gap-1"><CreditCard size={12} /> No. KTP (NIK) *</label>
                <div className="flex items-center gap-1 mt-1">
                  <input type={showKTP?"text":"password"} value={form.ktp} onChange={e => change("ktp", e.target.value.replace(/\D/g,"").slice(0,16))} maxLength={16} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#0D9488] focus:outline-none" placeholder="16 digit NIK" />
                  <button onClick={() => setShowKTP(!showKTP)} className="p-2 text-[#5a7a6a] hover:text-white">{showKTP ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                  <VI f="ktp" />
                </div>
                <VM f="ktp" />
              </div>

              {/* NPWP */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e] flex items-center gap-1"><FileText size={12} /> No. NPWP *</label>
                <div className="flex items-center gap-1 mt-1">
                  <input type={showNPWP?"text":"password"} value={form.npwp} onChange={e => change("npwp", e.target.value.slice(0,19))} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#0D9488] focus:outline-none" placeholder="xx.xxx.xxx.x-xxx.xxx" />
                  <button onClick={() => setShowNPWP(!showNPWP)} className="p-2 text-[#5a7a6a] hover:text-white">{showNPWP ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                  <VI f="npwp" />
                </div>
                <VM f="npwp" />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e] flex items-center gap-1"><Phone size={12} /> No. HP *</label>
                <div className="flex items-center gap-1 mt-1">
                  <input type="tel" value={form.phone} onChange={e => change("phone", e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#0D9488] focus:outline-none" placeholder="08xxxxxxxxxx" />
                  <VI f="phone" />
                </div>
                <VM f="phone" />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e] flex items-center gap-1"><Mail size={12} /> Email *</label>
                <div className="flex items-center gap-1 mt-1">
                  <input type="email" value={form.email} onChange={e => change("email", e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#0D9488] focus:outline-none" placeholder="email@domain.com" />
                  <VI f="email" />
                </div>
                <VM f="email" />
              </div>

              {/* Bank */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e] flex items-center gap-1"><Building2 size={12} /> Bank *</label>
                <div className="flex items-center gap-1 mt-1">
                  <select value={form.bank} onChange={e => change("bank", e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white mt-0 focus:border-[#0D9488] focus:outline-none">
                    <option value="">Pilih Bank</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <VI f="rek" />
                </div>
                <VM f="rek" />
              </div>

              {/* Rekening */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e]">No. Rekening *</label>
                <div className="flex items-center gap-1 mt-1">
                  <input type={showRek?"text":"password"} value={form.rekNum} onChange={e => change("rekNum", e.target.value.replace(/\D/g,""))} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#0D9488] focus:outline-none" placeholder="Nomor rekening" />
                  <button onClick={() => setShowRek(!showRek)} className="p-2 text-[#5a7a6a] hover:text-white">{showRek ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                </div>
              </div>

              {/* Rek Name */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e]">Nama di Rekening *</label>
                <input value={form.rekName} onChange={e => change("rekName", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 mt-1 focus:border-[#0D9488] focus:outline-none" placeholder="Nama sesuai rekening" />
              </div>

              {/* Alamat */}
              <div>
                <label className="text-xs font-bold text-[#8aae9e] flex items-center gap-1"><Home size={12} /> Alamat</label>
                <textarea value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 mt-1 focus:border-[#0D9488] focus:outline-none" placeholder="Alamat lengkap" />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#0D9488]/10 to-transparent border border-[#0D9488]/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-[#5a7a6a]">Unit</div>
                  <div className="text-lg font-extrabold text-[#0D9488]">{form.unit}</div>
                </div>
                <div>
                  <div className="text-xs text-[#5a7a6a]">Total Investasi</div>
                  <div className="text-lg font-extrabold text-orange-400">Rp {(unitPrice/1_000_000).toFixed(0)}jt</div>
                </div>
                <div>
                  <div className="text-xs text-[#5a7a6a]">Portofolio</div>
                  <div className="text-lg font-extrabold text-white">{pct}%</div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-[#5a7a6a]">
                {!allValid ? (
                  <span className="flex items-center gap-1 text-yellow-500"><AlertTriangle size={12} /> Lengkapi data bertanda *</span>
                ) : (
                  <span className="flex items-center gap-1 text-green-500"><CheckCircle size={12} /> Data valid — siap submit</span>
                )}
              </div>
              <button onClick={submit} disabled={!allValid||submitting} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white font-bold text-sm hover:shadow-lg hover:shadow-[#0D9488]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Mengirim...</> : <><Send size={14} /> Daftar Sekarang</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-4">
            <span className="bg-gradient-to-r from-[#0D9488] to-[#5EEAD4] bg-clip-text text-transparent">Pertanyaan?</span>
          </h2>
          <p className="text-[#7a9e8f] mb-8 max-w-lg mx-auto">
            Hubungi tim SWI untuk informasi lebih lanjut, proposal lengkap, dan data room.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:sensasiwangi.id@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white font-bold text-sm">
              <Mail size={16} /> Email Tim SWI
            </a>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition">
              <Shield size={16} /> Dashboard Internal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
