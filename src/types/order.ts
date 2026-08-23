import { CustomerAddress } from './customer';
import { ProductPackage } from './pricing';
import { CustomLabel } from './custom-label';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'cancelled';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItemSnapshot {
  id: string;
  productId: string;
  variantId?: string;
  variantName?: string;
  productName: string;
  sku: string;
  quantity: number; // total units
  unitPrice: number;
  totalPrice: number;
  selectedOptions?: {
    packageQuantity: number;
    packageCount: number;
    variantName?: string;
  };
  customization?: {
    isCustomItem?: boolean;
    customLabelConfigurationId?: string;
    labelSize?: string;
    material?: string;
    brandName?: string;
    fragranceName?: string;
    bottleName?: string;
    dimensions?: string;
    customText?: string;
    logoUrl?: string;
    designUrl?: string;
    artworkUrl?: string;
    designData?: any;
  };
  customLabel?: {
    designName?: string;
    size?: string;
    material?: string;
    status?: string;
    previewUrl?: string;
  };
  customLabelConfigurationId?: string;
  imageSnapshot?: string;
  isLinkedToParent?: boolean;
  parentItemId?: string;
}

// Alias for compatibility
export type OrderItem = OrderItemSnapshot;

export interface Order {
  id: string;
  orderNumber: string; // e.g. "SC-2026-000001"
  customerId?: string | null;
  customerEmail: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  shipping: number;
  shippingCost?: number; // alias
  tax: number;
  total: number;
  totalAmount?: number; // alias
  currency: 'USD' | string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  stripeCheckoutSessionId?: string;
  stripeSessionId?: string; // alias
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  shippingAddress: CustomerAddress;
  billingAddress?: CustomerAddress;
  shippingMethod: string;
  carrier?: string;
  trackingNumber?: string;
  customerConfirmationEmailSent?: boolean;
  adminNotificationEmailSent?: boolean;
  createdAt: string;
  updatedAt: string;
}
