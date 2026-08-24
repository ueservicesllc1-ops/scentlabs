import { adminDb } from '../firebase/admin';
import { PerfumeReference, ImportRunLog } from '@/types/reference';
import fs from 'fs';
import path from 'path';

const REFERENCE_CATALOG_COLLECTION = 'perfumeReferenceCatalog';
const IMPORT_RUNS_COLLECTION = 'fragranceNetImportRuns';

// Disk-based mock storage for local dev without Firebase credentials
const mockFilePath = path.join(process.cwd(), 'mock-reference-db.json');

function readMockDb() {
  if (!fs.existsSync(mockFilePath)) {
    return { run: null, products: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(mockFilePath, 'utf-8'));
  } catch (e) {
    return { run: null, products: [] };
  }
}

function writeMockDb(data: any) {
  fs.writeFileSync(mockFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const referenceRepository = {
  isMockMode() {
    return !adminDb;
  },
  /**
   * Upserts a PerfumeReference document using the server-side Admin SDK
   */
  async upsertReferenceProduct(product: PerfumeReference): Promise<void> {
    if (!adminDb) {
      const db = readMockDb();
      const idx = db.products.findIndex((p: any) => p.id === product.id);
      if (idx > -1) db.products[idx] = product;
      else db.products.push(product);
      writeMockDb(db);
      return;
    }
    const docRef = adminDb.collection(REFERENCE_CATALOG_COLLECTION).doc(product.id);
    await docRef.set(product, { merge: true });
  },

  /**
   * Fetches a reference product by ID
   */
  async getReferenceProduct(id: string): Promise<PerfumeReference | null> {
    if (!adminDb) {
      const db = readMockDb();
      return db.products.find((p: any) => p.id === id) || null;
    }
    const doc = await adminDb.collection(REFERENCE_CATALOG_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as PerfumeReference;
  },

  /**
   * Queries reference products with basic filtering (for Admin UI)
   */
  async queryReferenceProducts(params: {
    limit?: number;
    offset?: number;
    brand?: string;
  }): Promise<{ items: PerfumeReference[]; total: number }> {
    if (!adminDb) {
      const db = readMockDb();
      let filtered = [...db.products];
      if (params.brand) filtered = filtered.filter((p: any) => p.brand === params.brand);
      const total = filtered.length;
      if (params.offset) filtered = filtered.slice(params.offset);
      if (params.limit) filtered = filtered.slice(0, params.limit);
      return { items: filtered, total };
    }
    
    let query: FirebaseFirestore.Query = adminDb.collection(REFERENCE_CATALOG_COLLECTION);
    
    if (params.brand) {
      query = query.where('brand', '==', params.brand);
    }
    
    // In a real app we'd maintain an aggregation counter, but we'll approximate or use server count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.offset(params.offset);
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map(doc => doc.data() as PerfumeReference);
    
    return { items, total };
  },

  /**
   * Manages import run logs
   */
  async createImportRun(run: ImportRunLog): Promise<void> {
    if (!adminDb) {
      const db = readMockDb();
      db.run = run;
      writeMockDb(db);
      return;
    }
    const docRef = adminDb.collection(IMPORT_RUNS_COLLECTION).doc(run.runId);
    await docRef.set(run);
  },

  async updateImportRun(runId: string, updates: Partial<ImportRunLog>): Promise<void> {
    if (!adminDb) {
      const db = readMockDb();
      if (db.run && db.run.runId === runId) {
        db.run = { ...db.run, ...updates };
        writeMockDb(db);
      }
      return;
    }
    const docRef = adminDb.collection(IMPORT_RUNS_COLLECTION).doc(runId);
    await docRef.update(updates);
  },

  async getLatestImportRun(): Promise<ImportRunLog | null> {
    if (!adminDb) {
      const db = readMockDb();
      return db.run;
    }
    const snapshot = await adminDb
      .collection(IMPORT_RUNS_COLLECTION)
      .orderBy('startedAt', 'desc')
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as ImportRunLog;
  }
};
