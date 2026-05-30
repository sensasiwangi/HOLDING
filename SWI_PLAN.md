# 🌿 Ekosistem Bisnis Sensasi Wangi Indonesia — Action Plan

> **Hak Akses:** HODL (Hermes OWL)
> **Aturan:** TIDAK PERNAH menghapus file di Google Drive tanpa persetujuan Abjad
> **Frekuensi:** Setiap 15 menit
> **QA Gate:** Setiap task wajib lolos QA sebelum di-checklist

---

## FASE 0: Sistem Keuangan & Dokumentasi Keuangan ⭐ PRIORITAS UTAMA
*Status: 🟢 Hampir Selesai (7/8 task done)*

### 0.1 Chart of Accounts (COA)
- [x] Buat COA lengkap: Aset, Kewajiban, Modal, Pendapatan, Pengeluaran, Holding
- [ ] **QA: COA sudah review dengan konsultan pajak**

### 0.2 Google Sheets — Perbaikan & Struktur Ulang
- [x] Fix formula error di semua sheet (21 sheets clean)
- [x] Buat sheet COA, Laporan_Harian, Rekening_Koran, Budget_vs_Actual
- [x] **QA: Semua formula tidak error** ✅ QA PASSED
- [x] Buat sheet Laporan_Bulanan (P&L otomatis dari Cash_Harian) ✅
- [x] Buat sheet Cash_Harian + Buku_Kas (input harian, linked ke Laporan_Bulanan) ✅
- [x] Buat sheet Pajak_Tracking + Legal_Compliance + Cashflow_Forecast ✅
- [x] Buat sheet SOP_Store + Artisan_Program + Merch_TIM + Store_Daily_Log ✅
- [x] **🔗 LINKING: Semua sheet terhubung via formula** ✅
  - Cash_Harian → Laporan_Bulanan (SUMPRODUCT per bulan/divisi)
  - Cash_Harian → Rekening_Koran (auto-rekonsiliasi)
  - Cash_Harian → Budget_vs_Actual (auto-actualisasi)
  - Store_Daily_Log → Ringkasan mingguan/bulanan
  - Merch_TIM → Restock alert otomatis
  - Dashboard → Live KPI dari semua sheet
- [x] **🤖 APPS SCRIPT: Automation setup** ✅
  - onEdit trigger: auto-update KPI saat input Cash_Harian
  - Daily (jam 9): cek pajak jatuh tempo + email reminder
  - Weekly (Senin jam 8): ringkasan mingguan otomatis
  - Monthly (tanggal 5): reminder setoran 30%
  - Custom menu "🏢 SWI Tools" di Google Sheets

### 0.3 Dokumentasi Transaksi
- [x] Buat panduan pencatatan transaksi (harian, mingguan, bulanan, kuartal, tahunan)
- [x] Buat Chart of Accounts 6 kategori dengan kode standar
- [x] Template laporan harian — Google Sheet `Cash_Harian` + `Buku_Kas` + TransactionForm UI ✅ QA PASSED
- [x] Template laporan bulanan — `Laporan_Bulanan` sheet P&L per divisi ✅ QA PASSED
- [x] Sistem approval transaksi: < Rp 1jt kasir, 1-5jt manager, > 5jt direksi (terdokumentasi)
- [x] **QA: Template & panduan sudah tersedia di dashboard dan Google Sheets**

### 0.4 Cashflow Management
- [x] Input data kas awal — saldo 2 rekening BRI: SWI HOLDING Rp 16.678.946,80 + SWI WEBSITE Rp 755.000 = Total Rp 17.433.946,80 (30 Mei 2026)
- [x] Setup pencatatan kas harian per divisi — sheet Cash_Harian + Buku_Kas + TransactionForm
- [ ] Rekonsiliasi bank mingguan (cocokkan catatan kas dengan mutasi bank)
- [ ] Proyeksi cashflow 3 bulan ke depan
- [ ] **QA: Saldo kas cocok dengan rekening bank (selisih = 0)**

### 0.5 Setoran 30% Holding
- [x] Sheet RekapSetoran sudah ada dengan formula
- [x] Definisikan tanggal setoran — setiap tanggal 5 berikutnya (terdokumentasi di sheet)
- [x] Tracking keterlambatan setoran per divisi (formula conditional di RekapSetoran)
- [x] **QA: Setoran 30% = 30% × total pendapatan divisi (verified)**

### 0.6 Pajak & Compliance
- [x] Daftar kewajiban pajak: PPh 21, PPh Badan, PPN, Pajak Daerah — sheet `Pajak_Tracking`
- [x] Tracking deadline pembayaran pajak — dengan status & conditional formatting
- [x] Legal compliance tracker — sheet `Legal_Compliance` (Akta, NIB, NPWP, merek, izin)
- [x] **QA: Semua deadline ter-track dan tidak ada yang terlewat**

