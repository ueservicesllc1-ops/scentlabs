import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin/auth";
import { auditService } from "@/lib/firestore/audit";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("scentlab_admin_session")?.value;
  const payload = verifyAdminSessionToken(token);

  if (payload) {
    await auditService.logAction("admin_logout", payload.adminEmail, {
      details: { timestamp: new Date().toISOString() },
    });
  }

  const response = NextResponse.json({ success: true, message: "Admin session cleared." });

  // Clear HTTP-only cookie
  response.cookies.set({
    name: "scentlab_admin_session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
