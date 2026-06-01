#!/usr/bin/env python3
"""Test production tracker — simulasi produksi Pixel Potion"""
import json, urllib.request, urllib.parse, time

with open('/home/ubuntu/.hermes/google_token.json') as f:
    token_data = json.load(f)
TOKEN = token_data.get('token', '')
SPREADSHEET_ID = '1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA'

def api_post(range_str, values):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{urllib.parse.quote(range_str)}:append?valueInputOption=USER_ENTERED&access_token={TOKEN}"
    body = json.dumps({"values": values}).encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req, timeout=10)
    return json.loads(resp.read())

def api_put(range_str, values):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{urllib.parse.quote(range_str)}?valueInputOption=USER_ENTERED&access_token={TOKEN}"
    body = json.dumps({"values": values}).encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="PUT")
    resp = urllib.request.urlopen(req, timeout=10)
    return json.loads(resp.read())

def api_get(range_str):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{urllib.parse.quote(range_str)}?access_token={TOKEN}"
    resp = urllib.request.urlopen(url, timeout=10)
    return json.loads(resp.read()).get('values', [])

def fmt(n):
    if abs(n) >= 1_000_000: return f"Rp {n/1_000_000:.1f}M"
    if abs(n) >= 1_000: return f"Rp {n/1_000:.0f}rb"
    return f"Rp {n:,.0f}"

TANGGAL = "2025-07-15"
BRAND = "Pixel Potion"
SKU = "PXL-001"
NAMA = "Sample EDT 30ml"
BATCH = "B-2026-002"
UNIT = 100
HARGA_JUAL = 65000

print("=" * 60)
print(f"[PRODUKSI] Pixel Potion Batch {BATCH}")
print("=" * 60)

# STEP 1: Bahan Baku
print("\n[STEP 1] Pembelian Bahan Baku")
bahan_list = [
    ("Botol kaca 30ml", "pcs", 3500, 120),
    ("Essence woody aroma", "ml", 200, 3000),
    ("Alkohol 96%", "ml", 150, 5000),
    ("Stiker label Pixel", "pcs", 500, 120),
    ("Box packaging", "pcs", 1500, 110),
]
total_bahan = 0
for nama, satuan, harga, qty in bahan_list:
    total = harga * qty
    total_bahan += total
    api_post("Produksi!A:H", [["", TANGGAL, "Pembelian Bahan", nama[:10], f"{nama} - {qty} {satuan}", total, "", ""]])
    print(f"  OK {nama:<30} {qty:>4} {satuan} x {fmt(harga):>10} = {fmt(total):>12}")
print(f"  Total bahan: {fmt(total_bahan)}")

# STEP 2: Bottling
print("\n[STEP 2] Bottling")
upah = 5000
total_bottling = UNIT * upah
api_post("Produksi!A:H", [["", TANGGAL, "Bottling", BRAND, f"Bottling {NAMA} - Batch {BATCH}", total_bottling, f"{UNIT} unit x {fmt(upah)}", ""]])
print(f"  OK {UNIT} unit x {fmt(upah)} = {fmt(total_bottling)}")

# STEP 3: Packaging
print("\n[STEP 3] Packaging")
biaya_pkg = 2000
total_packaging = UNIT * biaya_pkg
api_post("Produksi!A:H", [["", TANGGAL, "Packaging", BRAND, f"Packaging {NAMA} - {UNIT} unit", total_packaging, f"{fmt(biaya_pkg)}/unit", ""]])
print(f"  OK {UNIT} unit x {fmt(biaya_pkg)} = {fmt(total_packaging)}")

# STEP 4: Produk Jadi
print("\n[STEP 4] Produk Jadi")
total_cogs = total_bahan + total_bottling + total_packaging
cogs_unit = total_cogs // UNIT if UNIT > 0 else 0
margin_unit = HARGA_JUAL - cogs_unit
margin_pct = (margin_unit / HARGA_JUAL * 100) if HARGA_JUAL > 0 else 0
total_pendapatan = HARGA_JUAL * UNIT
total_margin = margin_unit * UNIT

api_post("Produksi!A:H", [["", TANGGAL, "Produk Jadi", BRAND, f"{NAMA} - Batch {BATCH} - {UNIT} unit", total_cogs, f"COGS/unit: {fmt(cogs_unit)} | Jual: {fmt(HARGA_JUAL)} | Margin: {margin_pct:.1f}%", ""]])

# Update Brand_Tracking
brand_data = api_get("Brand_Tracking!A1:K10")
row_num = -1
for i, r in enumerate(brand_data[1:], 2):
    if r[1] == SKU:
        row_num = i
        break

