import { NextRequest, NextResponse } from "next/server";
import { resendEmailLog } from "@/lib/email/emailjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId } = body;

    if (!logId) {
      return NextResponse.json({ success: false, error: "Missing logId" }, { status: 400 });
    }

    const result = await resendEmailLog(logId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resend email" },
      { status: 500 }
    );
  }
}
