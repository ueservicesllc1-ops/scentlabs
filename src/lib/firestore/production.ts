import { collection, doc, getDocs, setDoc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/client";
import { ProductionJob, MaterialTransaction } from "@/types/packaging";
import { packagingRepository } from "./packaging";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const JOBS_COLLECTION = "productionJobs";
const TRANSACTIONS_COLLECTION = "materialTransactions";

const LOCAL_JOBS: ProductionJob[] = [
  {
    id: "job_sample_01",
    productId: "prod_perfume_boxes",
    variantId: "var_box_small_10ml",
    boxName: "Small Tuck-Top Box (10ml Roll-On)",
    quantity: 100,
    materialId: "mat_cardstock_110lb_white",
    materialName: "110 lb Smooth White Cardstock",
    sheetsRequired: 50,
    estimatedTimeMinutes: 35,
    actualTimeMinutes: 32,
    status: "completed",
    notes: "Cricut scoring blade + fine point cut. Clean fold alignment.",
    createdBy: "Admin",
    createdAt: "2026-08-23T08:00:00.000Z",
    completedAt: "2026-08-23T08:35:00.000Z",
  },
];

const LOCAL_TRANSACTIONS: MaterialTransaction[] = [];

export const productionRepository = {
  async getProductionJobs(): Promise<ProductionJob[]> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_JOBS;
    }

    try {
      const q = query(collection(db, JOBS_COLLECTION), orderBy("createdAt", "desc"), limit(50));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ProductionJob));
      return docs.length > 0 ? docs : LOCAL_JOBS;
    } catch {
      return LOCAL_JOBS;
    }
  },

  async createProductionJob(job: ProductionJob): Promise<string> {
    LOCAL_JOBS.unshift(job);
    if (!isFirebaseConfigured || !db) return job.id;

    try {
      const docRef = doc(db, JOBS_COLLECTION, job.id);
      await setDoc(docRef, job);
      return job.id;
    } catch {
      return job.id;
    }
  },

  async updateJobStatus(jobId: string, status: ProductionJob["status"]): Promise<void> {
    const job = LOCAL_JOBS.find((j) => j.id === jobId);
    if (job) {
      job.status = status;
      if (status === "completed") job.completedAt = new Date().toISOString();
    }

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, JOBS_COLLECTION, jobId);
      await updateDoc(docRef, {
        status,
        completedAt: status === "completed" ? new Date().toISOString() : undefined,
      });
    } catch (error) {
      logger.error(`Failed to update job status ${jobId}`, error);
    }
  },

  /**
   * Executes and completes a production job:
   * - Consumes raw sheets from PackagingMaterial
   * - Increments finished boxes in BoxSizeVariant
   * - Records material transaction ledger entry
   */
  async executeAndCompleteJob(params: {
    jobId: string;
    materialId: string;
    variantId?: string;
    sheetsToConsume: number;
    outputBoxQuantity: number;
    wasteSheets?: number;
    createdBy: string;
  }): Promise<{ success: boolean; error?: string }> {
    const materials = await packagingRepository.getRawMaterials();
    const material = materials.find((m) => m.id === params.materialId);

    if (!material) {
      return { success: false, error: "Raw cardstock material not found." };
    }

    const totalSheets = params.sheetsToConsume + (params.wasteSheets || 0);

    if (material.quantity < totalSheets) {
      return {
        success: false,
        error: `Insufficient cardstock sheets. Available: ${material.quantity}, Required: ${totalSheets}.`,
      };
    }

    const remainingSheets = material.quantity - totalSheets;

    // Update material sheet stock
    await packagingRepository.saveRawMaterial({
      ...material,
      quantity: remainingSheets,
      updatedAt: new Date().toISOString(),
    });

    // Update finished box stock if variant specified
    if (params.variantId) {
      const boxVariants = await packagingRepository.getBoxVariants();
      const variant = boxVariants.find((v) => v.id === params.variantId);
      if (variant) {
        await packagingRepository.saveBoxVariant({
          ...variant,
          inventory: variant.inventory + params.outputBoxQuantity,
        });
      }
    }

    // Record material transaction
    const txId = `tx_${Date.now()}`;
    const transaction: MaterialTransaction = {
      id: txId,
      materialId: params.materialId,
      previousQuantity: material.quantity,
      consumedQuantity: params.sheetsToConsume,
      remainingQuantity: remainingSheets,
      wasteQuantity: params.wasteSheets || 0,
      productionJobId: params.jobId,
      createdBy: params.createdBy,
      createdAt: new Date().toISOString(),
    };
    LOCAL_TRANSACTIONS.unshift(transaction);

    if (isFirebaseConfigured && db) {
      try {
        const txDocRef = doc(db, TRANSACTIONS_COLLECTION, txId);
        await setDoc(txDocRef, transaction);
      } catch (error) {
        logger.error("Failed to write material transaction", error);
      }
    }

    // Mark job completed
    await this.updateJobStatus(params.jobId, "completed");

    logger.info(`Cricut job ${params.jobId} completed. ${params.outputBoxQuantity} boxes produced.`);
    return { success: true };
  },
};
