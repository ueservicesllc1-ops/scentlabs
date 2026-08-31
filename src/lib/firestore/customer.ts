import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy, updateDoc, limit } from "firebase/firestore";
import { db } from "../firebase/client";
import { Customer, CustomerAddress, CustomerNotification } from "@/types/customer";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const CUSTOMERS_COLLECTION = "customers";
const ADDRESSES_COLLECTION = "customerAddresses";
const NOTIFICATIONS_COLLECTION = "customerNotifications";

// In-Memory Fallback Map
const LOCAL_CUSTOMERS = new Map<string, Customer>();
const LOCAL_ADDRESSES = new Map<string, CustomerAddress>();
const LOCAL_NOTIFICATIONS = new Map<string, CustomerNotification>();

// Sample Seed for testing/offline demo
const DEMO_ADDRESS: CustomerAddress = {
  id: "addr_demo_1",
  customerId: "demo_customer_1",
  firstName: "Jane",
  lastName: "Doe",
  company: "Artisan Fragrances LLC",
  line1: "123 Formulator Way",
  line2: "Suite 400",
  city: "Miami",
  state: "FL",
  postalCode: "33101",
  country: "United States",
  phone: "+1 (305) 555-0199",
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
LOCAL_ADDRESSES.set(DEMO_ADDRESS.id, DEMO_ADDRESS);

export const customerRepository = {
  // PROFILE
  async getProfile(uid: string): Promise<Customer | null> {
    const local = LOCAL_CUSTOMERS.get(uid);
    if (!isFirebaseConfigured || !db) return local || null;

    try {
      const docRef = doc(db, CUSTOMERS_COLLECTION, uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Customer;
      }
      return local || null;
    } catch {
      return local || null;
    }
  },

  async getAllCustomers(): Promise<Customer[]> {
    const demoCustomers: Customer[] = [
      {
        id: "cus_demo_101",
        email: "aldovillar1411@gmail.com",
        firstName: "Aldo",
        lastName: "Villar",
        company: "Villar Fragrances LLC",
        phone: "+1 (305) 555-0144",
        role: "customer",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cus_demo_102",
        email: "georgina.wholesale@gmail.com",
        firstName: "Georgina",
        lastName: "Pérez",
        company: "Georgina Perfumery",
        phone: "+1 (786) 555-0899",
        role: "customer",
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cus_demo_103",
        email: "contact@artisanlab.com",
        firstName: "Carlos",
        lastName: "Mendoza",
        company: "Artisan Lab Miami",
        phone: "+1 (305) 555-0721",
        role: "customer",
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    demoCustomers.forEach((c) => {
      if (!LOCAL_CUSTOMERS.has(c.id)) LOCAL_CUSTOMERS.set(c.id, c);
    });

    const localArr = Array.from(LOCAL_CUSTOMERS.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    if (!isFirebaseConfigured || !db) return localArr;

    try {
      const q = query(collection(db, CUSTOMERS_COLLECTION), limit(100));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
      return docs.length > 0 ? docs : localArr;
    } catch (error) {
      logger.warn("Failed to fetch all customers from Firestore", error);
      return localArr;
    }
  },

  async saveProfile(customer: Customer): Promise<string> {
    LOCAL_CUSTOMERS.set(customer.id, customer);
    if (!isFirebaseConfigured || !db) return customer.id;

    try {
      const docRef = doc(db, CUSTOMERS_COLLECTION, customer.id);
      await setDoc(docRef, customer, { merge: true });
      return customer.id;
    } catch (error) {
      logger.error(`Failed to save customer profile ${customer.id}`, error);
      return customer.id;
    }
  },

  // ADDRESSES
  async getAddresses(customerId: string): Promise<CustomerAddress[]> {
    const local = Array.from(LOCAL_ADDRESSES.values()).filter((a) => a.customerId === customerId);
    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(
        collection(db, ADDRESSES_COLLECTION),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CustomerAddress));
      return docs.length > 0 ? docs : local;
    } catch {
      return local;
    }
  },

  async saveAddress(address: CustomerAddress): Promise<string> {
    // If set as default, unset others locally
    if (address.isDefault) {
      Array.from(LOCAL_ADDRESSES.values())
        .filter((a) => a.customerId === address.customerId && a.id !== address.id)
        .forEach((a) => (a.isDefault = false));
    }

    LOCAL_ADDRESSES.set(address.id, { ...address });
    if (!isFirebaseConfigured || !db) return address.id;

    try {
      const docRef = doc(db, ADDRESSES_COLLECTION, address.id);
      await setDoc(docRef, address, { merge: true });
      return address.id;
    } catch (error) {
      logger.error(`Failed to save address ${address.id}`, error);
      return address.id;
    }
  },

  async deleteAddress(addressId: string, customerId: string): Promise<boolean> {
    const addr = LOCAL_ADDRESSES.get(addressId);
    if (addr && addr.customerId === customerId) {
      LOCAL_ADDRESSES.delete(addressId);
    }

    if (!isFirebaseConfigured || !db) return true;

    try {
      const docRef = doc(db, ADDRESSES_COLLECTION, addressId);
      await deleteDoc(docRef);
      return true;
    } catch {
      return true;
    }
  },

  async setDefaultAddress(addressId: string, customerId: string): Promise<void> {
    const all = await this.getAddresses(customerId);
    for (const a of all) {
      a.isDefault = a.id === addressId;
      a.updatedAt = new Date().toISOString();
      await this.saveAddress(a);
    }
  },

  // NOTIFICATIONS
  async getNotifications(customerId: string): Promise<CustomerNotification[]> {
    const local = Array.from(LOCAL_NOTIFICATIONS.values()).filter((n) => n.customerId === customerId);
    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CustomerNotification));
      return docs.length > 0 ? docs : local;
    } catch {
      return local;
    }
  },

  async createNotification(notification: CustomerNotification): Promise<string> {
    LOCAL_NOTIFICATIONS.set(notification.id, notification);
    if (!isFirebaseConfigured || !db) return notification.id;

    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notification.id);
      await setDoc(docRef, notification);
      return notification.id;
    } catch {
      return notification.id;
    }
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    const notif = LOCAL_NOTIFICATIONS.get(notificationId);
    if (notif) notif.read = true;

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, { read: true });
    } catch {}
  },
};
