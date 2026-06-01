// src/app/api/sync/route.ts
// Sync API — tulis transaksi + auto-sync ke semua sheet terkait
// POST /api/sync/transaction  → catat transaksi + sync Dashboard
// POST /api/sync/investment   → catat investasi
// POST /api/sync/rab          → catat item RAB
// POST /api/sync/distribution → catat bagi hasil
import { NextRequest, NextResponse } from "next/server";
import {
  recordTransaction,
  recordInvestment,
  recordRABItem,
  recordDistribution,
} from "@/lib/sheets-sync";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const body = await req.json();

    switch (type) {
      case "transaction": {
        const required = ["date", "accountId", "description", "division"];
        const missing = required.filter((k) => !body[k]);
        if (missing.length) {
          return NextResponse.json(
            { error: `Missing: ${missing.join(", ")}` },
            { status: 400 }
          );
        }
        const result = await recordTransaction({
          date: body.date,
          accountId: body.accountId,
          category: body.category || "",
          description: body.description,
          inflow: Number(body.inflow) || 0,
          outflow: Number(body.outflow) || 0,
          division: body.division,
          balance: body.balance,
        });
        return NextResponse.json(result);
      }

      case "investment": {
        const required = ["investorName", "investorEmail", "sukukId", "unit", "nominal"];
        const missing = required.filter((k) => !body[k]);
        if (missing.length) {
          return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
        }
        const result = await recordInvestment({
          investorName: body.investorName,
          investorEmail: body.investorEmail,
          investorPhone: body.investorPhone || "",
          sukukId: body.sukukId,
          unit: Number(body.unit),
          nominal: Number(body.nominal),
          date: body.date || new Date().toISOString().split("T")[0],
        });
        return NextResponse.json(result);
      }

      case "rab": {
        const required = ["kode", "kategori", "item", "qty", "hargaSatuan"];
        const missing = required.filter((k) => !body[k]);
        if (missing.length) {
          return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
        }
        const result = await recordRABItem({
          kode: body.kode,
          kategori: body.kategori,
          item: body.item,
          qty: Number(body.qty),
          satuan: body.satuan || "unit",
          hargaSatuan: Number(body.hargaSatuan),
          sumberDana: body.sumberDana || "investor",
          pic: body.pic || "",
          fase: body.fase || "phase1",
        });
        return NextResponse.json(result);
      }

      case "distribution": {
        const required = ["sukukId", "periode", "revenue"];
        const missing = required.filter((k) => !body[k]);
        if (missing.length) {
          return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
        }
        const revenue = Number(body.revenue);
        const investorShare = Number(body.investorShare) || Math.round(revenue * 0.425);
        const swiShare = Number(body.swiShare) || Math.round(revenue * 0.425);
        const result = await recordDistribution({
          sukukId: body.sukukId,
          periode: body.periode,
          revenue,
          investorShare,
          swiShare,
        });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown type: ${type}`,
            supported: ["transaction", "investment", "rab", "distribution"],
          },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error("[sync]", err);
    return NextResponse.json(
      { error: "Sync failed", detail: err.message },
      { status: 500 }
    );
  }
}
