import { NextRequest, NextResponse } from "next/server";
import { 
  verifyAdminPinServerSide, 
  createAdminSessionToken, 
  isAuthorizedAdminEmail, 
  AUTHORIZED_ADMIN_EMAIL 
} from "@/lib/admin/auth";
import { auditService } from "@/lib/firestore/audit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, pin } = body;

    const ip = request.headers.get("x-forwarded-for") || request.ip || "unknown";

    if (!email || !pin) {
      return NextResponse.json({ error: "Email and PIN are required." }, { status: 400 });
    }

    // 1. Strict Email Authorization check
    if (!isAuthorizedAdminEmail(email)) {
      await auditService.logAction("admin_pin_failed", email, {
        details: { reason: "unauthorized_email_attempt" },
        ip,
      });
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // 2. Server-side PIN Verification (SHA-256 constant-time comparison + rate-limiting)
    const verification = verifyAdminPinServerSide(email, pin);

    if (!verification.success) {
      await auditService.logAction("admin_pin_failed", email, {
        details: { reason: verification.error },
        ip,
      });
      return NextResponse.json({ error: verification.error || "Incorrect PIN." }, { status: 401 });
    }

    // 3. Generate Signed 2-Hour Admin Session Token
    const sessionToken = createAdminSessionToken(email);

    // 4. Record successful audit event
    await auditService.logAction("admin_pin_success", email, {
      details: { role: "admin", duration: "2h" },
      ip,
    });

    const response = NextResponse.json({
      success: true,
      adminEmail: AUTHORIZED_ADMIN_EMAIL,
      redirectUrl: "/admin",
    });

    // 5. Set Secure HTTP-Only Cookie
    response.cookies.set({
      name: "scentlab_admin_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60, // 2 hours
      path: "/",
    });

    logger.info(`Admin session established for ${email} (IP: ${ip})`);
    return response;
  } catch (error: any) {
    logger.error("Admin PIN verification exception", error);
    return NextResponse.json({ error: "Authentication service error." }, { status: 500 });
  }
}
