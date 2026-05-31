-- Database Schema — Sukuk Musyarakah Platform
-- SQLite via better-sqlite3
-- FASE 7.1: Initial schema

-- Enable WAL mode for better concurrent reads
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- =============================================
-- TABLE: investors
-- Data investor sukuk
-- =============================================
CREATE TABLE IF NOT EXISTS investors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    no INTEGER NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    jenis TEXT NOT NULL DEFAULT 'Perorangan' CHECK(jenis IN ('Perorangan', 'Lembaga')),
    ktp TEXT NOT NULL UNIQUE,
    npwp TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    bank TEXT NOT NULL,
    rekening_number TEXT NOT NULL,
    rekening_name TEXT NOT NULL,
    alamat TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'aktif', 'suspended', 'withdrawn')),
    kyc_verified INTEGER NOT NULL DEFAULT 0,
    kyc_verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_investors_status ON investors(status);
CREATE INDEX IF NOT EXISTS idx_investors_ktp ON investors(ktp);

-- =============================================
-- TABLE: sukuk
-- Master data sukuk
-- =============================================
CREATE TABLE IF NOT EXISTS sukuk (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    jenis_akad TEXT NOT NULL DEFAULT 'musyarakah' CHECK(jenis_akad IN ('musyarakah', 'mudharabah', 'murabahah', 'ijarah')),
    nilai_sukuk INTEGER NOT NULL,
    harga_unit INTEGER NOT NULL,
    total_unit INTEGER NOT NULL,
    unit_terjual INTEGER NOT NULL DEFAULT 0,
    target_unit INTEGER NOT NULL,
    nisbah_investor_pct REAL NOT NULL DEFAULT 42.5,
    nisbah_swi_pct REAL NOT NULL DEFAULT 42.5,
    tim_fee_pct REAL NOT NULL DEFAULT 10.0,
    reserve_pct REAL NOT NULL DEFAULT 5.0,
    tenor_bulan INTEGER NOT NULL DEFAULT 36,
    start_date TEXT,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('draft', 'open', 'closed', 'matured', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================
-- TABLE: sukuk_investments
-- Relasi investor ↔ sukuk (unit yang dibeli)
-- =============================================
CREATE TABLE IF NOT EXISTS sukuk_investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sukuk_id INTEGER NOT NULL REFERENCES sukuk(id),
    investor_id INTEGER NOT NULL REFERENCES investors(id),
    unit INTEGER NOT NULL CHECK(unit > 0),
    nominal INTEGER NOT NULL,
    harga_per_unit INTEGER NOT NULL DEFAULT 1000000,
    pct_portfolio REAL,
    tanggal_setor TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(sukuk_id, investor_id)
);

CREATE INDEX IF NOT EXISTS idx_investments_sukuk ON sukuk_investments(sukuk_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON sukuk_investments(investor_id);

-- =============================================
-- TABLE: profit_distributions
-- Perhitungan & pembagian hasil per periode
-- =============================================
CREATE TABLE IF NOT EXISTS profit_distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sukuk_id INTEGER NOT NULL REFERENCES sukuk(id),
    periode TEXT NOT NULL, -- YYYY-MM format
    revenue INTEGER NOT NULL DEFAULT 0,
    cogs INTEGER NOT NULL DEFAULT 0,
    biaya_operasional INTEGER NOT NULL DEFAULT 0,
    biaya_lain INTEGER NOT NULL DEFAULT 0,
    laba_kotor INTEGER NOT NULL DEFAULT 0,
    laba_bersih INTEGER NOT NULL DEFAULT 0,
    tim_fee INTEGER NOT NULL DEFAULT 0,
    reserve_fund INTEGER NOT NULL DEFAULT 0,
    bagi_hasil_total INTEGER NOT NULL DEFAULT 0,
    bagi_investor_total INTEGER NOT NULL DEFAULT 0,
    bagi_swi_total INTEGER NOT NULL DEFAULT 0,
    kumulatif_investor INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'projected' CHECK(status IN ('projected', 'calculated', 'distributed', 'paid')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(sukuk_id, periode)
);

CREATE INDEX IF NOT EXISTS idx_distributions_sukuk ON profit_distributions(sukuk_id);
CREATE INDEX IF NOT EXISTS idx_distributions_periode ON profit_distributions(periode);

-- =============================================
-- TABLE: investor_payouts
-- Detail pembayaran per investor
-- =============================================
CREATE TABLE IF NOT EXISTS investor_payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    distribution_id INTEGER NOT NULL REFERENCES profit_distributions(id),
    investor_id INTEGER NOT NULL REFERENCES investors(id),
    sukuk_id INTEGER NOT NULL REFERENCES sukuk(id),
    periode TEXT NOT NULL,
    unit INTEGER NOT NULL,
    bagi_hasil INTEGER NOT NULL DEFAULT 0,
    pph INTEGER NOT NULL DEFAULT 0,
    net_payout INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'paid', 'failed')),
    paid_at TEXT,
    reference TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payouts_investor ON investor_payouts(investor_id);
