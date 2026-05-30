"use client";

import { useState } from "react";
import {
  FileText, Download, Printer, CheckCircle, AlertTriangle,
  Users, DollarSign, Calendar, ShieldCheck, Scale,
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

interface TermSheetData {
  info?: string[][] | null;
  investor?: string[][] | null;
}

export default function SukukTermSheetPanel({ data }: { data?: TermSheetData }) {
  const [showPreview, setShowPreview] = useState(false);

  // Default values
  const today = new Date();
  const tanggalAkad = `${today.getDate()} ${["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][today.getMonth()]} ${today.getFullYear()}`;

  // Parse sukuk info
  const sukukInfo: Record<string, string> = {};
  if (data?.info) {
    for (const r of data.info) {
      if (r[0] && r[1]) sukukInfo[r[0]] = r[1];
      if (r[4] && r[5]) sukukInfo[r[4]] = r[5];
    }
  }

  // Parse investor data
  const investors: { nama: string; unit: number; nominal: number; pct: string }[] = [];
  let totalUnit = 0, totalNominal = 0;
  if (data?.investor) {
    for (const r of data.investor) {
      if (!r[0] || isNaN(safeNum(r[0]))) continue;
      const unit = safeNum(r[3]);
      const nominal = safeNum(r[4]);
      totalUnit += unit;
      totalNominal += nominal;
      investors.push({ nama: r[1] || "", unit, nominal, pct: r[5] || "" });
    }
  }

  const renderTermSheetHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AKAD MUSYARAKAH — SUKUK STORE TIM</title>
<style>
  @page { margin: 2cm; size: A4; }
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; max-width: 21cm; margin: 0 auto; padding: 2cm; }
  .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 15px; margin-bottom: 20px; }
  .header h1 { font-size: 16pt; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
  .header h2 { font-size: 14pt; margin: 5px 0; font-weight: normal; }
  .header p { font-size: 10pt; margin: 0; color: #555; }
  .section { margin: 15px 0; }
  .section h3 { font-size: 13pt; margin: 0 0 8px 0; background: #f0f0f0; padding: 5px 10px; border-left: 4px solid #0D9488; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #999; padding: 6px 10px; text-align: left; font-size: 11pt; }
  th { background: #f5f5f5; font-weight: bold; }
  .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0; }
  .party-box { border: 1px solid #ccc; padding: 12px; }
  .party-box h4 { margin: 0 0 5px 0; font-size: 11pt; color: #0D9488; }
  .party-box p { margin: 2px 0; font-size: 10pt; }
  .article { margin: 12px 0; }
  .article-title { font-weight: bold; font-size: 12pt; margin-bottom: 5px; }
  .article-content { font-size: 11pt; text-align: justify; }
  .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
  .signature-box { text-align: center; }
  .signature-box .name { border-bottom: 1px solid #333; height: 60px; margin-bottom: 5px; }
  .signature-box p { font-size: 10pt; margin: 2px 0; }
  .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .highlight { background: #fff3cd; padding: 2px 5px; }
  ol { margin: 5px 0; padding-left: 20px; }
  ol li { margin: 3px 0; }
  .page-break { page-break-before: always; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>

<div class="header">
  <h1>AKAD MUSYARAKAH</h1>
  <h2>SUKUK STORE TIM — PT SENSAI WANGI INDONESIA</h2>
  <p>Nomor Akad: SWI/SUKUK-MSY/${today.getFullYear()}/______</p>
  <p>Tanggal: ${tanggalAkad}</p>
</div>

<div class="section">
  <h3>PASAL 1: PARA PIHAK</h3>
  <div class="parties-grid">
    <div class="party-box">
      <h4>PIHAK PERTAMA (Shahibul Maal / Investor)</h4>
      <p><strong>Nama:</strong> _________________________________</p>
      <p><strong>No. KTP:</strong> _________________________________</p>
      <p><strong>Alamat:</strong> _________________________________</p>
      <p><strong>No. NPWP:</strong> _________________________________</p>
      <p><strong>Jumlah Investasi:</strong> ${fmtRp(totalNominal)}</p>
      <p><strong>Jumlah Unit Sukuk:</strong> ${totalUnit} unit</p>
    </div>
    <div class="party-box">
      <h4>PIHAK KEDUA (Mudharib / Pengelola)</h4>
      <p><strong>Nama Perusahaan:</strong> PT Sensasi Wangi Indonesia</p>
      <p><strong>NIB:</strong> _________________________________</p>
      <p><strong>Alamat:</strong> Trans Studio Mall, Bandung</p>
      <p><strong>NPWP:</strong> _________________________________</p>
      <p><strong>Diwakili oleh:</strong> Beriman Juliano (Direktur)</p>
      <p><strong>Kontribusi In-Kind:</strong> Sistem, Brand, Pengelolaan</p>
    </div>
  </div>
</div>

<div class="section">
  <h3>PASAL 2: LINGKUP KERJASAMA</h3>
  <div class="article">
    <div class="article-title">Pasal 2.1 — Objek Kerjasama</div>
    <div class="article-content">
      Para Pihak sepakat untuk menjalankan kerjasama bisnis berupa pembukaan dan pengelolaan <strong>"SWI Store"</strong> di Trans Studio Mall (TIM) Bandung, meliputi:
      <ol>
        <li>Penjualan parfum jadi (retail)</li>
        <li>Custom perfume workshop (jika sudah mencapai target penjualan)</li>
        <li>Penjualan merchandise branded (T-shirt, tumbler, candle)</li>
        <li>Online sales melalui marketplace (fase lanjutan)</li>
      </ol>
    </div>
  </div>
  <div class="article">
    <div class="article-title">Pasal 2.2 — Jangka Waktu</div>
    <div class="article-content">
      Akad ini berlaku selama <strong>3 (tiga) tahun</strong> terhitung sejak tanggal penandatanganan, dengan kemungkinan perpanjangan atas kesepakatan kedua belah pihak.
    </div>
  </div>
</div>

<div class="section">
  <h3>PASAL 3: KONTRIBUSI MODAL</h3>
  <table>
    <tr><th>Pihak</th><th>Jenis Kontribusi</th><th>Nilai Estimasi</th><th>Persentase</th></tr>
    <tr>
      <td>Pihak Pertama (Investor)</td>
      <td>Modal tunai</td>
      <td>${fmtRp(totalNominal)}</td>
      <td>${(totalNominal + 46500000) > 0 ? (totalNominal / (totalNominal + 46500000) * 100).toFixed(1) : "50"}%</td>
    </tr>
    <tr>
      <td>Pihak Kedua (SWI)</td>
      <td>In-kind: Sistem POS (Rp 35jt), Brand + Merek, Desain Interior, Training SOP, Foto Produk, Legal & Perizinan</td>
      <td>Rp 46.500.000</td>
      <td>${(totalNominal + 46500000) > 0 ? (46500000 / (totalNominal + 46500000) * 100).toFixed(1) : "50"}%</td>
    </tr>
    <tr><td colspan="2"><strong>TOTAL MODALUSAHA</strong></td><td colspan="2"><strong>${fmtRp(totalNominal + 46500000)}</strong></td></tr>
  </table>
</div>

<div class="section">
  <h3>PASAL 4: PEMBAGIAN HASIL (NISBAH)</h3>
  <table>
    <tr><th>Penerima</th><th>Persentasi</th><th>Keterangan</th></tr>
    <tr><td>TIM (Ju'alah)</td><td>10%</td><td>Dari laba bersih, sebagian imbalan pengelolaan operasional sehari-hari</td></tr>
    <tr><td>Reserve Fund</td><td>5%</td><td>Dari laba bersih, untuk coverage kerugian di periode berikutnya (max Rp 20jt)</td></tr>
    <tr><td><strong>Pihak Pertama (Investor)</strong></td><td><strong>42.5%</strong></td><td>50% dari sisa 85% setelah TIM fee & reserve</td></tr>
    <tr><td><strong>Pihak Kedua (SWI)</strong></td><td><strong>42.5%</strong></td><td>50% dari sisa 85% setelah TIM fee & reserve</td></tr>
  </table>
  <p style="font-size:10pt; color:#555; margin-top:8px;">
    <strong>Skema bagi hasil efektif:</strong> Investor ~42.5% | SWI ~42.5% | TIM 10% | Reserve 5% = dari total laba bersih
  </p>
</div>

<div class="section">
  <h3>PASAL 5: ATURAN KERUGIAN</h3>
  <div class="article-content">
    <ol>
      <li>Kerugian modal ditanggung sepenuhnya oleh <strong>Pihak Pertama (Investor)</strong> sebagai pemilik modal tunai.</li>
      <li><strong>Pihak Kedua (SWI)</strong> tidak menanggung kerugian modal, namun kehilangan kontribusi waktu dan tenaga kerja.</li>
      <li>Jika kerugian mencapai <strong>50% dari total modal</strong>, Para Pihak wajib melakukan evaluasi dan dapat memutuskan untuk melanjutkan atau menghentikan akad.</li>
      <li>Reserve Fund (5%) dapat digunakan untuk menutupi kerugian operasional di periode tertentu.</li>
    </ol>
  </div>
</div>

<div class="section">
  <h3>PASAL 6: MEKANISME BAGI HASIL</h3>
  <div class="article-content">
    <ol>
      <li>Pembagian hasil dilakukan <strong>bulanan</strong>, paling lambat tanggal 5 bulan berikutnya.</li>
      <li>Laporan keuangan bulanan disiapkan oleh SWI (Pihak Kedua) dan diverifikasi oleh Investor.</li>
      <li>Pembagian hasil ditransfer langsung ke rekening masing-masing pihak.</li>
      <li>Ketidaksepakatan tentang angka laporan keuangan diselesaikan melalui audit bersama (biaya ditanggung jointly).</li>
    </ol>
  </div>
</div>

<div class="section">
  <h3>PASAL 7: DEWAN PENGAWAS SYARIAH (DPS)</h3>
  <div class="article-content">
    <ol>
      <li>Akad ini tunduk pada prinsip syariah Islam dan DSN-MUI Fatwa No. 71/DSN-MUI/VI/2008 tentang Sukuk.</li>
      <li>Dewan Pengawas Syariah ditunjuk oleh Para Pihak untuk memastikan kepatuhan syariah.</li>
      <li>Honorarium DPS dibebankan dari bagian Pihak Kedua (SWI).</li>
      <li>DPS berhak meminta perubahan jika ada praktik yang bertentangan dengan syariah.</li>
    </ol>
  </div>
</div>

<div class="section">
  <h3>PASAL 8: HAK DAN KEWAJIBAN</h3>
  <div class="two-columns">
    <div>
      <strong>Pihak Pertama (Investor):</strong>
      <ol>
        <li>Menyetorkan modal sesuai kesepakatan</li>
        <li>Menerima laporan keuangan bulanan</li>
        <li>Menerima bagi hasil sesuai nisbah</li>
        <li>Berhak audit sewaktu-waktu</li>
      </ol>
    </div>
    <div>
      <strong>Pihak Kedua (SWI):</strong>
      <ol>
        <li>Mengelola operasional Store sehari-hari</li>
        <yi>Menyediakan sistem, brand, dan SDM</yi>
        <mi>Menyusun laporan keuangan bulanan</mi>
        <li>Membagikan hasil sesuai kesepakatan</li>
      </ol>
    </div>
  </div>
</div>

<div class="section page-break">
  <h3>PASAL 9: PENCABUTAN & PENUTUPAN</h3>
  <div class="article-content">
    <ol>
      <li>Akad dapat diakhiri jika: (a) Jangka waktu habis, (b) Kedua pihak sepakat, (c) Salah satu pihak wanprestasi dan tidak diperbaiki dalam 30 hari.</li>
      <li>Saat penutupan, seluruh aset likuid dibayar dengan urusan: (a) Biaya operasional tertunda, (b) Reserve Fund dikembalikan ke Investor.</li>
      <li>Aset tidak likuid (sistem, brand) miliki SWI. Aset inventori dijual dan hasilnya dibagi sesuai nisbah.</li>
    </ol>
  </div>
</div>

<div class="section">
  <h3>PASAL 10: PENYELESAIAN PERSELISIHAN</h3>
  <div class="article-content">
    <ol>
      <li>Seluruh perselisihan diselesaikan terlebih dahulu secara musyawarah.</li>
      <li>Jika musyawarah gagal, Para Pihak sepakat untuk menyelesaikan melalui <strong>arbitrase syariah</strong>.</li>
      <li>Putusan arbitrase bersifat final dan mengikat.</li>
    </ol>
  </div>
</div>

<div class="section">
  <h3>PASAL 11: LAIN-LAIN</h3>
  <div class="article-content">
    <ol>
      <li>Segala hal yang belum diatur dalam akad ini akan diatur berdasarkan kesepakatan Para Pihak.</li>
      <li>Perubahan akad hanya sah jika dibuat secara tertulis dan ditandatangani oleh kedua pihak.</li>
      <li>Akad ini dibuat dalam rangkap dua, bermeterai cukup, dan memiliki kekuatan hukum yang sama.</li>
    </ol>
  </div>
</div>

<div class="signature-grid">
  <div class="signature-box">
    <p><strong>PIHAK PERTAMA</strong></p>
    <p>(Investor / Shahibul Maal)</p>
    <div class="name"></div>
    <p>_________________________________</p>
    <p>Saksi: ${totalUnit} unit × Rp 1.000.000 = ${fmtRp(totalNominal)}</p>
  </div>
  <div class="signature-box">
    <p><strong>PIHAK KEDUA</strong></p>
    <p>(Mudharib / Pengelola)</p>
    <div class="name"></div>
    <p>PT Sensasi Wangi Indonesia</p>
    <p>Beriman Juliano, Direktur</p>
  </div>
</div>

</body>
</html>`;
  };

  const handlePrint = () => {
    const html = renderTermSheetHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
  };

  const handleDownloadHTML = () => {
    const html = renderTermSheetHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AKAD_MUSYARAKAH_SUKUK_STORE_${today.getFullYear()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">
            📄 Term Sheet & Akad Musyarakah
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Dokumen legal kerjasama sukuk musyarakah — bisa di-print atau download
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--line)] text-xs font-bold hover:border-[var(--brand)] transition"
          >
            <FileText size={14} /> {showPreview ? "Sembunyikan" : "Preview"} Akad
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-xs font-bold hover:opacity-90 transition"
          >
            <Printer size={14} /> Print
          </button>
          <button
            onClick={handleDownloadHTML}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--brand)] text-[var(--brand)] text-xs font-bold hover:bg-[var(--brand)] hover:text-white transition"
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-green-50 mb-2">
            <DollarSign size={18} className="text-green-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Modal Investor</div>
          <div className="text-lg font-extrabold text-green-600 mt-1">{fmtRp(totalNominal)}</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-purple-50 mb-2">
            <Scale size={18} className="text-purple-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Kontribusi SWI</div>
          <div className="text-lg font-extrabold text-purple-600 mt-1">Rp 46,5jt</div>
          <div className="text-[10px] text-[var(--muted)]">in-kind</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-2">
            <Calendar size={18} className="text-blue-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Tenor Akad</div>
          <div className="text-lg font-extrabold text-blue-600 mt-1">3 tahun</div>
          <div className="text-[10px] text-[var(--muted)]">+ opsi perpanjangan</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-orange-50 mb-2">
            <Users size={18} className="text-orange-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Jumlah Investor</div>
          <div className="text-lg font-extrabold text-orange-600 mt-1">{investors.length}</div>
          <div className="text-[10px] text-[var(--muted)]">{totalUnit} unit terjual</div>
        </div>
      </div>

      {/* Nisbah Summary */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-sm text-[var(--ink)] mb-3">Nisbah Bagi Hasil</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "TIM (Ju'alah)", pct: "10%", color: "orange" },
            { label: "Reserve Fund", pct: "5%", color: "gray" },
            { label: "Investor", pct: "42.5%", color: "green" },
            { label: "SWI", pct: "42.5%", color: "purple" },
          ].map((item, i) => (
            <div key={i} className={`border rounded-lg p-3 text-center ${
              item.color === "green" ? "border-green-200 bg-green-50" :
              item.color === "purple" ? "border-purple-200 bg-purple-50" :
              item.color === "orange" ? "border-orange-200 bg-orange-50" :
              "border-gray-200 bg-gray-50"
            }`}>
              <div className={`text-xs font-bold ${
                item.color === "green" ? "text-green-700" :
                item.color === "purple" ? "text-purple-700" :
                item.color === "orange" ? "text-orange-700" :
                "text-gray-700"
              }`}>{item.label}</div>
              <div className={`text-2xl font-extrabold mt-1 ${
                item.color === "green" ? "text-green-700" :
                item.color === "purple" ? "text-purple-700" :
                item.color === "orange" ? "text-orange-700" :
                "text-gray-700"
              }`}>{item.pct}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Akad Preview */}
      {showPreview && (
        <div className="border border-[var(--line)] rounded-xl bg-white overflow-hidden">
          <div className="bg-[var(--soft)] px-5 py-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--ink)]">Preview Akad Musyarakah</h3>
            <span className="text-[10px] text-[var(--muted)]">Gunakan tombol Print/Download untuk versi lengkap</span>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto text-sm leading-relaxed space-y-4">
            {/* Pasal 1 */}
            <div>
              <h4 className="font-bold text-[var(--ink)] bg-[var(--soft)] px-3 py-1 border-l-4 border-[var(--brand)]">PASAL 1: PARA PIHAK</h4>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="border border-[var(--line)] rounded-lg p-3">
                  <div className="text-xs font-bold text-[var(--brand)] mb-2">PIHAK PERTAMA (Shahibul Maal / Investor)</div>
                  <p className="text-xs"><strong>Nama:</strong> _________________________________</p>
                  <p className="text-xs"><strong>No. KTP:</strong> _________________________________</p>
                  <p className="text-xs"><strong>Alamat:</strong> _________________________________</p>
                  <p className="text-xs"><strong>Jumlah Investasi:</strong> {fmtRp(totalNominal)}</p>
                  <p className="text-xs"><strong>Unit Sukuk:</strong> {totalUnit} unit</p>
                </div>
                <div className="border border-[var(--line)] rounded-lg p-3">
                  <div className="text-xs font-bold text-[var(--brand)] mb-2">PIHAK KEDUA (Mudharib / Pengelola)</div>
                  <p className="text-xs"><strong>Perusahaan:</strong> PT Sensasi Wangi Indonesia</p>
                  <p className="text-xs"><strong>Alamat:</strong> Trans Studio Mall, Bandung</p>
                  <p className="text-xs"><strong>Diwakili:</strong> Beriman Juliano (Direktur)</p>
                  <p className="text-xs"><strong>Kontribusi:</strong> Sistem, Brand, Pengelolaan</p>
                </div>
              </div>
            </div>
            {/* Pasal 2 */}
            <div>
              <h4 className="font-bold text-[var(--ink)] bg-[var(--soft)] px-3 py-1 border-l-4 border-[var(--brand)]">PASAL 2: LINGKUP KERJASAMA</h4>
              <div className="mt-2 text-xs space-y-2 px-2">
                <p><strong>2.1</strong> Objek kerjasama: pembukaan dan pengelolaan "SWI Store" di TIM Bandung — penjualan parfum, workshop, merchandise, online sales.</p>
                <p><strong>2.2</strong> Jangka waktu: 3 (tiga) tahun terhitung sejak tanggal penandatanganan, dengan opsi perpanjangan.</p>
              </div>
            </div>
            {/* Pasal 3 */}
            <div>
              <h4 className="font-bold text-[var(--ink)] bg-[var(--soft)] px-3 py-1 border-l-4 border-[var(--brand)]">PASAL 3: KONTRIBUSI MODAL</h4>
              <table className="w-full text-xs mt-2 border-collapse">
                <thead>
                  <tr className="bg-[var(--soft)]">
                    <th className="border border-[var(--line)] p-2 text-left">Pihak</th>
                    <th className="border border-[var(--line)] p-2 text-left">Jenis</th>
                    <th className="border border-[var(--line)] p-2 text-right">Nilai</th>
                    <th className="border border-[var(--line)] p-2 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[var(--line)] p-2">Investor</td>
                    <td className="border border-[var(--line)] p-2">Tunai</td>
                    <td className="border border-[var(--line)] p-2 text-right">{fmtRp(totalNominal)}</td>
                    <td className="border border-[var(--line)] p-2 text-right">{(totalNominal + 46500000) > 0 ? (totalNominal / (totalNominal + 46500000) * 100).toFixed(1) : "50"}%</td>
                  </tr>
                  <tr>
                    <td className="border border-[var(--line)] p-2">SWI</td>
                    <td className="border border-[var(--line)] p-2">In-Kind</td>
                    <td className="border border-[var(--line)] p-2 text-right">Rp 46.500.000</td>
                    <td className="border border-[var(--line)] p-2 text-right">{(totalNominal + 46500000) > 0 ? (46500000 / (totalNominal + 46500000) * 100).toFixed(1) : "50"}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Pasal 4-11 summary */}
            <div>
              <h4 className="font-bold text-[var(--ink)] bg-[var(--soft)] px-3 py-1 border-l-4 border-[var(--brand)]">PASAL 4-11: RINGKASAN KUNCI</h4>
              <div className="mt-2 text-xs space-y-1 px-2">
                <p><strong>Pasal 4 (Nisbah):</strong> TIM 10% | Reserve 5% | Investor 42.5% | SWI 42.5%</p>
                <p><strong>Pasal 5 (Kerugian):</strong> Ditanggung 100% investor. SWI rugi waktu & tenaga.</p>
                <p><strong>Pasal 6 (Mekanisme):</strong> Bagi hasil bulanan, paling lambat tgl 5 bulan berikutnya.</p>
                <p><strong>Pasal 7 (DPS):</strong> Akad tunduk pada Fatwa DSN-MUI No. 71/2008 tentang Sukuk.</p>
                <p><strong>Pasal 8 (Hak/Kewajiban):</strong> Investor = setor modal, terima laporan, audit. SWI = kelola, buat laporan, bagikan hasil.</p>
                <p><strong>Pasal 9 (Penutupan):</strong> 3 tahun / sepakat / wanprestasi. Aset likuid urus biaya terpusat.</p>
                <p><strong>Pasal 10 (Perselisihan):</strong> Musyawarah → Arbitrase Syariah.</p>
                <p><strong>Pasal 11 (Lain-lain):</strong> Perubahan harus tertulis, 2 rangkap bermeterai.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div className="border border-orange-200 rounded-xl bg-orange-50 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-800 space-y-1">
            <p><strong>Disclaimer:</strong> Template akad ini adalah draft awal. Harap dikonsultasikan dengan notaris dan ahli hukum syariah sebelum ditandatangani.</p>
            <p><strong>Fatwa DSN-MUI:</strong> Akad ini mengacu pada Fatwa DSN-MUI No. 71/DSN-MUI/VI/2008 tentang Sukuk dan No. 117/DSN-MUI/IX/2018 tentang Sukuk Musyarakah.</p>
            <p><strong>Pajak:</strong> Bagi hasil sukuk dikenakan PPh Final UMKM 0.5% dari nominal bagi hasil (jika omzet &lt; 4.8M/tahun).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
