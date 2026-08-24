import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { isFirebaseConfigured } from "../firebase/config";
import { InboundNote, InboundSummaryMetrics } from "@/types/inbound-notes";
import { productService } from "./products";
import { inventoryRepository } from "./inventory";
import { logger } from "../logger";

const COLLECTION_NAME = "inbound_notes";

// Universal in-memory fallback for client & server execution without 'fs'
const LOCAL_INBOUND_NOTES: InboundNote[] = [];

export const inboundNotesRepository = {
  /**
   * Generates the next sequential note number (e.g. NE-0001)
   */
  async generateNoteNumber(): Promise<string> {
    const all = await this.getAllInboundNotes();
    const nextNumber = all.length + 1;
    return `NE-${nextNumber.toString().padStart(4, "0")}`;
  },

  /**
   * Creates an Inbound Note and automatically increments the product inventory
   */
  async createInboundNote(params: {
    productId: string;
    productName: string;
    sku: string;
    brand?: string;
    category?: string;
    supplierName: string;
    invoiceNumber?: string;
    quantity: number;
    unitCost: number;
    notes?: string;
    createdBy?: string;
  }): Promise<{ success: boolean; note?: InboundNote; error?: string }> {
    try {
      if (!params.productId) return { success: false, error: "Producto no especificado." };
      if (!params.quantity || params.quantity <= 0) return { success: false, error: "La cantidad ingresada debe ser mayor a 0." };
      if (!params.supplierName?.trim()) return { success: false, error: "Debes especificar el proveedor a quien se le compra." };

      const noteNumber = await this.generateNoteNumber();
      const noteId = `ne_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const totalCost = Number(params.quantity) * Number(params.unitCost || 0);

      const note: InboundNote = {
        id: noteId,
        noteNumber,
        productId: params.productId,
        productName: params.productName,
        sku: params.sku,
        brand: params.brand,
        category: params.category,
        supplierName: params.supplierName.trim(),
        invoiceNumber: params.invoiceNumber?.trim() || undefined,
        quantity: Number(params.quantity),
        unitCost: Number(params.unitCost || 0),
        totalCost,
        notes: params.notes?.trim() || undefined,
        createdAt: new Date().toISOString(),
        createdBy: params.createdBy || "ueservicesllc1@gmail.com",
      };

      // 1. Persist Inbound Note
      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, COLLECTION_NAME, note.id);
          await setDoc(docRef, note);
        } catch (e) {
          logger.warn("Firestore inbound note save failed; saving to memory store", e);
          LOCAL_INBOUND_NOTES.unshift(note);
        }
      } else {
        LOCAL_INBOUND_NOTES.unshift(note);
      }

      // 2. Automatically Increase Product Inventory in Product Catalog
      try {
        const product = await productService.getProductById(params.productId);
        if (product) {
          const currentStock = product.inventory?.quantityInStock || 0;
          const updatedStock = currentStock + Number(params.quantity);

          await productService.saveProduct({
            ...product,
            cost: Number(params.unitCost) > 0 ? Number(params.unitCost) : product.cost,
            inventory: {
              ...product.inventory,
              quantityInStock: updatedStock,
              status: updatedStock > 0 ? "in_stock" : "out_of_stock",
            },
          });
        }
      } catch (err) {
        logger.warn("Could not update product service directly", err);
      }

      // 3. Log to Inventory Repository & Adjustment Ledger
      try {
        await inventoryRepository.adjustInventory(
          params.productId,
          Number(params.quantity),
          "Found", // Inbound stock receipt
          `Nota de Entrada ${noteNumber} - Proveedor: ${params.supplierName}${params.invoiceNumber ? " (Factura: " + params.invoiceNumber + ")" : ""}`,
          params.createdBy || "ueservicesllc1@gmail.com"
        );
      } catch (err) {
        logger.warn("Could not adjust inventory repository", err);
      }

      logger.info(`Nota de Entrada ${noteNumber} registrada exitosamente para ${params.productName} (+${params.quantity} unidades).`);
      return { success: true, note };
    } catch (error: any) {
      logger.error("Error creating inbound note", error);
      return { success: false, error: error.message || "Error al registrar la nota de entrada." };
    }
  },

  /**
   * Fetches all recorded inbound notes sorted newest first
   */
  async getAllInboundNotes(): Promise<InboundNote[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as InboundNote));
        }
      } catch (error) {
        logger.warn("Firestore getAllInboundNotes failed; reading memory store.", error);
      }
    }
    return LOCAL_INBOUND_NOTES;
  },

  /**
   * Calculates overall metrics for Inbound purchases
   */
  async getInboundMetrics(): Promise<InboundSummaryMetrics> {
    const notes = await this.getAllInboundNotes();
    const totalNotes = notes.length;
    const totalUnitsReceived = notes.reduce((acc, n) => acc + (n.quantity || 0), 0);
    const totalSpend = notes.reduce((acc, n) => acc + (n.totalCost || 0), 0);
    const suppliers = new Set(notes.map((n) => n.supplierName.toLowerCase().trim()));

    return {
      totalNotes,
      totalUnitsReceived,
      totalSpend,
      uniqueSuppliersCount: suppliers.size,
    };
  },
};
