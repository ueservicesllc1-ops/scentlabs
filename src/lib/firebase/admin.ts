import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { logger } from "../logger";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
    } else {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    if (adminApp) {
      adminAuth = getAuth(adminApp);
      adminDb = getFirestore(adminApp);
      logger.info("[SCENTLAB SERVER] Firebase Admin SDK initialized successfully with Service Account.");
    }
  } else {
    logger.warn("[SCENTLAB SERVER] Missing Firebase Service Account credentials. Running in mock server mode.");
  }
} catch (error) {
  logger.error("Failed to initialize Firebase Admin SDK", error);
}

export { adminApp, adminAuth, adminDb };
