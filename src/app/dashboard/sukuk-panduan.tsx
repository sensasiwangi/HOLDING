"use client";

import { useState } from "react";
import {
  BookOpen, CheckCircle, ArrowRight, ArrowDown,
  FileText, Users, Building2, ShieldCheck, TrendingUp,
  ClipboardCheck, HandCoins, BarChart3, AlertTriangle,
  ChevronDown, ChevronUp, Calendar, DollarSign, Scale,
} from "lucide-react";

// Clock icon (inline SVG)
function Clock({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

interface Step {
  id: number;
  fase: string;
  judul: string;
  icon: React.ReactNode;
  durasi: string;
  deskripsi: string;
  checklist: string[];
  dokumen: string[];
  pic: string;
  tips?: string;
}

const LANGKAH: Step[] = [
  {
    id: 1,
    fase: "FASE 1: PERSIAPAN INTERNAL",
    judul: "1.1 Keputusan Direksi & Persetujuan Pemegang Saham",
    icon: <Building2 size={20} />,
    durasi: "Minggu 1-2",
    deskripsi: "Rapat Direksi SWI untuk memutuskan penerbitan sukuk. Dapatkan persetujuan dari 3 pemegang saham (IMAN, MALSI, WAPIQ). Tentukan nilai sukuk, nisbah, tenor, dan underlying asset.",
    checklist: [
      "Rapat Direksi membahas rencana sukuk Store",
      "Keputusan nilai sukuk (target: Rp 1 Miliar)",
      "Keputusan nisbah bagi hasil (50:50)",
      "Keputusan tenor sukuk (3-5 tahun)",
      "Penentuan underlying asset: aset Store TIM",
      "Persetujuan tertulis dari 3 pemegang saham",
      "Penunjukan penanggung jawab proyek sukuk",
    ],
    dokumen: [
      "Notulen Rapat Direksi",
      "Surat Persetujuan Pemegang Saham (RUPS)",
      "Proposal Sukuk Store (term-sheet)",
      "Penunjukan Penanggung Jawab Proyek",
    ],
    pic: "Direksi SWI (beriman) + Sekretaris",
    tips: "Pastikan keputusan sudah bulat sebelum ke tahap berikutnya. Komunikasikan rencana ini secara transparan ke semua pemegang saham.",
  },
  {
    id: 2,
    fase: "FASE 1: PERSIAPAN INTERNAL",
    judul: "1.2 Pembentukan SPV & Restrukturisasi Legal",
    icon: <Scale size={20} />,
    durasi: "Minggu 2-4",
    deskripsi: "Bentuk Special Purpose Vehicle (SPV) sebagai penerbit sukuk. SPV bisa berupa badan hukum baru atau subsidiary yang sudah ada. Aset Store TIM dialihkan ke SPV.",
    checklist: [
      "Bentuk SPV: PT SWI Store Sukuk / PT Store Indonesia",
      "Urutkan Akta Pendirian & NIB di AHU",
      "Pindahkan aset Store TIM ke SPV (bangunan, peralatan, inventory)",
      "Audit aset oleh apraiser independen",
      "Dapatkan izin operasional SPV",
      "Buka rekening bank SPV terpisah",
      "Susun anggaran dasar SPV",
    ],
    dokumen: [
      "Akta Pendirian SPV",
      "Nomor Induk Berusaha (NIB) SPV",
      "Berita Acara Pengalihan Aset",
      "Laporan Appraisal Aset",
      "Dokumen Perizinan Operasional",
      "Buku Rekening Bank SPV",
    ],
    pic: "Tim Legal SWI + Notaris",
    tips: "Konsultasikan dengan notaris dan konsultan hukum yang berpengalaman di pasar modal syariah. Biaya pembentukkan SPV ± Rp 10-20 juta.",
  },
  {
    id: 3,
    fase: "FASE 1: PERSIAPAN INTERNAL",
    judul: "1.3 Penunjukan Dewan Pengawas Syariah (DPS)",
    icon: <ShieldCheck size={20} />,
    durasi: "Minggu 3-5",
    deskripsi: "Tunjuk Dewan Pengawas Syariah untuk memastikan seluruh proses sukuk sesuai prinsip syariah. DPS bisa dari MUI, DSN-MUI, atau praktisi syariah independen.",
    checklist: [
      "Identifikasi calon anggota DPS (minimal 2 orang)",
      "Cek kualifikasi: pahami fiqh muamalah & pasar modal",
      "Anggarkan honorarium DPS (Rp 2-5 juta/bulan)",
      "Tandatangani kontrak pengangkatan DPS",
      "Sosialisasikan peran DPS ke internal SWI",
      "Siapkan mekanisme pelaporan ke DPS",
    ],
    dokumen: [
      "Surat Pengangkatan DPS",
      "Kontrak Kerja DPS",
      "Kriteria & SOP Pengawasan Syariah",
      "Buku Panduan Akad Musyarakah",
    ],
    pic: "Direksi + Tim Legal + Konsultan Syariah",
    tips: "DPS sangat penting untuk kepercayaan investor. Pilih yang kredibel dan dikenal di komunitas syariah. Rekomendasi: anggota DSN-MUI atau akademisi ekonomi syariah.",
  },
  {
    id: 4,
    fase: "FASE 2: DOKUMENTASI & REGULASI",
    judul: "2.1 Penyusunan Prospektus & Dokumen Penawaran",
    icon: <FileText size={20} />,
    durasi: "Minggu 4-7",
    deskripsi: "Susun dokumen penawaran sukuk yang lengkap dan transparan. Prospektus harus mencakup semua informasi yang dibutuhkan investor untuk pengambilan keputusan.",
    checklist: [
      "Susun Prospektus Sukuk Store",
      "Sertakan profil perusahaan & manajemen",
      "Sertakan laporan keuangan audit terakhir",
      "Sertakan proyeksi keuangan 3-5 tahun",
      "Sertakan risiko & mitigasi (risk factors)",
      "Sertakan struktur akad Musyarakah",
      "Sertifikat kepemilikan aset underlying",
      "Review oleh DPS dan tim legal",
      "Finalisasi & cetak/elektronik",
    ],
    dokumen: [
      "Prospektus Sukuk Store (draft & final)",
      "Laporan Keuangan Audit 2 tahun terakhir",
      "Proyeksi Keuangan Store (3-5 tahun)",
      "Daftar Risiko & Mitigasi",
      "Draft Akad Musyarakah",
      "Sertifikat/Surat Bukti Kepemilikan Aset",
      "Legal Opinion dari konsultan hukum",
    ],
    pic: "Tim Finance + Legal + Konsultan Syariah",
    tips: "Prospektus harus JUJUR tentang risiko. Jangan menyembunyikan potensi kerugian. Transparansi = kepercayaan investor. Biaya penyusunan ± Rp 15-30 juta.",
  },
  {
    id: 5,
    fase: "FASE 2: DOKUMENTASI & REGULASI",
    judul: "2.2 Pendaftaran & Persetujuan Regulasi",
    icon: <ClipboardCheck size={20} />,
    durasi: "Minggu 6-10",
    deskripsi: "Daftarkan sukuk ke otoritas berwenang. Untuk sukuk korporasi di Indonesia, pengelolaan bisa melalui OJK (pasar modal) atau langsung jika private placement.",
    checklist: [
      "Tentukan skema: OJK (publik) vs Private Placement",
      "Jika OJK: siapkan dokumen pendaftaran ke OJK",
      "Jika Private: susun Subscription Agreement",
      "Daftar ke KSEI (Kustodian Sentral Efek Indonesia)",
      "Dapatkan kode ISIN untuk sukuk",
      "Siapkan CIM (Collective Investment Management)",
      "Koordinasi dengan bank kustodian",
      "Pastikan compliance AML & KYC",
    ],
    dokumen: [
      "Formulir Pendaftaran OJK / Subscription Agreement",
      "Dokumen KYC Investor",
      "Kode ISIN Sukuk",
      "Dokumen KSEI & Kustodian",
      "Surat Kesesuaian dari OJK (jika publik)",
      "AML & KYC Compliance Report",
    ],
    pic: "Tim Legal + Compliance + Kustodian",
    tips: "Untuk skala Rp 1 Miliar, Private Placement lebih efisien. Biaya OJK registration ± Rp 30-50 juta. Private placement cukup ± Rp 5-10 juta. Konsultasikan dengan securities company berlisensi.",
  },
  {
    id: 6,
    fase: "FASE 3: PENAWARAN & PENJUALAN",
    judul: "3.1 Roadshow & Sosialisasi ke Investor",
    icon: <Users size={20} />,
    durasi: "Minggu 8-12",
    deskripsi: "Promosikan sukuk Store kepada calon investor. Bisa melalui direct selling, partnership dengan bank syariah, atau platform crowdfunding syariah.",
    checklist: [
      "Identifikasi target investor (perorangan & lembaga)",
      "Siapkan materi presentasi (pitch deck)",
      "Jalankan roadshow ke bank syariah & BMT",
      "Presentasi ke komunitas pengusaha muslim",
      "Promosi di platform crowdfunding syariah",
      "Sosialisasi via media sosial & newsletter",
      "Open house / kunjungan ke Store TIM",
      "Siapkan Q&A untuk investor",
    ],
    dokumen: [
      "Pitch Deck / Presentation Material",
      "Informasi Memo / Offering Circular",
      "Subscription Form (Formulir Langganan)",
      "Risk Disclosure Statement",
      "Materi Marketing & Sosialisasi",
      "Daftar Calon Investor (pipeline)",
    ],
    pic: "Tim Business Development + Marketing",
    tips: "Investor syariah suka melihat bisnis secara langsung. Ajak mereka ke Store TIM, rasakan produknya, lihat traffic-nya. 'Touch and feel' sangat efektif untuk penjualan sukuk.",
  },
  {
    id: 7,
    fase: "FASE 3: PENAWARAN & PENJUALAN",
    judul: "3.2 Penerimaan Pemesanan & Alokasi Unit Sukuk",
    icon: <DollarSign size={20} />,
    durasi: "Minggu 10-14",
    deskripsi: "Terima pemesanan dari investor, verifikasi, dan alokasikan unit sukuk. Proses ini harus transparan dan adil.",
    checklist: [
      "Buka periode pemesanan (booking period)",
      "Terima formulir langganan dari investor",
      "Verifikasi KYC/AML setiap investor",
      "Terima pembayaran / transfer dari investor",
      "Verifikasi dana masuk ke rekening SPV",
      "Alokasikan unit sukuk secara proporsional",
      "Keluarkan surat konfirmasi kepemilikan unit",
      "Update daftar investor di sheet SukukStore",
    ],
    dokumen: [
      "Formulir Langganan yang sudah ditandatangani",
      "Bukti Transfer / Pembayaran dari Investor",
      "Konfirmasi Kepemilikan Unit Sukuk",
      "Daftar Investor Terdaftar (Registry)",
      "Rekening Koran SPV (bukti dana masuk)",
    ],
    pic: "Tim Finance SPV + Kustodian + Legal",
    tips: "Set investor lock-up period minimal 1 tahun. Pastikan setiap investor mengerti risiko dan tidak bisa 'jual rugi' sembarangan. Transparansi adalah kunci.",
  },
  {
    id: 8,
    fase: "FASE 4: PELAKSANAAN & PENGELOLAAN",
    judul: "4.1 Penandatanganan Akad Musyarakah",
    icon: <HandCoins size={20} />,
    durasi: "Minggu 14-15",
    deskripsi: "Tandatangani akad Musyarakah antara SPV (wakil investor) dan SWI Holding (Mudharib/pengelola). Akad ini adalah kontrak syariah yang mengatur seluruh hubungan bisnis.",
    checklist: [
      "Susun naskah Akad Musyarakah",
      "Review akad oleh DPS (pastikan syariah-compliant)",
      "Rapat Umum Pemegang Sukuk (RUPS) pertama",
      "Penandatanganan akad oleh semua pihak",
      "Notarisasi akad Musyarakah",
      "Penyerahan dana investor ke pengelolaan",
      "Pembukaan escrow account (jika ada)",
      "Pelaporan ke DPS",
    ],
    dokumen: [
      "Naskah Akad Musyarakah (final)",
      "Berita Acara Penandatanganan Akad",
      "Akad yang sudah diNotarisasi",
      "Berita Acara RUPS I",
      "Escrow Account Agreement",
      "Laporan Penyerahan Dana ke DPS",
    ],
    pic: "Semua pihak + DPS + Notaris",
    tips: "Akad Musyarakah adalah jantung dari sukuk ini. Pastikan kata-katanya jelas, adil, dan sesuai fiqh. DPS harus memberikan tanda tertulis (fatwa/sharia compliance) sebelum akad ditandatangani.",
  },
  {
    id: 9,
    fase: "FASE 4: PELAKSANAAN & PENGELOLAAN",
    judul: "4.2 Pengelolaan Dana & Operasional Store",
    icon: <TrendingUp size={20} />,
    durasi: "Bulan 2-36 (berkelanjutan)",
    deskripsi: "Kelola dana sukuk sesuai rencana. Jalankan operasional Store TIM dengan profesional. Dana yang terkumpul digunakan untuk ekspansi, inventory, pemasaran, dan operasional.",
    checklist: [
      "Alokasikan dana sesuai rencana (business plan)",
      "Kelola cash flow Store secara terpisah (escrow)",
      "Bayar gaji karyawan & operasional tepat waktu",
      "Inventory & restock produk sesuai kebutuhan",
      "Ekspansi/pembangunan (jika ada alokasi)",
      "Audit internal bulanan",
      "Report to DPS secara berkala",
      "Siapkan bagi hasil setiap periode",
    ],
    dokumen: [
      "Laporan Alokasi Dana Bulanan",
      "Cash Flow Statement Store SPV",
      "Invoice & Bukti Penggunaan Dana",
      "Laporan Audit Internal",
      "Laporan ke DPS (quarterly)",
      "Dokumen Pembagian Hasil",
    ],
    pic: "Store Manager + Tim Finance SPV + DPS",
  },
  {
    id: 10,
    fase: "FASE 5: PELAPORAN & BAGI HASIL",
    judul: "5.1 Pembagian Hasil Berkala",
    icon: <BarChart3 size={20} />,
    durasi: "Bulanan / Quarterly",
    deskripsi: "Hitung laba bersih Store, bagi sesuai nisbah (50:50), dan distribusikan ke investor. Transparansi laporan keuangan adalah wajib.",
    checklist: [
      "Tutup buku periode (bulanan/quarterly)",
      "Hitung revenue Store dari sheet Store",
      "Kurangi biaya operasional & biaya lain",
      "Dapatkan laba bersih (net profit)",
      "Bagi hasil: 50% investor + 50% SWI",
      "Verifikasi oleh DPS",
      "Transfer dana ke rekening investor",
      "Kirim laporan keuangan ke investor",
      "Update sheet SukukStore → bagian Pembayaran",
    ],
    dokumen: [
      "Laporan Keuangan Periode",
      "Rekonsiliasi Laba Bersih",
      "Fatwa/DPS Approval bagi hasil",
      "Instruction Letter ke Bank (transfer)",
      "Bukti Transfer ke Investor",
      "Monthly Investor Report",
      "Update di sheet SukukStore",
    ],
    pic: "Finance SPV + DPS + Bank Kustodian",
    tips: "Bagi hasil yang tepat waktu = kepercayaan investor terjaga. Investor akan merekomendasikan sukuk SWI ke orang lain jika mereka puas dengan pelayanan & transparansi.",
  },
  {
    id: 11,
    fase: "FASE 6: PENUTUPAN / JATUH TEMPO",
    judul: "6.1 Penyelesaian Sukuk (Maturity)",
    icon: <Calendar size={20} />,
    durasi: "Bulan terakhir tenor",
    deskripsi: "Saat sukuk jatuh tempo, kembalikan pokok investori kepada investor. Jika ingin diperpanjang, jalankan proses baru dengan persetujuan semua pihak.",
    checklist: [
      "Hitung total pokok yang harus dikembalikan",
      "Siapkan dana dari operasasi / refinancing",
      "Bahas di RUPS: pelunasan atau perpanjangan",
      "Jika lunasi: transfer pokok ke investor",
      "Jika perpanjang: susun addendum akad",
      "Tutup buku & audit akhir",
      "Beri report akhir ke investor dan DPS",
      "Arsipkan semua dokumen sukuk",
    ],
    dokumen: [
      "Berita Acara RUPS penutupan/perpanjangan",
      "Laporan Audit Akhir",
      "Bukti Pengembalian Pokok",
      "Sertifikat Pelunasan Sukuk",
      "Addendum Akad (jika diperpanjang)",
      "Dokumen Arsip Proyek Sukuk",
    ],
    pic: "Direksi SPV + DPS + Investor",
    tips: "Mulai persiapan pelunasan minimal 6 bulan sebelum jatuh tempo. Pastikan dana tersedia. Sukuk yang sukses bisa dilanjutkan dengan seri berikutnya!",
  },
];

const FASES_MAP: Record<string, { color: string; bg: string }> = {
  "FASE 1: PERSIAPAN INTERNAL": { color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  "FASE 2: DOKUMENTASI & REGULASI": { color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  "FASE 3: PENAWARAN & PENJUALAN": { color: "text-green-600", bg: "bg-green-50 border-green-200" },
  "FASE 4: PELAKSANAN & PENGELOLAAN": { color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  "FASE 5: PELAPORAN & BAGI HASIL": { color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
  "FASE 6: PENUTUPAN / JATUH TEMPO": { color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
};

export default function SukukPanduanPanel() {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (stepId: number, itemIdx: number) => {
    const key = `${stepId}-${itemIdx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStep = (id: number) => {
    setExpandedStep((prev) => (prev === id ? null : id));
  };

  const getStepProgress = (stepId: number, totalItems: number) => {
    let checked = 0;
    for (let i = 0; i < totalItems; i++) {
      if (checkedItems[`${stepId}-${i}`]) checked++;
    }
    return totalItems > 0 ? Math.round((checked / totalItems) * 100) : 0;
  };

  let lastFase = "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-[var(--ink)]">
          📖 Panduan Pelaksanaan Sukuk Musyarakah Store
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          Langkah demi langkah: dari persiapan sampai pembagian hasil
        </p>
      </div>

      {/* Timeline Overview */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-sm text-[var(--ink)] mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-[var(--brand)]" />
          Overview Timeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(FASES_MAP).map(([fase, styling], i) => (
            <div key={i} className={`border rounded-lg p-3 ${styling.bg}`}>
              <div className={`text-[10px] font-bold uppercase ${styling.color}`}>
                Fase {i + 1}
              </div>
              <div className="text-xs font-medium mt-1">{fase.replace(/^FASE \d+: /, "")}</div>
              <div className="text-[10px] text-[var(--muted)] mt-1">
                {["Mgu 1-4", "Mgu 4-10", "Mgu 8-14", "Mgu 15-36+", "Bulanan", "Akhir Tenor"][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Durasi */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-[var(--muted)]">Total Tahap</div>
            <div className="text-2xl font-extrabold text-[var(--brand)]">11</div>
            <div className="text-[10px] text-[var(--muted)]">langkah</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)]">Estimasi Durasi</div>
            <div className="text-2xl font-extrabold text-amber-600">~14-16</div>
            <div className="text-[10px] text-[var(--muted)]">minggu (setup)</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)]">Dokumen Wajib</div>
            <div className="text-2xl font-extrabold text-purple-600">~25+</div>
            <div className="text-[10px] text-[var(--muted)]">dokumen</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted)]">Tenor Sukuk</div>
            <div className="text-2xl font-extrabold text-green-600">3-5</div>
            <div className="text-[10px] text-[var(--muted)]">tahun</div>
          </div>
        </div>
      </div>

      {/* Step by Step */}
      <div className="space-y-4">
        {LANGKAH.map((step) => {
          const isExpanded = expandedStep === step.id;
          const faseStyle = FASES_MAP[step.fase];
          const showFase = step.fase !== lastFase;
          lastFase = step.fase;
          const progress = getStepProgress(step.id, step.checklist.length);

          return (
            <div key={step.id}>
              {/* Fase Header */}
              {showFase && (
                <div className={`rounded-lg px-4 py-2 mb-2 ${faseStyle.bg} border`}>
                  <div className={`font-bold text-sm ${faseStyle.color}`}>
                    {step.fase}
                  </div>
                </div>
              )}

              {/* Step Card */}
              <div className={`border rounded-xl bg-white overflow-hidden ${
                isExpanded ? "border-[var(--brand)]" : "border-[var(--line)]"
              }`}>
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--soft)] transition"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    progress === 100 ? "bg-green-100" : "bg-[var(--soft)]"
                  }`}>
                    {progress === 100 ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <span className="text-lg font-extrabold text-[var(--brand)]">{step.id}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[var(--ink)]">{step.judul}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                        <Clock size={10} /> {step.durasi}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">•</span>
                      <span className="text-[10px] text-[var(--muted)]">{step.checklist.length} checklist</span>
                      <span className="text-[10px] text-[var(--muted)]">•</span>
                      <span className="text-[10px] text-[var(--muted)]">{step.dokumen.length} dokumen</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress === 100 ? "bg-green-500" : "bg-[var(--brand)]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-[var(--muted)]" /> : <ChevronDown size={16} className="text-[var(--muted)]" />}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-[var(--line)] p-4 space-y-4">
                    {/* Deskripsi */}
                    <p className="text-sm text-[var(--ink)]">{step.deskripsi}</p>

                    {/* Checklist */}
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)] mb-2 flex items-center gap-1">
                        <ClipboardCheck size={12} /> Checklist
                      </h4>
                      <ul className="space-y-1.5">
                        {step.checklist.map((item, i) => {
                          const key = `${step.id}-${i}`;
                          const checked = checkedItems[key];
                          return (
                            <li key={i}>
                              <button
                                onClick={() => toggleCheck(step.id, i)}
                                className="flex items-start gap-2 text-left w-full group"
                              >
                                <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${
                                  checked ? "bg-green-500 border-green-500" : "border-gray-300 group-hover:border-[var(--brand)]"
                                }`}>
                                  {checked && <CheckCircle size={12} className="text-white" />}
                                </div>
                                <span className={`text-xs ${checked ? "line-through text-[var(--muted)]" : "text-[var(--ink)]"}`}>
                                  {item}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Dokumen */}
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)] mb-2 flex items-center gap-1">
                        <FileText size={12} /> Dokumen yang Disiapkan
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {step.dokumen.map((doc, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--soft)] rounded text-[10px] text-[var(--ink)]">
                            <FileText size={8} /> {doc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* PIC */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted)]">
                        👤 <strong>PIC:</strong> {step.pic}
                      </span>
                      <span className={`font-bold ${
                        progress === 100 ? "text-green-600" : progress > 0 ? "text-amber-600" : "text-gray-400"
                      }`}>
                        {progress}% selesai
                      </span>
                    </div>

                    {/* Tips */}
                    {step.tips && (
                      <div className="border border-amber-200 rounded-lg bg-amber-50 p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-amber-800">{step.tips}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Connecting Line */}
              {step.id < LANGKAH.length && !FASES_MAP[LANGKAH[step.id]?.fase]?.color && expandedStep !== step.id && (
                <div className="flex justify-center py-1">
                  <ArrowDown size={14} className="text-[var(--muted)]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Catatan Akhir */}
      <div className="border border-blue-200 rounded-xl bg-blue-50 p-5">
        <h3 className="font-bold text-sm text-blue-800 mb-2">💡 Ringkasan Kunci</h3>
        <div className="grid md:grid-cols-2 gap-3 text-xs text-blue-800">
          <div>
            <p><strong>Total waktu setup:</strong> ± 14-16 minggu (3-4 bulan)</p>
            <p><strong>Biaya estimasi:</strong> Rp 50-100 juta (notaris, legal, DPS, registrasi)</p>
            <p><strong>Minimal investor:</strong> 5-10 orang (perseorangan atau lembaga)</p>
          </div>
          <div>
            <p><strong>Jumlah investor maksimal:</strong> Tidak terbatas (sesuai kapasitas)</p>
            <p><strong>Minimal investasi:</strong> Rp 1.000.000 (1 unit sukuk)</p>
            <p><strong>Platform crowdfunding syariah:</strong> Ammana, Kitabisa Syariah, Dana Syariah</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-[10px] text-[var(--muted)] py-4 border-t border-[var(--line)]">
        <p>Panduan ini bersifat informatif. Konsultasikan dengan konsultan hukum & syariah berlisensi sebelum pelaksanaan.</p>
        <p className="mt-1">SWI bertanggung jawab penuh atas kepatuhan terhadap regulasi OJK & DSN-MUI.</p>
      </div>
    </div>
  );
}
