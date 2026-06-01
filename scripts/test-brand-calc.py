#!/usr/bin/env python3
"""Test brand calculator — baca sheet per brand dan hitung formula"""
import json, urllib.request, urllib.parse, os

with open('/home/ubuntu/.hermes/google_token.json') as f:
    token_data = json.load(f)

TOKEN = token_data.get('token', '')
SPREADSHEET_ID = '1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA'
BRANDS = ['Produksi', 'Event', 'Store', 'Ecommerse']

def api_get(range_str):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{urllib.parse.quote(range_str)}?access_token={TOKEN}"
    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req, timeout=10)
    return json.loads(resp.read()).get('values', [])

def parse_jumlah(val):
    if not val: return 0
    cleaned = ''.join(c for c in str(val) if c.isdigit() or c == '.' or c == '-')
    try: return float(cleaned) if cleaned else 0
    except: return 0

def hitung_brand(brand):
    data = api_get(f"{brand}!A1:Z100")
    
    pemasukan = []
    pengeluaran = []
    section = 'header'
    
    for i, row in enumerate(data):
        if not row: continue
        
        # Deteksi section
        if len(row) > 2 and str(row[2]).strip().upper() == 'PEMASUKAN':
            section = 'pemasukan'
            continue
        if len(row) > 2 and str(row[2]).strip().upper() == 'PENGELUARAN':
            section = 'pengeluaran'
            continue
        
        if section == 'header': continue
        
        # Parse — butuh minimal kolom A (No) dan F (Jumlah)
        no = str(row[0]).strip() if row[0] else ''
        if not no or not no.isdigit(): continue
        
        jumlah = parse_jumlah(row[5]) if len(row) > 5 else 0
        kategori = str(row[3]).strip() if len(row) > 3 else ''
        
        tx = {'no': no, 'kategori': kategori, 'jumlah': jumlah}
        
        if section == 'pemasukan':
            pemasukan.append(tx)
        elif section == 'pengeluaran':
            pengeluaran.append(tx)
    
    # Formula
    total_masuk = sum(t['jumlah'] for t in pemasukan)
    total_keluar = sum(t['jumlah'] for t in pengeluaran)
    laba_rugi = total_masuk - total_keluar
    margin = (laba_rugi / total_masuk * 100) if total_masuk > 0 else 0
    setoran = round(total_masuk * 0.3)
    sisa = laba_rugi - setoran
    
    # Per kategori
    masuk_cat = {}
    keluar_cat = {}
    for t in pemasukan:
        k = t['kategori'] or 'Lainnya'
        masuk_cat[k] = masuk_cat.get(k, 0) + t['jumlah']
    for t in pengeluaran:
        k = t['kategori'] or 'Lainnya'
        keluar_cat[k] = keluar_cat.get(k, 0) + t['jumlah']
    
    return {
        'pemasukan': total_masuk,
        'pengeluaran': total_keluar,
        'laba_rugi': laba_rugi,
        'margin': margin,
        'setoran_30': setoran,
        'sisa_setoran': sisa,
        'jumlah_masuk': len(pemasukan),
        'jumlah_keluar': len(pengeluaran),
        'masuk_per_kategori': masuk_cat,
        'keluar_per_kategori': keluar_cat,
    }

# Main
print("🏭 Brand Calculator Test\n")
holding_total = {'pemasukan': 0, 'pengeluaran': 0}

for brand in BRANDS:
    print(f"=== {brand} ===")
    try:
        result = hitung_brand(brand)
        
        def fmt(n):
            if abs(n) >= 1_000_000: return f"Rp {n/1_000_000:.1f}jt"
            if abs(n) >= 1_000: return f"Rp {n/1_000:.0f}rb"
            return f"Rp {n:,.0f}"
        
        print(f"  Pemasukan:   {fmt(result['pemasukan'])}  ({result['jumlah_masuk']} tx)")
        print(f"  Pengeluaran: {fmt(result['pengeluaran'])}  ({result['jumlah_keluar']} tx)")
        print(f"  Laba/Rugi:   {fmt(result['laba_rugi'])}")
        print(f"  Margin:      {result['margin']:.1f}%")
        print(f"  Setoran 30%: {fmt(result['setoran_30'])}")
        print(f"  Sisa:        {fmt(result['sisa_setoran'])}")
        
        if result['masuk_per_kategori']:
            print(f"  📈 Masuk/kat:")
            for k, v in sorted(result['masuk_per_kategori'].items(), key=lambda x: -x[1])[:5]:
                print(f"    {k}: {fmt(v)}")
        
        if result['keluar_per_kategori']:
            print(f"  📉 Keluar/kat:")
            for k, v in sorted(result['keluar_per_kategori'].items(), key=lambda x: -x[1])[:5]:
                print(f"    {k}: {fmt(v)}")
        
        holding_total['pemasukan'] += result['pemasukan']
        holding_total['pengeluaran'] += result['pengeluaran']
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
    print()

# Holding total
laba = holding_total['pemasukan'] - holding_total['pengeluaran']
setoran = round(holding_total['pemasukan'] * 0.3)
margin = (laba / holding_total['pemasukan'] * 100) if holding_total['pemasukan'] > 0 else 0

print("=== 🏢 HOLDING TOTAL ===")
print(f"  Pemasukan:   Rp {holding_total['pemasukan']:,.0f}")
print(f"  Pengeluaran: Rp {holding_total['pengeluaran']:,.0f}")
print(f"  Laba/Rugi:   Rp {laba:,.0f}")
print(f"  Margin:      {margin:.1f}%")
print(f"  Setoran 30%: Rp {setoran:,.0f}")
print(f"\n✅ Brand calculator test selesai!")
