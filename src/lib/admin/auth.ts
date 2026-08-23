import crypto from "crypto";
import { logger } from "../logger";

export const AUTHORIZED_ADMIN_EMAIL = "ueservicesllc1@gmail.com";

// Server-side secure hash of Admin PIN (1619) using SHA-256
// PIN is never exposed in client bundles or public Firestore
const SERVER_PIN_HASH = crypto.createHash("sha256").update("1619").digest("hex");
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "scentlab_admin_secret_key_session_2026_super_secure";

// In-memory rate limiting map for failed PIN attempts: email -> { attempts, lockedUntil }
const FAILED_ATTEMPTS = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

export interface AdminSessionPayload {
  adminEmail: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}

/**
 * Validates whether the email matches the single authorized administrator.
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}

/**
 * Verifies the 4-digit Admin PIN strictly server-side with brute-force rate-limiting.
 */
export function verifyAdminPinServerSide(email: string, inputPin: string): { success: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check email authorization
  if (!isAuthorizedAdminEmail(normalizedEmail)) {
    return { success: false, error: "Access denied." };
  }

  // 2. Check rate limit
  const now = Date.now();
  const attemptRecord = FAILED_ATTEMPTS.get(normalizedEmail) || { count: 0, lastAttempt: now };

  if (attemptRecord.lockedUntil && now < attemptRecord.lockedUntil) {
    const remainingSecs = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
    return {
      success: false,
      error: `Too many failed attempts. Access locked for ${remainingSecs} seconds.`,
    };
  }

  // 3. Hash user input and compare in constant time
  const inputHash = crypto.createHash("sha256").update(inputPin.trim()).digest("hex");
  const isMatch = crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(SERVER_PIN_HASH));

  if (!isMatch) {
    const newCount = attemptRecord.count + 1;
    let lockedUntil: number | undefined = undefined;

    // Exponential lock after 3 failed attempts
    if (newCount >= 5) {
      lockedUntil = now + 15 * 60 * 1000; // 15 minutes lock
    } else if (newCount >= 3) {
      lockedUntil = now + 60 * 1000; // 1 minute lock
    }

    FAILED_ATTEMPTS.set(normalizedEmail, {
      count: newCount,
      lastAttempt: now,
      lockedUntil,
    });

    logger.warn(`Failed Admin PIN attempt #${newCount} for ${normalizedEmail}`);
    return { success: false, error: "Incorrect PIN." };
  }

  // Reset rate limiting on success
  FAILED_ATTEMPTS.delete(normalizedEmail);
  return { success: true };
}

/**
 * Creates a signed, tamper-proof Admin Session token valid for 2 hours.
 */
export function createAdminSessionToken(email: string): string {
  const now = Date.now();
  const payload: AdminSessionPayload = {
    adminEmail: email.toLowerCase(),
    role: "admin",
    issuedAt: now,
    expiresAt: now + 2 * 60 * 60 * 1000, // 2 hours session
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadEncoded)
    .digest("base64url");

  return `${payloadEncoded}.${signature}`;
}

/**
 * Verifies and decodes an Admin Session token.
 */
export function verifyAdminSessionToken(token?: string | null): AdminSessionPayload | null {
  if (!token) return null;

  try {
    const [payloadEncoded, signature] = token.split(".");
    if (!payloadEncoded || !signature) return null;

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadEncoded)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(payloadEncoded, "base64url").toString("utf-8")
    );

    // Check expiration and authorized email
    if (Date.now() > payload.expiresAt || !isAuthorizedAdminEmail(payload.adminEmail)) {
      return null;
    }

    return payload;
  } catch (error) {
    logger.error("Admin session verification failed", error);
    return null;
  }
}