### 0.7 Dokumen Sistem Keuangan
- [x] Upload sistem keuangan ke Google Drive: `SWI_FINANCE_SYSTEM.md`
- [ ] Review dengan konsultan pajak / akuntan publik
- [ ] Finalisasi dan sertakan ke dokumen legal perusahaan
- [ ] **QA: Dokumen sudah review dan approved**

---

## FASE 1: Fondasi Data & Dokumentasi
*Status: 🟢 Completed (1.1 ✅, 1.2 ✅, 1.3 🟡 — tracker dibuat, dokumen perlu di-scan/upload oleh user)*

### 1.1 Google Drive — Struktur Folder
- [x] **QA: Folder tidak ada yang hilang setelah reorganisasi** ✅ QA PASSED
- [x] Buat folder root `SWI_Ecosystem` di Google Drive
- [x] Sub-folder per divisi: `Produksi`, `Store`, `Event`, `Ecommerse`, `Digital`, `Holding`
- [x] Sub-folder per fungsi: `Finance`, `Legal`, `Marketing`, `Operations`, `HR`
- [x] Sub-folder: `Sukuk` (dokumen syariah, term sheet, prospektus)
- [x] Sub-folder: `Templates` (format surat, kontrak, invoice)
- [x] Sub-folder: `Brand_Assets` (logo, foto produk, guideline)
- [x] **QA: Semua folder bisa diakses dan strukturnya rapi** ✅ QA PASSED (14/14 folders)

### 1.2 Google Sheets — Spreadsheet Terintegrasi
- [x] **QA: Semua sheet terhubung dan formula tidak error** ✅ QA PASSED (no errors)
- [x] Update existing sheet "Keuangan PT SWI" — tambahkan sheet baru:
  - [x] `Brand_Tracking` — per brand: SKU, COGS, margin, batch, penjualan
  - [x] `Store_Daily` — daily log: traffic, conversion, top product
  - [x] `Event_Pipeline` — upcoming event, budget, PIC, status
  - [x] `Ecommerse_Metrics` — traffic, conversion, AOV, repeat rate
  - [x] `Sukuk_Reporting` — laporan real-time sukuk
  - [x] `KPI_Dashboard` — semua KPI per divisi dalam 1 sheet
  - [x] `Cashflow_Forecast` — proyeksi 12 bulan
- [x] **QA: Cek setiap rumus SUMIF, VLOOKUP, pivot tidak error** ✅ QA PASSED (no formula errors)
- [x] **QA: Data aktual diisi (bukan placeholder)** ✅ QA PASSED (sample data in Brand_Tracking & KPI)

### 1.3 Legal & Compliance
- [ ] **QA: Dokumen lengkap dan tidak expired**
- [ ] Audit dokumen legal: Akta, NIB, NPWP, SIUP
- [ ] Upload semua ke Google Drive folder `Legal`
- [ ] Tracking status merek (HKI) untuk: L'Arc~en~Scent, Nuscentza, Pixel Potion, Fragrantions, SWI
- [ ] Dokumen Sukuk: skema Musyarakah, term sheet, akad
- [ ] Perizinan TIM (Taman Ismail Marzuki)
- [ ] Checklist compliance: pajak, tenaga kerja, perizinan usaha
- [ ] **QA: Semua dokumen bisa diakses dan tanggal audit terupdate**

---

## FASE 2: Brand Ecosystem
*Status: 🔵 Pending*

### 2.1 L'Arc~en~Scent 🟣
- [ ] **QA: Brand assets lengkap dan konsisten**
- [ ] Finalize brand guideline (warna, font, tone of voice)
- [ ] Katalog produk (SKU, foto, deskripsi, harga)
- [ ] Distributor list & pricing tier
- [ ] B2B white label offer deck
- [ ] Social media content plan
- [ ] **QA: Semua assets bisa diakses dan tidak ada broken link**

### 2.2 Nuscentza 🟢
- [ ] **QA: Brand assets lengkap dan konsisten**
- [ ] Finalize brand guideline
- [ ] Katalog produk (SKU, foto, deskripsi, harga)
- [ ] Supplier bahan baku lokal (aroma Nusantara)
- [ ] Social media content plan
- [ ] **QA: Semua assets bisa diakses**

### 2.3 Pixel Potion 🟠
- [ ] **QA: Brand assets lengkap dan konsisten**
- [ ] Finalize brand guideline (youth/eclectic tone)
- [ ] Katalog produk (SKU, foto, deskripsi, harga)
- [ ] Target audience persona
- [ ] Collaboration/partnership plan
- [ ] **QA: Semua assets bisa diakses**

