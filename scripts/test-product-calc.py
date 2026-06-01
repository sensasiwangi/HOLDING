#!/usr/bin/env python3
"""Test product calculator — analisis penjualan per brand & varian"""
import json, urllib.request, urllib.parse

with open('/home/ubuntu/.hermes/google_token.json') as f:
    token_data = json.load(f)

TOKEN = token_data.get('token', '')
SPREADSHEET_ID = '1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA'

def api_get(range_str):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{urllib.parse.quote(range_str)}?access_token={TOKEN}"
    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req, timeout=10)
    return json.loads(resp.read()).get('values', [])

def parse_num(val):
    if not val: return 0
    cleaned = ''.join(c for c in str(val) if c.isdigit() or c == '.' or c == '-')
    try: return float(cleaned) if cleaned else 0
    except: return 0

def fmt(n):
    if abs(n) >= 1_000_000: return f"Rp {n/1_000_000:.1f}M"
    if abs(n) >= 1_000: return f"Rp {n/1_000:.0f}rb"
    return f"Rp {n:,.0f}"

# ── Baca data ──────────────────────────────────────────────────────
brand_data = api_get("Brand_Tracking!A1:K50")
merch_data = api_get("Merch_TIM!A1:L20")

# Parse variants
variants = []
for i, r in enumerate(brand_data[1:], 1):
    if not r[0] or not r[1]: continue
    v = {
        'brand': str(r[0]),
        'sku': str(r[1]),
        'nama': str(r[2]),
        'cogs': parse_num(r[3]),
        'harga': parse_num(r[4]),
        'margin_pct': parse_num(r[5]),
        'batch': str(r[6]),
        'terjual': parse_num(r[7]),
        'pendapatan': parse_num(r[8]),
        'status': str(r[9]) if len(r) > 9 else '',
    }
    v['margin_rp'] = v['harga'] - v['cogs']
    v['cogs_total'] = v['cogs'] * v['terjual']
    variants.append(v)

# Parse merch
merch = []
for i, r in enumerate(merch_data[1:], 1):
    if not r[0]: continue
    m = {
        'sku': str(r[0]),
        'nama': str(r[1]),
        'kategori': str(r[2]),
        'cogs': parse_num(r[5]),
        'harga': parse_num(r[6]),
        'margin_pct': parse_num(r[7]),
        'stok': parse_num(r[8]),
        'status': str(r[11]) if len(r) > 11 else '',
    }
    m['nilai_stok'] = m['cogs'] * m['stok']
    m['potensi_jual'] = m['harga'] * m['stok']
    merch.append(m)

# ── Agregasi per brand ─────────────────────────────────────────────
print("=" * 60)
print("🏭 PENJUALAN PER BRAND & VARIAN")
print("=" * 60)

brands = {}
for v in variants:
    b = v['brand']
    if b not in brands:
        brands[b] = {'variants': [], 'total_pendapatan': 0, 'total_cogs': 0, 'total_unit': 0}
    brands[b]['variants'].append(v)
    brands[b]['total_pendapatan'] += v['pendapatan']
    brands[b]['total_cogs'] += v['cogs_total']
    brands[b]['total_unit'] += v['terjual']

total_all = {'pendapatan': 0, 'cogs': 0, 'unit': 0}

for brand, data in sorted(brands.items(), key=lambda x: -x[1]['total_pendapatan']):
    margin = data['total_pendapatan'] - data['total_cogs']
    margin_pct = (margin / data['total_pendapatan'] * 100) if data['total_pendapatan'] > 0 else 0
    
    print(f"\n{'─' * 50}")
    print(f"📦 {brand}")
    print(f"{'─' * 50}")
    print(f"  Pendapatan:  {fmt(data['total_pendapatan'])}")
    print(f"  COGS:        {fmt(data['total_cogs'])}")
    print(f"  Margin:      {fmt(margin)} ({margin_pct:.1f}%)")
    print(f"  Unit terjual:{data['total_unit']:.0f}")
    print(f"  Variants:    {len(data['variants'])}")
    
    print(f"\n  {'SKU':<12} {'Nama':<25} {'Harga':>10} {'Terjual':>8} {'Pendapatan':>12} {'Margin%':>8}")
    print(f"  {'─'*12} {'─'*25} {'─'*10} {'─'*8} {'─'*12} {'─'*8}")
    
    for v in sorted(data['variants'], key=lambda x: -x['pendapatan']):
        print(f"  {v['sku']:<12} {v['nama'][:24]:<25} {fmt(v['harga']):>10} {v['terjual']:>8.0f} {fmt(v['pendapatan']):>12} {v['margin_pct']:>7.1f}%")
    
    total_all['pendapatan'] += data['total_pendapatan']
    total_all['cogs'] += data['total_cogs']
    total_all['unit'] += data['total_unit']

# ── Total ──────────────────────────────────────────────────────────
total_margin = total_all['pendapatan'] - total_all['cogs']
total_margin_pct = (total_margin / total_all['pendapatan'] * 100) if total_all['pendapatan'] > 0 else 0

print(f"\n{'═' * 60}")
print(f"🏢 TOTAL SEMUA BRAND")
print(f"{'═' * 60}")
print(f"  Pendapatan:  {fmt(total_all['pendapatan'])}")
print(f"  COGS:        {fmt(total_all['cogs'])}")
print(f"  Margin:      {fmt(total_margin)} ({total_margin_pct:.1f}%)")
print(f"  Unit terjual:{total_all['unit']:.0f}")

# ── Merch ──────────────────────────────────────────────────────────
print(f"\n{'═' * 60}")
print(f"👕 MERCHANDISE (TIM)")
print(f"{'═' * 60}")
print(f"  {'SKU':<12} {'Nama':<28} {'Kategori':<10} {'Stok':>5} {'Harga':>10} {'Nilai Stok':>12}")
print(f"  {'─'*12} {'─'*28} {'─'*10} {'─'*5} {'─'*10} {'─'*12}")

merch_total_stok = 0
merch_total_nilai = 0
for m in merch:
    print(f"  {m['sku']:<12} {m['nama'][:27]:<28} {m['kategori']:<10} {m['stok']:>5.0f} {fmt(m['harga']):>10} {fmt(m['nilai_stok']):>12}")
    merch_total_stok += m['stok']
    merch_total_nilai += m['nilai_stok']

print(f"\n  Total stok: {merch_total_stok:.0f} pcs | Nilai stok: {fmt(merch_total_nilai)}")

# ── Break-even (fixed cost 10jt) ──────────────────────────────────
print(f"\n{'═' * 60}")
print(f"📊 BREAK-EVEN ANALYSIS (Fixed Cost: Rp 10.000.000)")
print(f"{'═' * 60}")
fixed_cost = 10_000_000
print(f"  {'Varian':<25} {'Contrib.':>10} {'BE Unit':>9} {'BE Revenue':>12}")
print(f"  {'─'*25} {'─'*10} {'─'*9} {'─'*12}")
for v in variants:
    cm = v['margin_rp']
    be_unit = math.ceil(fixed_cost / cm) if cm > 0 else 0
    be_rev = be_unit * v['harga']
    print(f"  {v['nama'][:24]:<25} {fmt(cm):>10} {be_unit:>9} {fmt(be_rev):>12}")

print(f"\n✅ Product calculator test selesai!")