CREATE INDEX IF NOT EXISTS idx_payouts_distribution ON investor_payouts(distribution_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON investor_payouts(status);

-- =============================================
-- TABLE: rab_items
-- Rencana Anggaran Biaya
-- =============================================
CREATE TABLE IF NOT EXISTS rab_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT NOT NULL,
    kategori TEXT NOT NULL,
    sub_kategori TEXT,
    item TEXT NOT NULL,
    qty INTEGER DEFAULT 1,
    satuan TEXT,
    harga_satuan INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    sumber_dana TEXT CHECK(sumber_dana IN ('investor', 'swi', 'laba')),
    pic TEXT,
    keterangan TEXT,
    fase TEXT DEFAULT 'phase1' CHECK(fase IN ('phase1', 'phase2', 'phase3')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rab_kategori ON rab_items(kategori);
CREATE INDEX IF NOT EXISTS idx_rab_fase ON rab_items(fase);

-- =============================================
-- TABLE: audit_log
-- Immutable audit trail (mengkonsolidasi dari FASE 6.5)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    data_hash TEXT NOT NULL,
    prev_hash TEXT,
    verified INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- =============================================
-- TABLE: users
-- Internal users (admin, staff, auditor)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nama TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK(role IN ('admin', 'staff', 'auditor', 'viewer')),
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================
-- TABLE: notifications
-- Log notifikasi
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event TEXT NOT NULL,
    channel TEXT NOT NULL CHECK(channel IN ('telegram', 'email', 'in_app', 'webhook')),
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed', 'read')),
    error TEXT,
    sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notif_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notif_event ON notifications(event);

-- =============================================
-- TRIGGERS: Auto-update updated_at
-- =============================================
CREATE TRIGGER IF NOT EXISTS trg_investors_updated
    AFTER UPDATE ON investors
    BEGIN
        UPDATE investors SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS trg_sukuk_updated
    AFTER UPDATE ON sukuk
    BEGIN
        UPDATE sukuk SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS trg_distributions_updated
    AFTER UPDATE ON profit_distributions
    BEGIN
        UPDATE profit_distributions SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

-- =============================================
-- SEED: Default sukuk
-- =============================================
INSERT OR IGNORE INTO sukuk (kode, nama, jenis_akad, nilai_sukuk, harga_unit, total_unit, target_unit, nisbah_investor_pct, nisbah_swi_pct, tim_fee_pct, reserve_pct, tenor_bulan, status)
VALUES ('SWQ-001', 'Sukuk Musyarakah SWI Store TIM', 'musyarakah', 1000000000, 1000000, 1000, 1000, 42.5, 42.5, 10.0, 5.0, 36, 'open');

-- =============================================
-- SEED: Admin user (password: sensasiwangiindonesia090785)
-- bcrypt hash for demo — in production use proper hashing
-- =============================================
INSERT OR IGNORE INTO users (username, password_hash, nama, role)
VALUES ('beriman', '$2b$10$placeholder_hash_replace_in_production', 'Beriman Juliano', 'admin');

-- =============================================
-- SEED: RAB items dari Skema A Tight
-- =============================================
INSERT OR IGNORE INTO rab_items (kode, kategori, sub_kategori, item, qty, satuan, harga_satuan, total, sumber_dana, pic, keterangan, fase) VALUES
('A.1', 'LOKASI', 'Sewa', 'Sewa ruko kecil TIM (3 bulan + DP 1 bulan)', 3, 'bulan', 8000000, 32000000, 'investor', 'Store', 'Rp 8jt/bln × 4 bulan', 'phase1'),
('A.2', 'LOKASI', 'Utilitas', 'Listrik token + pasang MCB', 1, 'paket', 2000000, 2000000, 'investor', 'Store', 'Token + instalasi', 'phase1'),
('B.1', 'INTERIOR', 'Renovasi', 'Cat ulang DIY (2 ember cat dulux)', 2, 'ember', 250000, 500000, 'investor', 'Store', 'Warna putih + aksen', 'phase1'),
('B.2', 'INTERIOR', 'Furniture', 'Meja kasir bekas + cat ulang', 1, 'unit', 1000000, 1000000, 'investor', 'Store', 'Second, cat ulang', 'phase1'),
('B.3', 'INTERIOR', 'Furniture', 'Rak display dari palet kayu (2 unit)', 2, 'unit', 500000, 1000000, 'investor', 'Store', 'Palet bekas + cat', 'phase1'),
('B.4', 'INTERIOR', 'Furniture', 'Etalase kaca small (bekas)', 2, 'unit', 500000, 1000000, 'investor', 'Store', 'Bekas ruko tutup', 'phase1'),
('B.5', 'INTERIOR', 'Deko', 'Banner UV pengganti papan nama', 1, 'unit', 500000, 500000, 'investor', 'Store', 'Banner UV kecil', 'phase1'),
('B.6', 'INTERIOR', 'Deko', 'Kipas angin 2 unit', 2, 'unit', 250000, 500000, 'investor', 'Store', 'Bekas second', 'phase1'),
('C.1', 'SISTEM', 'Kasir', 'Laptop kasir (ThinkPad bekas)', 1, 'unit', 2500000, 2500000, 'investor', 'Store', 'i5/8GB', 'phase1'),
('C.2', 'SISTEM', 'Software', 'Software POS + Inventory (SWI in-house)', 1, 'sistem', 35000000, 35000000, 'swi', 'Dev SWI', 'Built by SWI', 'phase1'),
('D.1', 'INVENTORY', 'Bahan', 'Essence 8 varian basic', 8, 'botol', 300000, 2400000, 'investor', 'Produksi', 'Wood, floral, citrus', 'phase1'),
('D.2', 'INVENTORY', 'Bahan', 'Alkool 96% (15 liter)', 15, 'liter', 100000, 1500000, 'investor', 'Produksi', '15L cukup ~150 botol', 'phase1'),
('D.3', 'INVENTORY', 'Packaging', 'Botol parfum 60 pcs', 60, 'botol', 7000, 420000, 'investor', 'Produksi', 'Botol kaca', 'phase1'),
('D.4', 'INVENTORY', 'Packaging', 'Label printing', 60, 'set', 2000, 120000, 'investor', 'Produksi', 'Kertas sticker', 'phase1'),
('D.5', 'INVENTORY', 'Produk Jadi', 'Parfum jadi stock awal (40 botol)', 40, 'unit', 80000, 3200000, 'investor', 'Produksi SWI', 'Mix sendiri', 'phase1'),
('D.6', 'INVENTORY', 'Packaging', 'Goodie bag kertas (50 pcs)', 50, 'unit', 3000, 150000, 'investor', 'Store', 'Kantong kertas + stiker', 'phase1'),
('E.1', 'LAUNCH', 'Soft Opening', 'Soft opening (snack + undangan 15 orang)', 1, 'event', 500000, 500000, 'investor', 'Store', 'Foto hp sendiri', 'phase1'),
('E.2', 'LAUNCH', 'Digital', 'Instagram + TikTok organic (3 bulan)', 3, 'bulan', 0, 0, 'swi', 'SWI Media', 'Gratis', 'phase1'),
('E.3', 'LAUNCH', 'Branding', 'Vinyl sticker logo SWI', 1, 'paket', 500000, 500000, 'swi', 'SWI Media', 'Desain internal', 'phase1');

-- =============================================
-- VIEW: investor_summary
-- Ringkasan per investor
-- =============================================
CREATE VIEW IF NOT EXISTS v_investor_summary AS
SELECT
    i.id,
    i.no,
    i.nama,
    i.jenis,
    i.status,
    i.kyc_verified,
    SUM(si.unit) as total_unit,
    SUM(si.nominal) as total_investasi,
    COUNT(si.id) as jumlah_transaksi,
    i.created_at
FROM investors i
LEFT JOIN sukuk_investments si ON i.id = si.investor_id AND si.status != 'cancelled'
GROUP BY i.id;

-- =============================================
-- VIEW: sukuk_progress
-- Progress penawaran sukuk
-- =============================================
CREATE VIEW IF NOT EXISTS v_sukuk_progress AS
SELECT
    s.id,
    s.kode,
    s.nama,
    s.nilai_sukuk,
    s.target_unit,
    s.unit_terjual,
    ROUND(CAST(s.unit_terjual AS REAL) / s.target_unit * 100, 2) as pct_terjual,
    SUM(si.nominal) as total_terkumpul,
    ROUND(CAST(COALESCE(SUM(si.nominal), 0) AS REAL) / s.nilai_sukuk * 100, 3) as pct_terkumpul,
    COUNT(DISTINCT si.investor_id) as jumlah_investor,
    s.status
FROM sukuk s
LEFT JOIN sukuk_investments si ON s.id = si.sukuk_id AND si.status = 'confirmed'
GROUP BY s.id;
