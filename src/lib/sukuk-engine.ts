// src/lib/sukuk-engine.ts
// Sukuk Engine — Calculator bagi hasil, jadwal pembayaran, KYC
// Menggunakan prinsip Mudharabah/Musyarakah (bagi hasil, bukan bunga)
import { readRange, writeRange, appendRows, SPREADSHEET_ID } from "./sheets";

export const SPREADSHEET = SPREADSHEET_ID;

// ── Types ──────────────────────────────────────────────────────────

export interface SukukParams {
  nilaiSukuk: number;       // Total nilai sukuk (Rp)
  jenisAkad: "mudharabah" | "musyarakah" | "murabahah" | "ijarah";
  nisbahInvestor: number;   // % bagi hasil investor (0-100)
  nisbahSWI: number;        // % bagi hasil SWI
  tenorBulan: number;       // Jangka waktu (bulan)
  frekuensiBagiHasil: "bulanan" | "quarterly" | "semesteran" | "tahunan";
  tanggalMulai: string;
  tanggalAkhir: string;
  estimasiImbalan: number;  // % estimasi imbalan per tahun
}

export interface Investor {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  ktp: string;
  npwp: string;
  bank: string;
  rekening: string;
  namaRekening: string;
  statusKyc: "pending" | "verified" | "rejected";
  tanggalDaftar: string;
  totalInvestasi: number;
}

export interface InvestasiSukuk {
  investorId: number;
  investorNama: string;
  sukukId: string;
  nominal: number;
  unit: number;
  tanggalSetor: string;
  status: "pending" | "confirmed" | "cancelled";
  buktiSetor: string;
}

export interface JadwalBagiHasil {
  periode: string;          // YYYY-MM
  tanggalBayar: string;
  revenue: number;
  cogs: number;
  biayaOperasional: number;
  labaKotor: number;
  labaBersih: number;
  bagiHasilTotal: number;
  bagianInvestor: number;
  bagianSWI: number;
  bagianTim: number;        // fee 10%
  bagianReserve: number;    // reserve fund 5%
  status: "projected" | "calculated" | "distributed" | "paid";
}

export interface DistribusiInvestor {
  investorId: number;
  investorNama: string;
  unit: number;
  pctPortofolio: number;
  nominalBagiHasil: number;
  pph: number;             // PPh 21 (10% untuk OP)
  netPayout: number;
  tanggalBayar: string;
  status: "pending" | "processing" | "paid" | "failed";
  referensi: string;
}

export interface KycChecklist {
  ktp: boolean;
  npwp: boolean;
  rekeningKoran: boolean;
  suratKemampuan: boolean;
  formMt4: boolean;
  formRf: boolean;
  videoPerjanjian: boolean;
  verifiedBy: string;
  verifiedAt: string;
  catatan: string;
}

// ── Bagi Hasil Calculator ──────────────────────────────────────────

/** Hitung jadwal bagi hasil berdasarkan parameter sukuk */
export function hitungJadwalBagiHasil(
  params: SukukParams,
  revenueProyeksi: number[] // revenue per bulan
): JadwalBagiHasil[] {
  const jadwal: JadwalBagiHasil[] = [];
  const bulanPerPeriode = params.frekuensiBagiHasil === "bulanan" ? 1 :
                           params.frekuensiBagiHasil === "quarterly" ? 3 :
                           params.frekuensiBagiHasil === "semesteran" ? 6 : 12;

  let periodeRevenue: number[] = [];
  let periodeIndex = 0;

  for (let i = 0; i < revenueProyeksi.length; i++) {
    periodeRevenue.push(revenueProyeksi[i]);

    if (periodeRevenue.length === bulanPerPeriode || i === revenueProyeksi.length - 1) {
      periodeIndex++;
      const totalRevenue = periodeRevenue.reduce((a, b) => a + b, 0);
      const cogs = Math.round(totalRevenue * 0.6); // asumsi COGS 60%
      const biayaOps = Math.round(totalRevenue * 0.15); // asumsi 15%
      const labaKotor = totalRevenue - cogs;
      const labaBersih = labaKotor - biayaOps;

      // Bagi hasil sesuai nisbah
      const bagianInvestor = Math.round(labaBersih * (params.nisbahInvestor / 100));
      const bagianSWI = Math.round(labaBersih * (params.nisbahSWI / 100));
      const bagianTim = Math.round(labaBersih * 0.10); // 10% fee
      const bagianReserve = Math.round(labaBersih * 0.05); // 5% reserve
      const bagiHasilTotal = bagianInvestor + bagianSWI + bagianTim + bagianReserve;

      const startDate = new Date(params.tanggalMulai);
      const periodeDate = new Date(startDate);
      periodeDate.setMonth(periodeDate.getMonth() + (periodeIndex * bulanPerPeriode));
      const periodeStr = `${periodeDate.getFullYear()}-${String(periodeDate.getMonth() + 1).padStart(2, "0")}`;

      const bayarDate = new Date(periodeDate);
      bayarDate.setDate(bayarDate.getDate() + 7); // bayar 7 hari setelah periode

      jadwal.push({
        periode: periodeStr,
        tanggalBayar: bayarDate.toISOString().split("T")[0],
        revenue: totalRevenue,
        cogs,
        biayaOperasional: biayaOps,
        labaKotor,
        labaBersih,
        bagiHasilTotal,
        bagianInvestor,
        bagianSWI,
        bagianTim,
        bagianReserve,
        status: "projected",
      });

      periodeRevenue = [];
    }
  }

  return jadwal;
}

