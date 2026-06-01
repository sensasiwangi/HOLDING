// src/app/api/sukuk/route.ts
// Sukuk API — Calculator bagi hasil, jadwal pembayaran
// POST /api/sukuk/calculate    → hitung jadwal bagi hasil
// POST /api/sukuk/distribusi    → hitung distribusi per investor
// GET  /api/sukuk/schedule      → baca jadwal dari sheet
import { NextRequest, NextResponse } from "next/server";
import {
  hitungJadwalBagiHasil,
  hitungDistribusiInvestor,
  hitungImbalan,
  bacaInvestorSukuk,
  simpanJadwalBagiHasil,
  type SukukParams,
  type InvestasiSukuk,
} from "@/lib/sukuk-engine";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const body = await req.json();

    if (type === "calculate") {
      const params: SukukParams = body;
      const revenueProyeksi: number[] = body.revenueProyeksi || [];

      const jadwal = hitungJadwalBagiHasil(params, revenueProyeksi);

      return NextResponse.json({
        success: true,
        params,
        jadwal,
        totalBulan: jadwal.length,
        estimasiTotalBagiHasil: jadwal.reduce((s, j) => s + j.bagiHasilTotal, 0),
      });
    }

    if (type === "distribusi") {
      const jadwal = body.jadwal;
      const investasi: InvestasiSukuk[] = body.investasi || [];

      const distribusi = hitungDistribusiInvestor(jadwal, investasi);

      return NextResponse.json({
        success: true,
        periode: jadwal.periode,
        totalDibagikan: jadwal.bagianInvestor,
        distribusi,
      });
    }

    if (type === "imbalan") {
      const result = hitungImbalan(body);
      return NextResponse.json({ success: true, ...result });
    }

    if (type === "save-schedule") {
      await simpanJadwalBagiHasil(body.jadwal);
      return NextResponse.json({ success: true, message: "Jadwal disimpan" });
    }

    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await bacaInvestorSukuk();
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