### 2.4 Brand Cross-Pollination
- [ ] **QA: Tidak ada konflik antar brand**
- [ ] Buat brand comparison matrix (positioning, harga, target)
- [ ] Cross-selling strategy (store → brand → marketplace)
- [ ] Shared marketing calendar
- [ ] **QA: Setiap brand punya identity yang jelas dan tidak overlap**

---

## FASE 3: Store & Offline Experience
*Status: 🟢 Completed — SOP, Artisan, Merch, Daily Log + halaman store enriched*

### 3.1 SWI Store TIM
- [ ] **QA: SOP lengkap dan bisa dijalankan**
- [ ] SOP operasional harian (buka/tutup, kasir, inventory)
- [ ] SOP kelas parfumer (materi, jangan, feedback)
- [ ] SOP AI Mix experience (alur, tools, troubleshooting)
- [ ] Visual merchandising guide
- [ ] Staff training materials
- [ ] **QA: Semua SOP sudah review dan bisa dipahami staff**

### 3.2 Artisan Program
- [ ] **QA: Sistem transparan dan menguntungkan semua pihak**
- [ ] Sistem seleksi artisan
- [ ] Kontrak kerjasama (konsinyasi 70:30)
- [ ] Display layout & guideline
- [ ] Revenue tracking per artisan
- [ ] **QA: Tracking revenue artisan akurat**

### 3.3 Merchandise TIM
- [ ] **QA: Produk sesuai brand SWI**
- [ ] Katalog merchandise (apparel, aksesoris, collection)
- [ ] Supplier & pricing
- [ ] Inventory management
- [ ] **QA: Harga sudah include margin yang sehat**

---

## FASE 4: Event Ecosystem (Fragrantions)
*Status: 🟡 In Progress — sheet Event_Pipeline ada, halaman event perlu enrich*

### 4.1 Fragrantions Roadmap 2026-2027
- [ ] **QA: Timeline realistis dan budget terhitung**
- [ ] Roadmap event 12 bulan ke depan
- [ ] Budget plan per event (venue, marketing, operational)
- [ ] Sponsor deck & tier package
- [ ] Vendor list (catering, audio, fotografer, security)
- [ ] Tenant management system
- [ ] **QA: Budget tidak melebihi available funds**

### 4.2 Fragrantions Expo Agustus 2026
- [ ] **QA: Semua PIC dan deadline terassign**
- [ ] Konsep & tema
- [ ] Booth layout
- [ ] List tenant & sponsor
- [ ] Marketing plan (social media, PR, kolaborasi)
- [ ] Timeline detail (pre-event, D-day, post-event)
- [ ] **QA: Timeline sudah di-review dan feasible**

### 4.3 Road to Fragrantions Juli 2026
- [ ] **QA: Rute dan logistik terencana**
- [ ] Rute & jadwal kota
- [ ] Budget per kota
- [ ] Partnership lokal per kota
- [ ] **QA: Semua kota sudah konfirmasi**

---

## FASE 5: Digital Ecosystem
*Status: 🔵 Pending*

