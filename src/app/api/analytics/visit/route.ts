import { NextRequest, NextResponse } from "next/server";
import { trafficRepository } from "@/lib/firestore/traffic";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await trafficRepository.getTrafficStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch traffic stats" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { isNewVisitor, isNewSession } = body;

    const stats = await trafficRepository.recordVisit(
      Boolean(isNewVisitor),
      isNewSession !== undefined ? Boolean(isNewSession) : true
    );

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record visit" },
      { status: 500 }
    );
  }
}
