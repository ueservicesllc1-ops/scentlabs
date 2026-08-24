'use server';

import { referenceRepository } from '@/lib/firestore/reference';
import { adminDb } from '@/lib/firebase/admin';
import { Product } from '@/types/product';

export async function addToMyCatalog(referenceId: string) {
  const refProduct = await referenceRepository.getReferenceProduct(referenceId);
  if (!refProduct) throw new Error('Reference product not found');

  if (refProduct.addedToCatalog) {
    throw new Error('Already added to catalog');
  }

  // Map to SCENTLAB Product structure (DRAFT status)
  const newProduct: Partial<Product> = {
    id: `prod_ref_${refProduct.sourceProductId}`,
    name: refProduct.name,
    slug: `${refProduct.brand}-${refProduct.name}`.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    brand: refProduct.brand,
    description: refProduct.description || '',
    shortDescription: `${refProduct.brand} ${refProduct.name}`,
    category: refProduct.category,
    categoryName: 'Perfumes',
    productType: 'finished_perfume',
    status: 'draft',
    source: refProduct.source,
    sourceReferenceId: refProduct.id,
    sourcePrice: refProduct.variants[0]?.sourcePrice || 0,
    price: refProduct.variants[0]?.sourcePrice || 0, // Initially match source price
    basePrice: refProduct.variants[0]?.sourcePrice || 0,
    cost: 0, // Must be entered by admin
    inventory: {
      quantityInStock: 0,
      lowStockThreshold: 5,
      reorderPoint: 5,
      status: 'out_of_stock'
    },
    sku: `REF-${refProduct.sourceProductId}`,
    hasVariants: false, // Could expand if sizes map directly
    currency: 'USD',
    tags: [],
    attributes: {
      concentration: refProduct.concentration || '',
      gender: refProduct.gender || '',
      size: refProduct.variants[0]?.size || '',
    },
    media: refProduct.images.length > 0 ? [{
      id: `media_${Date.now()}`,
      b2Key: refProduct.images[0].b2Path,
      url: refProduct.images[0].b2Url,
      fileName: refProduct.images[0].b2Path.split('/').pop() || 'image.jpg',
      mimeType: 'image/jpeg',
      size: 0,
      sortOrder: 1,
      isPrimary: true,
      createdAt: new Date().toISOString()
    }] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add to main products collection
  if (adminDb) {
    await adminDb.collection('products').doc(newProduct.id!).set(newProduct);
    await adminDb.collection('perfumeReferenceCatalog').doc(referenceId).update({
      addedToCatalog: true,
      updatedAt: new Date().toISOString()
    });
  } else {
    // Local dev mock mode
    await referenceRepository.upsertReferenceProduct({
      ...refProduct,
      addedToCatalog: true,
      updatedAt: new Date().toISOString()
    });
  }

  return { success: true, productId: newProduct.id };
}