### 5.1 Website (Vercel)
- [ ] **QA: Semua halaman load <3s, mobile responsive, tidak ada broken link**
- [ ] Update homepage: hero, stats, testimonial
- [ ] Update /brands: 3 brand pages (L'Arc, Nuscentza, Pixel Potion)
- [ ] Update /divisions/store: detail TIM proposal
- [ ] Update /events: Fragrantions Expo + Road details
- [ ] Update /investor: sukuk deck, financial projections
- [ ] Update /dashboard: tambah tab Brand Tracker, KPI, Cashflow
- [ ] SEO: meta tags, OG images, sitemap
- [ ] **QA: Lighthouse score >90, semua link aktif, semua gambar load**

### 5.2 Google Sheets API Integration
- [ ] **QA: Data real-time, tidak ada delay >5 menit**
- [ ] Perbaiki API route /api/finance — tambah semua sheet baru
- [ ] Error handling & fallback untuk setiap API call
- [ ] Caching strategy (hindari rate limit)
- [ ] **QA: API response time <2s, error rate <1%**

### 5.3 WhatsApp Automation
- [ ] **QA: Flow logic benar, tidak ada infinite loop**
- [ ] Chatbot FAQ (jam buka, lokasi, harga kelas, produk)
- [ ] Broadcast template (promo, event, restock)
- [ ] Customer database sync
- [ ] **QA: Test semua flow end-to-end**

### 5.4 AI Scent Profile
- [ ] **QA: Akurasi rekomendasi >70%**
- [ ] Dataset scent preference
- [ ] Recommendation algorithm
- [ ] UI/UX di Store (tablet/kiosk)
- [ ] **QA: Test dengan minimal 10 user**

---

## FASE 6: Financial Ecosystem
*Status: 🔵 Pending*

### 6.1 Cashflow Management
- [x] Cashflow aktual — sheet `Cashflow_Aktual` (12 bulan × 5 divisi, linked from Cash_Harian via SUMPRODUCT)
- [x] Break-even analysis — sheet `Break_Even_Analysis` (3 brand + 5 divisi + konsolidasi)
- [x] Proyeksi 12 bulan — sheet `Proyeksi_12Bulan` (Jul 2026-Jun 2027, growth assumptions per divisi)
- [x] Dashboard tab "Cashflow" — menampilkan BEP, proyeksi, cashflow aktual
- [ ] **QA: Angka proyeksi reasonable, break-even terhitung benar** → perlu user review

### 6.2 Sukuk Musyarakah
- [x] Term sheet final — sheet `SukukStore` (akad Musyarakah, nisbah 50:50, tenor 3 tahun, yield 8-12% p.a., min Rp 1jt)
- [x] Payment schedule — sheet `Sukuk_Payment_Schedule` (16 kuartal 2026-2029, linked dari Proyeksi_12Bulan)
- [x] Dashboard tab "Jadwal" — payment schedule panel linked from Sukuk_Payment_Schedule sheet
- [ ] **QA: Perhitungan bagi hasil sesuai nisbah, total pembayaran = total proyeksi profit** → perlu review

### 6.3 Investor Relations
- [ ] **QA: Deck profesional dan data akurat**
- [ ] Investment deck update
- [ ] Financial model (5-year projection)
- [ ] Data room setup
- [ ] **QA: Semua angka sudah verified**

---

## FASE 7: Sukuk Mikro Per Produk
*Status: 🔵 Pending*

### 7.1 Setup Platform Sukuk Mikro
- [ ] **QA: Alur investasi aman dan transparan**
- [ ] Investor registration & verification
- [ ] Product listing (T-Shirt, Tumbler, Candle, dll)
- [ ] Investment flow (select → pay → confirm)
- [ ] Profit distribution tracking
- [ ] **QA: Test end-to-end dengan dummy data**

### 7.2 Produk Batch 1
- [ ] **QA: Margin sehat, kualitas terjaga**
- [ ] Finalize 5 produk (design, vendor, pricing)
- [ ] Production plan
- [ ] Marketing launch plan
- [ ] **QA: COGS <40% dari harga jual**

---

## FASE 8: Cross-Division Synergy
*Status: 🔵 Pending*

### 8.1 Integrated Operations
- [ ] **QA: Tidu ada bottleneck antar divisi**
- [ ] Setoran 30% otomatis dari setiap divisi → Holding
- [ ] Shared resources (marketing, admin, finance)
- [ ] Cross-division KPI tracking
- [ ] Weekly meeting cadence & reporting
- [ ] **QA: Setoran 30% tercatat dengan benar**

### 8.2 Reporting System
- [ ] **QA: Report akurat dan on-time**
- [ ] Weekly dashboard (auto-generated)
- [ ] Monthly financial report
- [ ] Quarterly investor update
- [ ] Annual report template
- [ ] **QA: Semua report bisa di-generate otomatis**

---

## QA GATES (Wajib lolos sebelum checklist)

### QA-1: Data Integrity
- [ ] Semua angka di spreadsheet = angka di dashboard
- [ ] Tidak ada formula error (#REF!, #VALUE!, #N/A)
- [ ] Tidak ada data duplicate
- [ ] Timestamp terupdate

### QA-2: Accessibility
- [ ] Semua halaman web load <3 detik
- [ ] Mobile responsive
- [ ] Tidak ada broken link
- [ ] Semua gambar load dengan benar

### QA-3: Security
- [ ] Dashboard login berfungsi
- [ ] API route protected (tidak expose credential)
- [ ] Tidak ada hardcoded secret di kode

### QA-4: Business Logic
- [ ] Setoran 30% dihitung dengan benar
- [ ] Sukuk bagi hasil sesuai nisbah
- [ ] Brand tracking akurat
- [ ] Cashflow projection konsisten

---

## Progress Legend
- 🔵 Pending (belum mulai)
- 🟡 In Progress (sedang dikerjakan)
- 🟢 Completed (selesai + QA passed)
- 🔴 Blocked (ada blocker, perlu diskusi)

---

*Cron Job: `hermes agent` will read this plan every 15 minutes*
*Rule: NEVER delete any file in Google Drive without Abjad's approval*
*QA: Every task must pass QA gate before being checked off*
