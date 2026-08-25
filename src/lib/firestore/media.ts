import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/client";
import { adminDb } from "../firebase/admin";
import { MediaAsset } from "@/types/media";
import { b2Service } from "../b2/service";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const COLLECTION_NAME = "mediaMetadata";

export const mediaMetadataService = {
  /**
   * Saves or updates a MediaAsset metadata document in Firestore.
   * Uses Admin SDK when running on the server to bypass client permission rules.
   */
  async saveMetadata(asset: MediaAsset): Promise<void> {
    const payload = { ...asset, updatedAt: new Date().toISOString() };

    if (typeof window === "undefined" && adminDb) {
      try {
        await adminDb.collection(COLLECTION_NAME).doc(asset.id).set(payload, { merge: true });
        logger.info(`Media metadata saved via Admin SDK for ${asset.id}`);
        return;
      } catch (adminErr: any) {
        logger.warn(`Admin SDK media metadata save failed, trying client SDK: ${adminErr.message}`);
      }
    }

    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, asset.id);
      await setDoc(docRef, payload, { merge: true });
      logger.info(`Media metadata saved for ${asset.id} (key: ${asset.b2Key})`);
    } catch (error) {
      logger.error(`Failed to save media metadata for ${asset.id}`, error);
    }
  },

  /**
   * Retrieves all media assets associated with a specific entity (e.g. product or category)
   */
  async getMediaByEntity(entityType: string, entityId: string): Promise<MediaAsset[]> {
    if (!isFirebaseConfigured || !db) {
      return [];
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("entityType", "==", entityType),
        where("entityId", "==", entityId),
        orderBy("sortOrder", "asc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MediaAsset));
    } catch (error) {
      logger.warn(`Failed to fetch media for entity ${entityType}:${entityId}`, error);
      return [];
    }
  },

  /**
   * Deletes the media file from Backblaze B2 and removes its metadata document from Firestore
   */
  async deleteMedia(assetId: string, b2Key: string): Promise<boolean> {
    try {
      // 1. Delete physical object from B2
      await b2Service.deleteFile(b2Key);

      // 2. Delete metadata doc from Firestore
      if (typeof window === "undefined" && adminDb) {
        await adminDb.collection(COLLECTION_NAME).doc(assetId).delete();
      } else if (db) {
        const docRef = doc(db, COLLECTION_NAME, assetId);
        await deleteDoc(docRef);
      }

      logger.info(`Media asset ${assetId} deleted from B2 and Firestore.`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete media asset ${assetId}`, error);
      return false;
    }
  },
};

export const mediaRepository = mediaMetadataService;
