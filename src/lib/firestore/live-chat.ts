import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { isFirebaseConfigured } from "../firebase/config";

export interface LiveChatMessage {
  id: string;
  chatId: string;
  sender: "customer" | "admin" | "ai";
  senderName: string;
  content: string;
  createdAt: string;
}

export interface LiveChatSession {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: "waiting_agent" | "active" | "resolved";
  mode: "ai" | "human";
  lastMessage: string;
  lastMessageSender: "customer" | "admin" | "ai";
  unreadByAdmin: number;
  unreadByCustomer: number;
  createdAt: string;
  updatedAt: string;
}

const CHATS_COLLECTION = "live_chats";
const MESSAGES_SUBCOLLECTION = "messages";

// In-memory fallback if Firestore is temporarily offline
let LOCAL_CHATS: LiveChatSession[] = [];
let LOCAL_MESSAGES: Record<string, LiveChatMessage[]> = {};

export const liveChatRepository = {
  /**
   * Get or create a session for a customer
   */
  async getOrCreateSession(
    sessionId: string,
    initialCustomerName: string = "Visitante"
  ): Promise<LiveChatSession> {
    const now = new Date().toISOString();
    const defaultSession: LiveChatSession = {
      id: sessionId,
      customerName: initialCustomerName,
      status: "active",
      mode: "ai",
      lastMessage: "Conversación iniciada",
      lastMessageSender: "ai",
      unreadByAdmin: 0,
      unreadByCustomer: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (!isFirebaseConfigured || !db) {
      const existing = LOCAL_CHATS.find((c) => c.id === sessionId);
      if (existing) return existing;
      LOCAL_CHATS.push(defaultSession);
      return defaultSession;
    }

    try {
      const chatRef = doc(db, CHATS_COLLECTION, sessionId);
      const snapshot = await getDoc(chatRef);

      if (snapshot.exists()) {
        return snapshot.data() as LiveChatSession;
      }

      await setDoc(chatRef, defaultSession);
      return defaultSession;
    } catch (err) {
      console.warn("liveChatRepository.getOrCreateSession error:", err);
      return defaultSession;
    }
  },

  /**
   * Subscribe to all conversations for the Admin Dashboard (Real-time)
   */
  subscribeAllChats(callback: (chats: LiveChatSession[]) => void): () => void {
    if (!isFirebaseConfigured || !db) {
      callback(LOCAL_CHATS);
      return () => {};
    }

    try {
      const q = query(
        collection(db, CHATS_COLLECTION),
        orderBy("updatedAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const chats: LiveChatSession[] = [];
          snapshot.forEach((d) => {
            chats.push(d.data() as LiveChatSession);
          });
          callback(chats);
        },
        (error) => {
          console.warn("subscribeAllChats error, falling back to local:", error);
          callback(LOCAL_CHATS);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn("subscribeAllChats exception:", err);
      callback(LOCAL_CHATS);
      return () => {};
    }
  },

  /**
   * Subscribe to messages of a specific conversation (Real-time)
   */
  subscribeMessages(
    chatId: string,
    callback: (messages: LiveChatMessage[]) => void
  ): () => void {
    if (!isFirebaseConfigured || !db) {
      callback(LOCAL_MESSAGES[chatId] || []);
      return () => {};
    }

    try {
      const q = query(
        collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const msgs: LiveChatMessage[] = [];
          snapshot.forEach((d) => {
            msgs.push(d.data() as LiveChatMessage);
          });
          callback(msgs);
        },
        (error) => {
          console.warn("subscribeMessages error:", error);
          callback(LOCAL_MESSAGES[chatId] || []);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn("subscribeMessages exception:", err);
      callback(LOCAL_MESSAGES[chatId] || []);
      return () => {};
    }
  },

  /**
   * Send a message in a conversation and update chat session meta
   */
  async sendMessage(params: {
    chatId: string;
    sender: "customer" | "admin" | "ai";
    senderName: string;
    content: string;
    customerName?: string;
    mode?: "ai" | "human";
  }): Promise<LiveChatMessage> {
    const { chatId, sender, senderName, content, customerName, mode } = params;
    const now = new Date().toISOString();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const message: LiveChatMessage = {
      id: messageId,
      chatId,
      sender,
      senderName,
      content,
      createdAt: now,
    };

    if (!isFirebaseConfigured || !db) {
      if (!LOCAL_MESSAGES[chatId]) LOCAL_MESSAGES[chatId] = [];
      LOCAL_MESSAGES[chatId].push(message);

      let chat = LOCAL_CHATS.find((c) => c.id === chatId);
      if (!chat) {
        chat = {
          id: chatId,
          customerName: customerName || "Visitante",
          status: "active",
          mode: mode || "ai",
          lastMessage: content,
          lastMessageSender: sender,
          unreadByAdmin: sender === "customer" ? 1 : 0,
          unreadByCustomer: sender === "admin" ? 1 : 0,
          createdAt: now,
          updatedAt: now,
        };
        LOCAL_CHATS.push(chat);
      } else {
        chat.lastMessage = content;
        chat.lastMessageSender = sender;
        chat.updatedAt = now;
        if (mode) chat.mode = mode;
        if (sender === "customer") chat.unreadByAdmin = (chat.unreadByAdmin || 0) + 1;
        if (sender === "admin") chat.unreadByCustomer = (chat.unreadByCustomer || 0) + 1;
      }
      return message;
    }

    try {
      // 1. Add message doc
      const msgRef = doc(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION, messageId);
      await setDoc(msgRef, message);

      // 2. Update chat session metadata
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      const updates: any = {
        lastMessage: content,
        lastMessageSender: sender,
        updatedAt: now,
      };

      if (customerName) updates.customerName = customerName;
      if (mode) updates.mode = mode;

      if (sender === "customer") {
        updates.unreadByAdmin = increment(1);
        // If customer sends a message and mode is human, set status to waiting_agent
        if (mode === "human") {
          updates.status = "waiting_agent";
        }
      } else if (sender === "admin") {
        updates.unreadByCustomer = increment(1);
        updates.unreadByAdmin = 0;
        updates.status = "active";
      }

      await setDoc(chatRef, updates, { merge: true });
      return message;
    } catch (err) {
      console.warn("sendMessage error:", err);
      return message;
    }
  },

  /**
   * Request human support from customer side
   */
  async requestHumanSupport(chatId: string, customerName?: string): Promise<void> {
    const now = new Date().toISOString();
    if (!isFirebaseConfigured || !db) {
      const chat = LOCAL_CHATS.find((c) => c.id === chatId);
      if (chat) {
        chat.mode = "human";
        chat.status = "waiting_agent";
        chat.updatedAt = now;
      }
      return;
    }

    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await setDoc(
        chatRef,
        {
          mode: "human",
          status: "waiting_agent",
          updatedAt: now,
          ...(customerName ? { customerName } : {}),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("requestHumanSupport error:", err);
    }
  },

  /**
   * Switch mode between AI and Human
   */
  async setChatMode(chatId: string, mode: "ai" | "human"): Promise<void> {
    const now = new Date().toISOString();
    if (!isFirebaseConfigured || !db) {
      const chat = LOCAL_CHATS.find((c) => c.id === chatId);
      if (chat) {
        chat.mode = mode;
        chat.updatedAt = now;
      }
      return;
    }

    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, { mode, updatedAt: now });
    } catch (err) {
      console.warn("setChatMode error:", err);
    }
  },

  /**
   * Mark chat as resolved or active
   */
  async setChatStatus(
    chatId: string,
    status: "active" | "waiting_agent" | "resolved"
  ): Promise<void> {
    const now = new Date().toISOString();
    if (!isFirebaseConfigured || !db) {
      const chat = LOCAL_CHATS.find((c) => c.id === chatId);
      if (chat) {
        chat.status = status;
        chat.updatedAt = now;
      }
      return;
    }

    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, { status, updatedAt: now });
    } catch (err) {
      console.warn("setChatStatus error:", err);
    }
  },

  /**
   * Mark conversation as read by Admin
   */
  async markAsReadByAdmin(chatId: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      const chat = LOCAL_CHATS.find((c) => c.id === chatId);
      if (chat) chat.unreadByAdmin = 0;
      return;
    }

    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, { unreadByAdmin: 0 });
    } catch (err) {
      console.warn("markAsReadByAdmin error:", err);
    }
  },

  /**
   * Mark conversation as read by Customer
   */
  async markAsReadByCustomer(chatId: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      const chat = LOCAL_CHATS.find((c) => c.id === chatId);
      if (chat) chat.unreadByCustomer = 0;
      return;
    }

    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, { unreadByCustomer: 0 });
    } catch (err) {
      console.warn("markAsReadByCustomer error:", err);
    }
  },
};
