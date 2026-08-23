import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("scentlab_admin_session")?.value;

  const payload = verifyAdminSessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    adminEmail: payload.adminEmail,
    role: payload.role,
    expiresAt: payload.expiresAt,
  });
}
