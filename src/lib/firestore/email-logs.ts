import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where, 
  limit 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { EmailLog } from "@/types/email";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const EMAIL_LOGS_COLLECTION = "emailLogs";

const LOCAL_EMAIL_LOGS = new Map<string, EmailLog>();

export const emailLogRepository = {
  async getAll(maxLimit: number = 100): Promise<EmailLog[]> {
    const local = Array.from(LOCAL_EMAIL_LOGS.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (!isFirebaseConfigured || !db) return local.slice(0, maxLimit);

    try {
      const q = query(
        collection(db, EMAIL_LOGS_COLLECTION),
        orderBy("createdAt", "desc"),
        limit(maxLimit)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EmailLog));
      return docs.length > 0 ? docs : local.slice(0, maxLimit);
    } catch {
      return local.slice(0, maxLimit);
    }
  },

  async getById(id: string): Promise<EmailLog | null> {
    const local = LOCAL_EMAIL_LOGS.get(id);
    if (!isFirebaseConfigured || !db) return local || null;

    try {
      const docRef = doc(db, EMAIL_LOGS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as EmailLog;
      }
      return local || null;
    } catch {
      return local || null;
    }
  },

  async getByOrderId(orderId: string): Promise<EmailLog[]> {
    const local = Array.from(LOCAL_EMAIL_LOGS.values()).filter((l) => l.orderId === orderId);
    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(
        collection(db, EMAIL_LOGS_COLLECTION),
        where("orderId", "==", orderId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EmailLog));
      return docs.length > 0 ? docs : local;
    } catch {
      return local;
    }
  },

  async save(emailLog: EmailLog): Promise<string> {
    LOCAL_EMAIL_LOGS.set(emailLog.id, {
      ...emailLog,
      sentAt: emailLog.sentAt || new Date().toISOString(),
    });

    if (!isFirebaseConfigured || !db) return emailLog.id;

    try {
      const docRef = doc(db, EMAIL_LOGS_COLLECTION, emailLog.id);
      await setDoc(docRef, emailLog, { merge: true });
      return emailLog.id;
    } catch (error) {
      logger.error(`Failed to save email log ${emailLog.id}`, error);
      return emailLog.id;
    }
  },

  async update(id: string, updates: Partial<EmailLog>): Promise<void> {
    const existing = LOCAL_EMAIL_LOGS.get(id);
    if (existing) {
      LOCAL_EMAIL_LOGS.set(id, { ...existing, ...updates });
    }

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, EMAIL_LOGS_COLLECTION, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      logger.error(`Failed to update email log ${id}`, error);
    }
  },
};
