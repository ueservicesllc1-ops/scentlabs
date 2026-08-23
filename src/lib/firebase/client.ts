import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./config";
import { logger } from "../logger";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    logger.info("Firebase Client SDK initialized.");
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  logger.error("Failed to initialize Firebase Client", error);
}

export { app, auth, db };
