// @ts-nocheck
// scripts/migrate-sheets-to-db.ts
// One-time migration: Google Sheets → SQLite database
// Run with: npx ts-node scripts/migrate-sheets-to-db.ts

import { db } from '../src/lib/db';

// This is a template migration script.
// In production, you would:
// 1. Read from Google Sheets API or exported CSV
// 2. Transform data to match database schema
// 3. Insert into database with conflict handling

interface MigrationStats {
  sukukInserted: number;
  sukukSkipped: number;
  investorsInserted: number;
  investorsSkipped: number;
  investmentsInserted: number;
  distributionsInserted: number;
  errors: string[];
}

function migrate(): MigrationStats {
  const stats: MigrationStats = {
    sukukInserted: 0,
    sukukSkipped: 0,
    investorsInserted: 0,
    investorsSkipped: 0,
    investmentsInserted: 0,
    distributionsInserted: 0,
    errors: [],
  };

  // ─── STEP 1: Migrate Sukuk ─────────────────────────────────────────
  // In production, replace this with actual Sheets API data
  const sukukData: any[] = [
    // Example: { nama: 'Sukuk Ijarah Masjid', total_dana: 500000000, imbal_hasil: 12.5, tenor_bulan: 24, ... }
  ];

  for (const sukuk of sukukData) {
    try {
      const existing = db.prepare('SELECT id FROM sukuk WHERE nama = ?').get(sukuk.nama);
      if (existing) {
        stats.sukukSkipped++;
        continue;
      }
      db.prepare(`
        INSERT INTO sukuk (nama, kode, total_dana, imbal_hasil, tenor_bulan, tanggal_terbit, tanggal_jatuh_tempo, status, deskripsi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        sukuk.nama, sukuk.kode || null, sukuk.total_dana, sukuk.imbal_hasil,
        sukuk.tenor_bulan, sukuk.tanggal_terbit, sukuk.tanggal_jatuh_tempo,
        sukuk.status || 'active', sukuk.deskripsi || null
      );
      stats.sukukInserted++;
    } catch (e: any) {
      stats.errors.push(`Sukuk "${sukuk.nama}": ${e.message}`);
    }
  }

  // ─── STEP 2: Migrate Investors ─────────────────────────────────────
  // In production, replace with Sheets data
  const investorData = [
    // Example: { nama: 'John Doe', email: 'john@example.com', phone: '081234567890', ... }
  ];

  for (const inv of investorData) {
    try {
      const existing = db.prepare('SELECT id FROM investors WHERE email = ?').get(inv.email);
      if (existing) {
        stats.investorsSkipped++;
        continue;
      }
      db.prepare(`
        INSERT INTO investors (nama, email, phone, ktp, npwp, alamat, bank, rekening, status, kyc_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        inv.nama, inv.email, inv.phone || null, inv.ktp || null,
        inv.npwp || null, inv.alamat || null, inv.bank || null,
        inv.rekening || null, inv.status || 'pending', inv.kyc_status || 'unverified'
      );
      stats.investorsInserted++;
    } catch (e: any) {
      stats.errors.push(`Investor "${inv.nama}": ${e.message}`);
    }
  }

  // ─── STEP 3: Migrate Investments ───────────────────────────────────
  const investmentData = [
    // Example: { investor_email: 'john@example.com', sukuk_nama: 'Sukuk Ijarah Masjid', jumlah: 10000000, ... }
  ];

  for (const inv of investmentData) {
    try {
      const investor = db.prepare('SELECT id FROM investors WHERE email = ?').get(inv.investor_email) as any;
      const sukuk = db.prepare('SELECT id FROM sukuk WHERE nama = ?').get(inv.sukuk_nama) as any;
      if (!investor || !sukuk) {
        stats.errors.push(`Investment: investor "${inv.investor_email}" or sukuk "${inv.sukuk_nama}" not found`);
        continue;
      }
      const existing = db.prepare('SELECT id FROM sukuk_investments WHERE investor_id = ? AND sukuk_id = ?')
        .get(investor.id, sukuk.id);
      if (existing) continue;
      db.prepare(`
        INSERT INTO sukuk_investments (investor_id, sukuk_id, jumlah_investasi, tanggal_investasi, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(investor.id, sukuk.id, inv.jumlah, inv.tanggal || new Date().toISOString().split('T')[0], inv.status || 'active');
      stats.investmentsInserted++;
    } catch (e: any) {
      stats.errors.push(`Investment: ${e.message}`);
    }
  }

  return stats;
}

// ─── Run migration ──────────────────────────────────────────────────────
console.log('🚀 Starting migration: Google Sheets → SQLite\n');

try {
  const stats = migrate();

  console.log('📊 Migration Results:');
  console.log(`  Sukuk:        ${stats.sukukInserted} inserted, ${stats.sukukSkipped} skipped`);
  console.log(`  Investors:    ${stats.investorsInserted} inserted, ${stats.investorsSkipped} skipped`);
  console.log(`  Investments:  ${stats.investmentsInserted} inserted`);
  console.log(`  Distributions:${stats.distributionsInserted} inserted`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  ${stats.errors.length} errors:`);
    stats.errors.forEach(e => console.log(`  - ${e}`));
  } else {
    console.log('\n✅ Migration completed without errors!');
  }

  // Show current DB state
  console.log('\n📦 Database state:');
  const tables = ['sukuk', 'investors', 'sukuk_investments', 'profit_distributions', 'users'];
  for (const table of tables) {
    const count = db.prepare(`SELECT COUNT(*) as n FROM ${table}`).get() as any;
    console.log(`  ${table}: ${count.n} rows`);
  }
} catch (e: any) {
  console.error('❌ Migration failed:', e.message);
  process.exit(1);
}
