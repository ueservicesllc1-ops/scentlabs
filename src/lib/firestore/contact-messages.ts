import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  inquiryType: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
}

const COLLECTION_NAME = "contactMessages";

// In-memory store for offline/demo fallback
const LOCAL_MESSAGES = new Map<string, ContactMessage>([
  [
    "msg_demo_1",
    {
      id: "msg_demo_1",
      name: "Aldo Villar",
      email: "aldovillar1411@gmail.com",
      inquiryType: "wholesale",
      message: "Hola, quisiera información sobre compras de esencias al por mayor y envíos a Miami.",
      status: "new",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
  [
    "msg_demo_2",
    {
      id: "msg_demo_2",
      name: "Laura Perfumes",
      email: "laura.formulation@gmail.com",
      inquiryType: "custom-labels",
      message: "Consulta sobre cotización de etiquetas en foil de oro para frascos de 50ml.",
      status: "read",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ],
]);

export const contactMessageService = {
  /**
   * Save a new contact form submission to Firestore.
   */
  async saveMessage(msg: Omit<ContactMessage, "id" | "status" | "createdAt">): Promise<string> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullMessage: ContactMessage = {
      ...msg,
      id,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    LOCAL_MESSAGES.set(id, fullMessage);

    if (!isFirebaseConfigured || !db) {
      logger.info(`[MOCK] Contact message saved locally: ${id}`);
      return id;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(docRef, fullMessage);
      logger.info(`Contact message saved to Firestore: ${id}`);
      return id;
    } catch (error) {
      logger.error(`Failed to save contact message ${id}`, error);
      return id;
    }
  },

  /**
   * Get all contact messages for admin dashboard.
   */
  async getAllMessages(): Promise<ContactMessage[]> {
    const localArr = Array.from(LOCAL_MESSAGES.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (!isFirebaseConfigured || !db) {
      return localArr;
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage));
      return docs.length > 0 ? docs : localArr;
    } catch (error) {
      logger.warn("Failed to fetch contact messages from Firestore", error);
      return localArr;
    }
  },

  /**
   * Update status of a contact message (mark as read / replied).
   */
  async updateStatus(id: string, status: "new" | "read" | "replied"): Promise<void> {
    const msg = LOCAL_MESSAGES.get(id);
    if (msg) {
      msg.status = status;
    }

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, { status });
    } catch (error) {
      logger.error(`Failed to update message status ${id}`, error);
    }
  },
};
