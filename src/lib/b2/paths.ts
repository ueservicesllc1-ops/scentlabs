/**
 * Backblaze B2 Canonical Storage Path Generator
 * Strictly follows Section 11 of SCENTLAB Architecture
 */
export const b2Paths = {
  productImage: (productId: string, filename: string) =>
    `products/${productId}/images/${filename}`,

  productVideo: (productId: string, filename: string) =>
    `products/${productId}/videos/${filename}`,

  categoryImage: (categoryId: string, filename: string) =>
    `categories/${categoryId}/${filename}`,

  customerFile: (customerId: string, filename: string) =>
    `customers/${customerId}/${filename}`,

  customLabelFile: (customLabelId: string, filename: string) =>
    `custom-labels/${customLabelId}/${filename}`,

  designFile: (designId: string, filename: string) =>
    `designs/${designId}/${filename}`,

  marketingAsset: (filename: string) =>
    `marketing/${filename}`,

  adminDocument: (filename: string) =>
    `admin/${filename}`,
};
