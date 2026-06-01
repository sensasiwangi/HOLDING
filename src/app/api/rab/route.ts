// src/app/api/rab/route.ts
// RAB API — Rencana Anggaran Biaya
import { NextRequest, NextResponse } from "next/server";
import {
  bacaRab, hitungRabSummary, tambahRabItem,
} from "@/lib/rab-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const divisi = searchParams.get("divisi") || "Store";

    const items = await bacaRab(divisi);
    const summary = hitungRabSummary(items, divisi);

    return NextResponse.json({ success: true, items, summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await tambahRabItem(body);
    return NextResponse.json({ success: true, message: "Item RAB ditambahkan" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
