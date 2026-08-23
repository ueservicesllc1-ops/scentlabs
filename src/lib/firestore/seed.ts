import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/client";
import { INITIAL_PRODUCTS } from "@/data/products";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { logger } from "../logger";

export async function seedProducts(): Promise<number> {
  if (!db) throw new Error("Firestore not initialized");
  logger.info(`Starting Firestore product seeding (${INITIAL_PRODUCTS.length} items)...`);
  
  let count = 0;
  for (const product of INITIAL_PRODUCTS) {
    const docRef = doc(db, "products", product.id);
    await setDoc(docRef, product, { merge: true });
    count++;
  }
  logger.info(`Successfully seeded ${count} products.`);
  return count;
}

export async function seedCategories(): Promise<number> {
  if (!db) throw new Error("Firestore not initialized");
  logger.info(`Starting Firestore category seeding (${INITIAL_CATEGORIES.length} categories)...`);

  let count = 0;
  for (const category of INITIAL_CATEGORIES) {
    const docRef = doc(db, "categories", category.id);
    await setDoc(docRef, category, { merge: true });
    count++;
  }
  logger.info(`Successfully seeded ${count} categories.`);
  return count;
}

export async function seedAdmin(adminUid: string, email: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, "customers", adminUid);
  await setDoc(
    docRef,
    {
      id: adminUid,
      email,
      role: "admin",
      displayName: "SCENTLAB Admin",
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  logger.info(`Admin role granted to UID: ${adminUid} (${email})`);
}
