export interface InboundNote {
  id: string;
  noteNumber: string; // e.g. NE-0001
  productId: string;
  productName: string;
  sku: string;
  brand?: string;
  category?: string;
  supplierName: string; // A quién se le compra
  invoiceNumber?: string; // Factura o referencia de compra
  quantity: number; // Cantidad comprada / recibida
  unitCost: number; // Costo por unidad
  totalCost: number; // quantity * unitCost
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface InboundSummaryMetrics {
  totalNotes: number;
  totalUnitsReceived: number;
  totalSpend: number;
  uniqueSuppliersCount: number;
}
