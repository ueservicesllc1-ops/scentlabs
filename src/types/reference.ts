export interface PerfumeVariant {
  id: string;
  size: string;
  sourcePrice?: number;
  sourceOriginalPrice?: number;
  sourceSku?: string;
  sourceAvailability: boolean;
  sourceImageUrl?: string;
}

export interface PerfumeReferenceImage {
  type: 'reference';
  sourceImageUrl: string;
  b2Path: string;
  b2Url: string;
  uploadedToB2: boolean;
  uploadedAt: string;
}

export interface PerfumeReference {
  id: string;
  source: string; // e.g., 'FragranceNet'
  sourceProductId: string;
  sourceUrl: string;

  brand: string;
  name: string;
  fullName: string;

  productType: 'finished_perfume';
  category: 'finished_perfumes';

  concentration?: string;
  gender?: string;
  description?: string;
  
  images: PerfumeReferenceImage[];
  variants: PerfumeVariant[];

  sourceAvailable: boolean;

  lastCheckedAt: string;
  importedAt: string;
  updatedAt: string;
  
  addedToCatalog?: boolean;
}

export interface ImportRunLog {
  runId: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  
  productsDiscovered: number;
  productsCreated: number;
  productsUpdated: number;
  duplicates: number;
  errors: number;
  
  imagesFound: number;
  imagesUploaded: number;
  imagesFailed: number;
  priceChanges: number;
  
  lastProcessedProduct?: string;
  lastProcessedPage?: number;
  errorLog?: string[];
}
