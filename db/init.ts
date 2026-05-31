// Database initialization — SQLite via better-sqlite3
// Run: npx tsx db/init.ts

import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

const DB_PATH = path.join(process.cwd(), "db", "sukuk.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Remove existing DB for fresh start (optional — comment out to keep data)
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("🗑️  Removed existing database");
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Execute schema
const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
db.exec(schema);

console.log("✅ Database initialized at:", DB_PATH);
console.log("✅ Schema executed from:", SCHEMA_PATH);

// Verify tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
console.log("\n📊 Tables created:");
tables.forEach(t => console.log(`  - ${t.name}`));

// Verify seed data
const sukukCount = db.prepare("SELECT COUNT(*) as cnt FROM sukuk").get() as { cnt: number };
const userCount = db.prepare("SELECT COUNT(*) as cnt FROM users").get() as { cnt: number };
const rabCount = db.prepare("SELECT COUNT(*) as cnt FROM rab_items").get() as { cnt: number };

console.log("\n🌱 Seed data:");
console.log(`  - Sukuk: ${sukukCount.cnt}`);
console.log(`  - Users: ${userCount.cnt}`);
console.log(`  - RAB items: ${rabCount.cnt}`);

// Test views
const progress = db.prepare("SELECT * FROM v_sukuk_progress").all();
console.log("\n📈 Sukuk progress view:");
progress.forEach((p: any) => {
  console.log(`  - ${p.kode}: ${p.unit_terjual}/${p.target_unit} unit (${p.pct_terjual}%) — Rp ${(p.total_terkumpul/1_000_000).toFixed(0)}jt (${p.pct_terkumpul}%)`);
});

db.close();
console.log("\n✅ Done! Database ready.");
