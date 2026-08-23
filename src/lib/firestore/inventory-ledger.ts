import { collection, doc, getDocs, setDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/client";
import { FragranceInventoryLedger, PurchaseLot } from "@/types/fragrance";
import { fragranceRepository } from "./fragrance";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const LEDGER_COLLECTION = "fragranceInventoryLedger";
const LOTS_COLLECTION = "purchaseLots";

const LOCAL_LEDGER: FragranceInventoryLedger[] = [];
const LOCAL_LOTS: PurchaseLot[] = [];

export const inventoryLedgerRepository = {
  /**
   * Executes an atomic repackaging transaction:
   * - Consumes source bulk volume (oz) + waste (oz)
   * - Increments packaged variant units on shelf
   * - Records transaction in the ledger
   */
  async recordRepackaging(params: {
    fragranceOilId: string;
    variantId: string;
    sellingSizeOz: number;
    outputQuantity: number;
    wasteVolumeOz?: number;
    wasteReason?: "spill" | "residue" | "production_loss" | "damaged" | "other";
    createdBy: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const fragrance = await fragranceRepository.getFragranceById(params.fragranceOilId);
    if (!fragrance) {
      return { success: false, error: "Fragrance oil not found." };
    }

    const totalOilNeeded = params.sellingSizeOz * params.outputQuantity;
    const waste = params.wasteVolumeOz || 0;
    const totalConsumed = totalOilNeeded + waste;

    if (fragrance.inventoryVolumeOz < totalConsumed) {
      return {
        success: false,
        error: `Insufficient bulk volume. Available: ${fragrance.inventoryVolumeOz} oz, Required: ${totalConsumed} oz.`,
      };
    }

    const remainingBulk = Math.round((fragrance.inventoryVolumeOz - totalConsumed) * 100) / 100;

    // Update variant stock
    const updatedVariants = fragrance.repackagingVariants.map((v) => {
      if (v.id === params.variantId) {
        return {
          ...v,
          inventoryQuantity: v.inventoryQuantity + params.outputQuantity,
        };
      }
      return v;
    });

    // Update fragrance record
    const updatedFragrance = {
      ...fragrance,
      inventoryVolumeOz: remainingBulk,
      repackagingVariants: updatedVariants,
      updatedAt: new Date().toISOString(),
    };
    await fragranceRepository.saveFragrance(updatedFragrance);

    // Record ledger entry
    const ledgerId = `ledger_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const ledgerEntry: FragranceInventoryLedger = {
      id: ledgerId,
      fragranceOilId: params.fragranceOilId,
      type: "repackaging",
      sourceVolumeOz: fragrance.inventoryVolumeOz,
      consumedVolumeOz: totalConsumed,
      outputQuantity: params.outputQuantity,
      outputSizeOz: params.sellingSizeOz,
      remainingBulkVolumeOz: remainingBulk,
      wasteVolumeOz: waste,
      wasteReason: params.wasteReason || "residue",
      notes: params.notes,
      createdBy: params.createdBy,
      createdAt: new Date().toISOString(),
    };

    LOCAL_LEDGER.unshift(ledgerEntry);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, LEDGER_COLLECTION, ledgerId);
        await setDoc(docRef, ledgerEntry);
      } catch (error) {
        logger.error(`Failed to store ledger entry ${ledgerId}`, error);
      }
    }

    logger.info(`Repackaged ${params.outputQuantity}x ${params.sellingSizeOz}oz bottles of ${fragrance.name}`);
    return { success: true };
  },

  /**
   * Records a raw purchase lot and increases bulk inventory ounces
   */
  async recordPurchaseLot(lot: PurchaseLot, volumeOzToAdd: number): Promise<string> {
    LOCAL_LOTS.unshift(lot);

    const fragrance = await fragranceRepository.getFragranceById(lot.fragranceOilId);
    if (fragrance) {
      const newBulk = fragrance.inventoryVolumeOz + volumeOzToAdd;
      await fragranceRepository.updateBulkVolume(fragrance.id, newBulk);

      // Ledger entry
      const ledgerEntry: FragranceInventoryLedger = {
        id: `ledger_${Date.now()}`,
        fragranceOilId: fragrance.id,
        type: "purchase",
        sourceVolumeOz: fragrance.inventoryVolumeOz,
        consumedVolumeOz: 0,
        remainingBulkVolumeOz: newBulk,
        lotId: lot.id,
        notes: `Purchase Lot #${lot.lotNumber} from ${lot.supplierName} (${lot.quantity} ${lot.unit})`,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
      };
      LOCAL_LEDGER.unshift(ledgerEntry);
    }

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, LOTS_COLLECTION, lot.id);
        await setDoc(docRef, lot);
      } catch (error) {
        logger.error(`Failed to store purchase lot ${lot.id}`, error);
      }
    }

    return lot.id;
  },

  /**
   * Retrieves ledger transaction history for a fragrance oil
   */
  async getLedgerByFragrance(fragranceOilId: string): Promise<FragranceInventoryLedger[]> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_LEDGER.filter((l) => l.fragranceOilId === fragranceOilId);
    }

    try {
      const q = query(
        collection(db, LEDGER_COLLECTION),
        where("fragranceOilId", "==", fragranceOilId),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FragranceInventoryLedger));
      return docs.length > 0 ? docs : LOCAL_LEDGER.filter((l) => l.fragranceOilId === fragranceOilId);
    } catch (error) {
      return LOCAL_LEDGER.filter((l) => l.fragranceOilId === fragranceOilId);
    }
  },

  /**
   * Retrieves purchase lots for a fragrance oil
   */
  async getLotsByFragrance(fragranceOilId: string): Promise<PurchaseLot[]> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_LOTS.filter((l) => l.fragranceOilId === fragranceOilId);
    }

    try {
      const q = query(
        collection(db, LOTS_COLLECTION),
        where("fragranceOilId", "==", fragranceOilId),
        orderBy("purchaseDate", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PurchaseLot));
      return docs.length > 0 ? docs : LOCAL_LOTS.filter((l) => l.fragranceOilId === fragranceOilId);
    } catch (error) {
      return LOCAL_LOTS.filter((l) => l.fragranceOilId === fragranceOilId);
    }
  },
};
