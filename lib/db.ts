// Database connection singleton
// Usage: import { db } from "@/lib/db"

import Database from "better-sqlite3";
import * as path from "path";

const DB_PATH = path.join(process.cwd(), "db", "sukuk.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

// Helper types
export interface Investor {
  id: number;
  no: number;
  nama: string;
  jenis: string;
  ktp: string;
  npwp: string;
  phone: string;
  email: string;
  bank: string;
  rekening_number: string;
  rekening_name: string;
  alamat: string | null;
  status: string;
  kyc_verified: number;
  kyc_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sukuk {
  id: number;
  kode: string;
  nama: string;
  jenis_akad: string;
  nilai_sukuk: number;
  harga_unit: number;
  total_unit: number;
  unit_terjual: number;
  target_unit: number;
  nisbah_investor_pct: number;
  nisbah_swi_pct: number;
  tim_fee_pct: number;
  reserve_pct: number;
  tenor_bulan: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SukukInvestment {
  id: number;
  sukuk_id: number;
  investor_id: number;
  unit: number;
  nominal: number;
  harga_per_unit: number;
  pct_portfolio: number | null;
  tanggal_setor: string | null;
  status: string;
  created_at: string;
}

export interface ProfitDistribution {
  id: number;
  sukuk_id: number;
  periode: string;
  revenue: number;
  cogs: number;
  biaya_operasional: number;
  biaya_lain: number;
  laba_kotor: number;
  laba_bersih: number;
  tim_fee: number;
  reserve_fund: number;
  bagi_hasil_total: number;
  bagi_investor_total: number;
  bagi_swi_total: number;
  kumulatif_investor: number;
  status: string;
  created_at: string;
  updated_at: string;
}
