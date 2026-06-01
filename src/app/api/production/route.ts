// src/app/api/production/route.ts
// Production API — catat seluruh alur produksi
// POST /api/production/bahan     → catat pembelian bahan
// POST /api/production/bottling  → catat bottling
// POST /api/production/packaging → catat packaging
// POST /api/production/produk    → catat produk jadi
// POST /api/production/penjualan → catat penjualan
// POST /api/production/batch     → catat 1 batch lengkap
import { NextRequest, NextResponse } from "next/server";
import {
  catatBahanBaku,
  catatBottling,
  catatPackaging,
  catatProdukJadi,
  catatPenjualan,
  catatBatchProduk,
} from "@/lib/production-tracker";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const body = await req.json();

    switch (type) {
      case "bahan": {
        const { kode, nama, kategori, satuan, hargaSatuan, qtyBeli, supplier, tanggal } = body;
        if (!nama || !hargaSatuan || !qtyBeli) {
          return NextResponse.json({ error: "Missing: nama, hargaSatuan, qtyBeli" }, { status: 400 });
        }
        const result = await catatBahanBaku({ kode, nama, kategori, satuan, hargaSatuan, qtyBeli, supplier, tanggal });
        return NextResponse.json(result);
      }

      case "bottling": {
        const { kodeFormula, brand, skuProduk, namaProduk, tanggal, batchProduk, unitDiproduksi, upahPerUnit, pic, catatan } = body;
        if (!brand || !skuProduk || !unitDiproduksi || !upahPerUnit) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const result = await catatBottling({ kodeFormula, brand, skuProduk, namaProduk, tanggal, batchProduk, unitDiproduksi, upahPerUnit, pic, catatan });
        return NextResponse.json(result);
      }

      case "packaging": {
        const { kodeFormula, brand, skuProduk, namaProduk, tanggal, unitDipackaging, biayaPerUnit, pic } = body;
        if (!brand || !skuProduk || !unitDipackaging) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const result = await catatPackaging({ kodeFormula, brand, skuProduk, namaProduk, tanggal, unitDipackaging, biayaPerUnit, pic });
        return NextResponse.json(result);
      }

      case "produk": {
        const { brand, sku, namaProduk, batch, totalUnit, totalBahanCost, totalBottlingCost, totalPackagingCost, hargaJual, tanggalProduksi } = body;
        if (!brand || !sku || !totalUnit) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const result = await catatProdukJadi({ brand, sku, namaProduk, batch, totalUnit, totalBahanCost, totalBottlingCost, totalPackagingCost, hargaJual, tanggalProduksi });
        return NextResponse.json(result);
      }

      case "penjualan": {
        const { brand, sku, namaProduk, tanggal, unitTerjual, hargaJual, batch, catatan } = body;
        if (!brand || !sku || !unitTerjual || !hargaJual) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const result = await catatPenjualan({ brand, sku, namaProduk, tanggal, unitTerjual, hargaJual, batch, catatan });
        return NextResponse.json(result);
      }

      case "batch": {
        const { brand, sku, namaProduk, batch, tanggal, bahan, unitProduksi, upahBottlingPerUnit, biayaPackagingPerUnit, hargaJual, picBottling, picPackaging } = body;
        if (!brand || !sku || !bahan || !unitProduksi) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const result = await catatBatchProduk({ brand, sku, namaProduk, batch, tanggal, bahan, unitProduksi, upahBottlingPerUnit, biayaPackagingPerUnit, hargaJual, picBottling, picPackaging });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}`, supported: ["bahan", "bottling", "packaging", "produk", "penjualan", "batch"] },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error("[production]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
