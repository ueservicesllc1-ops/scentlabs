import { collection, doc, setDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/client";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

export type AdminAuditAction =
  | "admin_login"
  | "admin_pin_success"
  | "admin_pin_failed"
  | "admin_logout"
  | "product_created"
  | "product_updated"
  | "price_changed"
  | "inventory_changed"
  | "order_updated"
  | "custom_label_updated"
  | "settings_changed";

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: AdminAuditAction;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  ip?: string;
  timestamp: string;
}

const AUDIT_COLLECTION = "adminAuditLogs";
const LOCAL_AUDIT_LOGS: AdminAuditLog[] = [];

export const auditService = {
  /**
   * Logs an administrative action to Firestore without exposing sensitive PIN data.
   */
  async logAction(
    action: AdminAuditAction,
    adminEmail: string,
    options: {
      entityType?: string;
      entityId?: string;
      details?: Record<string, any>;
      ip?: string;
    } = {}
  ): Promise<void> {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logRecord: AdminAuditLog = {
      id: logId,
      adminEmail,
      action,
      entityType: options.entityType,
      entityId: options.entityId,
      details: options.details,
      ip: options.ip,
      timestamp: new Date().toISOString(),
    };

    LOCAL_AUDIT_LOGS.unshift(logRecord);

    if (!isFirebaseConfigured || !db) {
      logger.info(`[MOCK AUDIT] ${action} logged for ${adminEmail}`);
      return;
    }

    try {
      const docRef = doc(db, AUDIT_COLLECTION, logId);
      await setDoc(docRef, logRecord);
      logger.info(`Audit log ${logId} stored in Firestore: ${action}`);
    } catch (error) {
      logger.error(`Failed to store audit log ${logId}`, error);
    }
  },

  /**
   * Retrieves recent audit logs for admin inspection.
   */
  async getRecentLogs(limitCount: number = 50): Promise<AdminAuditLog[]> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_AUDIT_LOGS.slice(0, limitCount);
    }

    try {
      const q = query(collection(db, AUDIT_COLLECTION), orderBy("timestamp", "desc"), limit(limitCount));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AdminAuditLog));
      return docs.length > 0 ? docs : LOCAL_AUDIT_LOGS.slice(0, limitCount);
    } catch (error) {
      logger.warn("Failed to fetch audit logs from Firestore", error);
      return LOCAL_AUDIT_LOGS.slice(0, limitCount);
    }
  },
};
