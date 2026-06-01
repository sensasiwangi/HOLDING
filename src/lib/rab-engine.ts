// src/lib/rab-engine.ts
// RAB Engine — Rencana Anggaran Biaya per divisi/brand
import { readRange, writeRange, appendRows, SPREADSHEET_ID } from "./sheets";

export const SPREADSHEET = SPREADSHEET_ID;

// ── Types ──────────────────────────────────────────────────────────

export interface RabItem {
  kode: string;
  kategori: string;
  subKategori: string;
  item: string;
  qty: number;
  satuan: string;
  hargaSatuan: number;
  total: number;
  sumberDana: "investor" | "swi" | "laba";
  pic: string;
  keterangan: string;
  fase: "phase1" | "phase2" | "phase3";
  status: "planned" | "approved" | "in_progress" | "done" | "cancelled";
  progresPct: number;
}

export interface RabSummary {
  divisi: string;
  totalAnggaran: number;
  totalRealisasi: number;
  sisaAnggaran: number;
  progresPct: number;
  perFase: Record<string, { anggaran: number; realisasi: number }>;
  perKategori: Record<string, { anggaran: number; realisasi: number }>;
  perSumberDana: Record<string, number>;
}

// ── Parse RAB dari Google Sheets ───────────────────────────────────

export async function bacaRab(divisi: string = "Store"): Promise<RabItem[]> {
  const sheetName = divisi === "Store" ? "RABStoreTIM" :
                    divisi === "Event" ? "RABStoreTIM" :
                    divisi === "Ecommerse" ? "RABStoreTIM" : "RABStoreTIM";

  const data = await readRange(`${sheetName}!A1:J60`);
  const items: RabItem[] = [];

  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[0] || !r[3]) continue;

    const qty = parseNum(r[4]);
    const hargaSatuan = parseNum(r[6]);
    const total = parseNum(r[7]) || (qty * hargaSatuan);

    items.push({
      kode: String(r[0]).trim(),
      kategori: String(r[1]).trim(),
      subKategori: String(r[2] || "").trim(),
      item: String(r[3]).trim(),
      qty,
      satuan: String(r[5] || "unit").trim(),
      hargaSatuan,
      total,
      sumberDana: (String(r[8] || "investor").trim()) as any,
      pic: String(r[9] || "").trim(),
      keterangan: String(r[10] || "").trim(),
      fase: (String(r[11] || "phase1").trim()) as any,
      status: "planned",
      progresPct: 0,
    });
  }

  return items;
}

/** Hitung summary RAB per divisi */
export function hitungRabSummary(items: RabItem[], divisi: string): RabSummary {
  const totalAnggaran = items.reduce((s, i) => s + i.total, 0);
  const totalRealisasi = items.filter((i) => i.status === "done").reduce((s, i) => s + i.total, 0);
  const progresPct = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  const perFase: Record<string, { anggaran: number; realisasi: number }> = {};
  const perKategori: Record<string, { anggaran: number; realisasi: number }> = {};
  const perSumberDana: Record<string, number> = {};

  items.forEach((item) => {
    // Per fase
    if (!perFase[item.fase]) perFase[item.fase] = { anggaran: 0, realisasi: 0 };
    perFase[item.fase].anggaran += item.total;
    if (item.status === "done") perFase[item.fase].realisasi += item.total;

    // Per kategori
    if (!perKategori[item.kategori]) perKategori[item.kategori] = { anggaran: 0, realisasi: 0 };
    perKategori[item.kategori].anggaran += item.total;
    if (item.status === "done") perKategori[item.kategori].realisasi += item.total;

    // Per sumber dana
    perSumberDana[item.sumberDana] = (perSumberDana[item.sumberDana] || 0) + item.total;
  });

  return {
    divisi,
    totalAnggaran,
    totalRealisasi,
    sisaAnggaran: totalAnggaran - totalRealisasi,
    progresPct,
    perFase,
    perKategori,
    perSumberDana,
  };
}

/** Tambah item RAB baru */
export async function tambahRabItem(item: Omit<RabItem, "total" | "status" | "progresPct">): Promise<void> {
  const total = item.qty * item.hargaSatuan;
  await appendRows("RABStoreTIM", [[
    item.kode,
    item.kategori,
    item.subKategori,
    item.item,
    item.qty,
    item.satuan,
    item.hargaSatuan,
    total,
    item.sumberDana,
    item.pic,
    item.keterangan,
    item.fase,
  ]]);
}

/** Update status/progres item RAB */
export async function updateRabProgres(kode: string, status: string, progresPct: number): Promise<void> {
  const data = await readRange("RABStoreTIM!A1:L60");
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === kode) {
      // Update kolom status dan progres (asumsi kolom L = status, M = progres)
      // Sesuaikan dengan struktur sheet yang ada
      break;
    }
  }
}

function parseNum(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
