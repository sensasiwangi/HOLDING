// src/app/api/sop/route.ts
// P2-3: Staff SOP API
import { NextRequest, NextResponse } from "next/server";
import {
  getSOPs,
  getSOP,
  createAssignment,
  updateChecklistItem,
  getAssignments,
  getStaffTraining,
  updateTrainingStatus,
  getSOPStats,
} from "@/lib/staff-sop";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const code = searchParams.get("code");
  const staff = searchParams.get("staff") || undefined;
  const status = searchParams.get("status") || undefined;
  const category = searchParams.get("category") || undefined;

  try {
    switch (action) {
      case "list":
        return NextResponse.json({ success: true, sops: getSOPs(category) });

      case "detail":
        if (!code) return NextResponse.json({ success: false, error: "code required" }, { status: 400 });
        const sop = getSOP(code);
        return NextResponse.json({ success: true, sop });

      case "assignments":
        return NextResponse.json({ success: true, assignments: getAssignments(staff, status) });

      case "training":
        return NextResponse.json({ success: true, training: getStaffTraining(staff) });

      case "stats":
        return NextResponse.json({ success: true, stats: getSOPStats() });

      default:
        return NextResponse.json({
          success: true,
          sops: getSOPs(),
          stats: getSOPStats(),
        });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case "assign": {
        const { sop_id, staff_name } = body;
        if (!sop_id || !staff_name) {
          return NextResponse.json({ success: false, error: "sop_id & staff_name required" }, { status: 400 });
        }
        const id = createAssignment(sop_id, staff_name);
        return NextResponse.json({ success: true, id });
      }

      case "check": {
        const { assignment_id, step_number, checked, notes } = body;
        if (!assignment_id || !step_number || checked === undefined) {
          return NextResponse.json({ success: false, error: "assignment_id, step_number, checked required" }, { status: 400 });
        }
        updateChecklistItem(assignment_id, step_number, checked, notes);
        return NextResponse.json({ success: true });
      }

      case "training": {
        const { staff_name, sop_code, status, score } = body;
        if (!staff_name || !sop_code || !status) {
          return NextResponse.json({ success: false, error: "staff_name, sop_code, status required" }, { status: 400 });
        }
        updateTrainingStatus(staff_name, sop_code, status, score);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: "Action tidak dikenal" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
