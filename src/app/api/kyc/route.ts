// src/app/api/kyc/route.ts
// KYC API — Investor registration, validation, checklist
import { NextRequest, NextResponse } from "next/server";
import { validasiKyc, simpanKyc, type KycChecklist, type Investor } from "@/lib/sukuk-engine";
import { logActivity } from "@/lib/audit-engine";

// GET /api/kyc/checklist?investorId=1  → baca KYC status
// POST /api/kyc/submit                 → submit KYC investor
// POST /api/kyc/verify                 → verifikasi KYC (admin)
// GET /api/kyc/pending                 → daftar KYC pending

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "pending") {
      // Baca dari sheet PemegangSaham yang statusKyc = pending
      const { investor } = await (await import("@/lib/sukuk-engine")).bacaInvestorSukuk();
      const pending = investor.filter((r) => r[7] === "pending" || !r[7]);
      return NextResponse.json({ success: true, pending });
    }

    return NextResponse.json({ error: "Use POST for KYC operations" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    if (action === "submit") {
      // Submit KYC baru
      const investor: Investor = {
        id: 0,
        nama: body.nama,
        email: body.email,
        telepon: body.telepon,
        alamat: body.alamat,
        ktp: body.ktp,
        npwp: body.npwp,
        bank: body.bank,
        rekening: body.rekening,
        namaRekening: body.namaRekening,
        statusKyc: "pending",
        tanggalDaftar: new Date().toISOString().split("T")[0],
        totalInvestasi: body.totalInvestasi || 0,
      };

      const checklist: KycChecklist = {
        ktp: body.hasKtp || false,
        npwp: body.hasNpwp || false,
        rekeningKoran: body.hasRekeningKoran || false,
        suratKemampuan: body.hasSuratKemampuan || false,
        formMt4: body.hasFormMt4 || false,
        formRf: body.hasFormRf || false,
        videoPerjanjian: body.hasVideo || false,
        verifiedBy: "",
        verifiedAt: "",
        catatan: "",
      };

      const validation = validasiKyc(checklist);

      await simpanKyc(investor, checklist);

      // Audit log
      await logActivity({
        action: "create",
        actor: investor.nama,
        entityType: "kyc",
        description: `KYC submitted by ${investor.nama} (score: ${validation.score}%)`,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        investor,
        validation,
        message: validation.isComplete ? "KYC lengkap, menunggu verifikasi" : `KYC belum lengkap. Missing: ${validation.missingItems.join(", ")}`,
      });
    }

    if (action === "verify") {
      // Admin verifikasi KYC
      const { investorId, status, catatan, verifiedBy } = body;

      // Update status di sheet
      // (implementasi update sheet sesuai struktur)

      await logActivity({
        action: "approve",
        actor: verifiedBy || "admin",
        entityType: "kyc",
        entityId: investorId,
        description: `KYC ${status} for investor #${investorId}. ${catatan || ""}`,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: `KYC ${status}` });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