/** Hitung distribusi bagi hasil per investor */
export function hitungDistribusiInvestor(
  jadwal: JadwalBagiHasil,
  investasi: InvestasiSukuk[]
): DistribusiInvestor[] {
  const totalUnit = investasi.reduce((s, i) => s + i.unit, 0);
  const pphRate = 0.10; // PPh 21 10% untuk orang pribadi

  return investasi.map((inv) => {
    const pctPortofolio = totalUnit > 0 ? (inv.unit / totalUnit) * 100 : 0;
    const nominalBagiHasil = Math.round(jadwal.bagianInvestor * (inv.unit / totalUnit));
    const pph = Math.round(nominalBagiHasil * pphRate);
    const netPayout = nominalBagiHasil - pph;

    return {
      investorId: inv.investorId,
      investorNama: inv.investorNama,
      unit: inv.unit,
      pctPortofolio,
      nominalBagiHasil,
      pph,
      netPayout,
      tanggalBayar: jadwal.tanggalBayar,
      status: "pending",
      referensi: `BHS-${jadwal.periode}-${inv.investorId}`,
    };
  });
}

// ── Imbalan Calculator (Mudharabah/Musyarakah) ────────────────────

/** Hitung imbalan investor berdasarkan prinsip syariah */
export function hitungImbalan(params: {
  modalInvestor: number;
  jenisAkad: "mudharabah" | "musyarakah";
  nisbahInvestor: number;  // 60 = 60% untuk investor
  nisbahSWI: number;       // 40 = 40% untuk SWI
  labaBersih: number;
}): {
  bagianInvestor: number;
  bagianSWI: number;
  imbalanPerUnit: number;
  yieldPct: number;
} {
  const bagianInvestor = Math.round(params.labaBersih * (params.nisbahInvestor / 100));
  const bagianSWI = Math.round(params.labaBersih * (params.nisbahSWI / 100));
  const imbalanPerUnit = params.modalInvestor > 0 ? Math.round(bagianInvestor / (params.modalInvestor / 1000000)) : 0;
  const yieldPct = params.modalInvestor > 0 ? (bagianInvestor / params.modalInvestor) * 100 : 0;

  return { bagianInvestor, bagianSWI, imbalanPerUnit, yieldPct };
}

// ── KYC Validation ────────────────────────────────────────────────

/** Validasi KYC investor */
export function validasiKyc(checklist: KycChecklist): {
  isComplete: boolean;
  missingItems: string[];
  score: number;  // 0-100
} {
  const items: [string, boolean][] = [
    ["KTP", checklist.ktp],
    ["NPWP", checklist.npwp],
    ["Rekening Koran", checklist.rekeningKoran],
    ["Surat Kemampuan", checklist.suratKemampuan],
    ["Form MT4", checklist.formMt4],
    ["Form RF", checklist.formRf],
    ["Video Perjanjian", checklist.videoPerjanjian],
  ];

  const completed = items.filter(([, v]) => v).length;
  const total = items.length;
  const score = Math.round((completed / total) * 100);
  const missingItems = items.filter(([, v]) => !v).map(([k]) => k);
  const isComplete = completed === total;

  return { isComplete, missingItems, score };
}

// ── Write ke Google Sheets ────────────────────────────────────────

/** Simpan jadwal bagi hasil ke sheet Sukuk_Payment_Schedule */
export async function simpanJadwalBagiHasil(jadwal: JadwalBagiHasil[]): Promise<void> {
  const rows = jadwal.map((j) => [
    j.periode,
    j.tanggalBayar,
    j.revenue,
    j.cogs,
    j.biayaOperasional,
    j.labaKotor,
    j.labaBersih,
    j.bagiHasilTotal,
    j.bagianInvestor,
    j.bagianSWI,
    j.bagianTim,
    j.bagianReserve,
    j.status,
  ]);

  // Append ke sheet
  await appendRows("SukukPaymentSchedule", rows);
}

/** Simpan distribusi investor ke sheet profit_distributions */
export async function simpanDistribusiInvestor(dists: DistribusiInvestor[], periode: string): Promise<void> {
  const rows = dists.map((d) => [
    d.investorId,
    d.investorNama,
    d.unit,
    d.pctPortofolio,
    d.nominalBagiHasil,
    d.pph,
    d.netPayout,
    d.tanggalBayar,
    d.status,
    d.referensi,
  ]);

  await appendRows("SukukPaymentSchedule", rows);
}

/** Simpan KYC investor */
export async function simpanKyc(investor: Investor, checklist: KycChecklist): Promise<void> {
  const kycScore = validasiKyc(checklist);
  const row = [
    investor.nama,
    investor.email,
    investor.telepon,
    investor.ktp,
    investor.npwp,
    investor.bank,
    investor.rekening,
    investor.totalInvestasi,
    investor.statusKyc,
    kycScore.score,
    checklist.verifiedBy || "",
    checklist.verifiedAt || "",
    checklist.catatan || "",
  ];

  await appendRows("PemegangSaham", [row]); // reuse sheet atau buat sheet KYC khusus
}

// ── Baca data investor & sukuk dari sheet ──────────────────────────

export async function bacaInvestorSukuk(): Promise<{
  sukuk: any[][];
  investor: any[][];
  sukukProduk: any[][];
}> {
  const [sukuk, investor, sukukProduk] = await Promise.all([
    readRange("SukukStore!A4:O9"),
    readRange("PemegangSaham!A1:G16"),
    readRange("SukukProduk!A6:L13"),
  ]);

  return { sukuk, investor, sukukProduk };
}