if row_num > 0:
    try:
        api_put(f"Brand_Tracking!D{row_num}:E{row_num}", [[cogs_unit, HARGA_JUAL]])
        print(f"  OK Brand_Tracking updated: COGS={fmt(cogs_unit)}, Harga={fmt(HARGA_JUAL)}")
    except Exception as e:
        print(f"  WARNING Brand_Tracking update: {e}")

# Summary
print(f"\n{'=' * 60}")
print(f"[COGS BREAKDOWN] {NAMA} (Batch {BATCH})")
print(f"{'=' * 60}")
print(f"  Bahan baku:     {fmt(total_bahan):>12} ({total_bahan/total_cogs*100:.1f}%)")
print(f"  Bottling:       {fmt(total_bottling):>12} ({total_bottling/total_cogs*100:.1f}%)")
print(f"  Packaging:      {fmt(total_packaging):>12} ({total_packaging/total_cogs*100:.1f}%)")
print(f"  {'-' * 40}")
print(f"  Total COGS:     {fmt(total_cogs):>12}")
print(f"  COGS/unit:      {fmt(cogs_unit):>12}")
print(f"  Harga jual:     {fmt(HARGA_JUAL):>12}")
print(f"  Margin/unit:    {fmt(margin_unit):>12} ({margin_pct:.1f}%)")
print(f"  Pendapatan:     {fmt(total_pendapatan):>12} ({UNIT} unit)")
print(f"  Total margin:   {fmt(total_margin):>12}")

# STEP 5: Simulasi Penjualan
print(f"\n{'=' * 60}")
print(f"[SIMULASI PENJUALAN]")
print(f"{'=' * 60}")
penjualan = [
    (5, "Penjualan Store TIM", "2025-07-16"),
    (3, "Penjualan online", "2025-07-17"),
    (10, "Penjualan event", "2025-07-18"),
]
total_terjual = 0
total_penjualan = 0
for jml, catatan, tgl in penjualan:
    total_terjual += jml
    pend = jml * HARGA_JUAL
    total_penjualan += pend
    api_post("Produksi!A:H", [["", tgl, "Penjualan", BRAND, f"Penjualan {NAMA} - {jml} unit", pend, f"Batch: {BATCH} | {catatan}", ""]])
    print(f"  OK {tgl}: {jml:>3} unit - {fmt(pend):>12}  ({catatan})")

sisa = UNIT - total_terjual
print(f"\n  Total terjual: {total_terjual} unit = {fmt(total_penjualan)}")
print(f"  Sisa stok:     {sisa} unit = {fmt(sisa * HARGA_JUAL)}")
print(f"  Realized margin: {fmt(total_terjual * margin_unit)}")

# Update Brand_Tracking terjual
if row_num > 0:
    try:
        api_put(f"Brand_Tracking!F{row_num}:I{row_num}", [[margin_pct, total_terjual, total_penjualan, "Laku"]])
        print(f"\n  OK Brand_Tracking: terjual={total_terjual}, pendapatan={fmt(total_penjualan)}")
    except Exception as e:
        print(f"\n  WARNING: {e}")

# Update Cash_Harian (pemasukan penjualan)
for jml, catatan, tgl in penjualan:
    pend = jml * HARGA_JUAL
    api_post("Cash_Harian!A:I", [[tgl, "401", "Penjualan", f"Penjualan {NAMA} {jml} unit", pend, 0, f"{tgl} 12:00:00", BRAND]])

# Update Dashboard
try:
    # Hitung ulang total Store dari Cash_Harian
    cash_data = api_get("Cash_Harian!A1:I50")
    store_in = sum(float(r[4] if r[4] else 0) for r in cash_data[1:] if len(r) > 7 and r[7] == "Store" and float(r[5] if r[5] else 0) == 0)
    store_out = sum(float(r[5] if r[5] else 0) for r in cash_data[1:] if len(r) > 7 and r[7] == "Store" and float(r[5] if r[5] else 0) > 0)
    store_profit = store_in - store_out
    store_setoran = round(store_in * 0.3)
    store_sisa = store_profit - store_setoran
    api_put("Dashboard!A7:F7", [["Store", store_in, store_out, store_profit, store_setoran, store_sisa]])
    print(f"\n  OK Dashboard Store updated: pemasukan={fmt(store_in)}, laba={fmt(store_profit)}")
except Exception as e:
    print(f"\n  WARNING Dashboard: {e}")

print(f"\n[DONE] Production tracker test selesai!")
