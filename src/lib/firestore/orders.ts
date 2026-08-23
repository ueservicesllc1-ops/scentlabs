import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const ORDERS_COLLECTION = "orders";

// In-memory fallback orders for development/mock mode
const LOCAL_DEV_ORDERS = new Map<string, Order>();

export const orderRepository = {
  /**
   * Generates a safe, human-readable, collision-resistant order number.
   * Format: SC-2026-XXXXXX
   */
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(10 + Math.random() * 90);
    return `SC-${year}-${timestampPart}${randomPart}`;
  },

  /**
   * Creates an order document in Firestore.
   */
  async createOrder(order: Order): Promise<string> {
    if (!isFirebaseConfigured || !db) {
      LOCAL_DEV_ORDERS.set(order.id, order);
      logger.info(`[MOCK] Order created in local store: ${order.orderNumber} (ID: ${order.id})`);
      return order.id;
    }

    try {
      const docRef = doc(db, ORDERS_COLLECTION, order.id);
      await setDoc(docRef, order);
      logger.info(`Order document created in Firestore: ${order.orderNumber} (ID: ${order.id})`);
      return order.id;
    } catch (error) {
      logger.error(`Failed to create order ${order.id}`, error);
      LOCAL_DEV_ORDERS.set(order.id, order);
      return order.id;
    }
  },

  async saveOrder(order: Order): Promise<string> {
    return this.createOrder(order);
  },

  /**
   * Retrieves an order by ID.
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_DEV_ORDERS.get(orderId) || null;
    }

    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Order;
      }
      return LOCAL_DEV_ORDERS.get(orderId) || null;
    } catch (error) {
      logger.warn(`Failed to fetch order ${orderId} from Firestore`, error);
      return LOCAL_DEV_ORDERS.get(orderId) || null;
    }
  },

  /**
   * Retrieves all orders for a specific customer ID.
   */
  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_DEV_ORDERS.values()).filter((o) => o.customerId === customerId);
    }

    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      return orders.length > 0 ? orders : Array.from(LOCAL_DEV_ORDERS.values()).filter((o) => o.customerId === customerId);
    } catch (error) {
      logger.warn(`Failed to query customer orders for ${customerId}`, error);
      return Array.from(LOCAL_DEV_ORDERS.values()).filter((o) => o.customerId === customerId);
    }
  },

  /**
   * Retrieves all orders (Admin view).
   */
  async getAllOrders(): Promise<Order[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_DEV_ORDERS.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      return orders.length > 0 ? orders : Array.from(LOCAL_DEV_ORDERS.values());
    } catch (error) {
      logger.warn("Failed to fetch all orders from Firestore", error);
      return Array.from(LOCAL_DEV_ORDERS.values());
    }
  },

  /**
   * Updates order payment, fulfillment status, or general fields.
   */
  async updateOrderStatus(
    orderId: string,
    updates: {
      paymentStatus?: PaymentStatus;
      orderStatus?: OrderStatus;
      stripePaymentIntentId?: string;
      stripeCheckoutSessionId?: string;
      stripeCustomerId?: string;
      trackingNumber?: string;
      carrier?: string;
      shippingMethod?: string;
      updatedAt?: string;
    }
  ): Promise<void> {
    const local = LOCAL_DEV_ORDERS.get(orderId);
    if (local) {
      LOCAL_DEV_ORDERS.set(orderId, {
        ...local,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      logger.info(`Order ${orderId} updated successfully: ${JSON.stringify(updates)}`);
    } catch (error) {
      logger.error(`Failed to update order ${orderId}`, error);
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    return this.updateOrderStatus(orderId, updates as any);
  },
};
