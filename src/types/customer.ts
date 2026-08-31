export type UserRole = "customer" | "admin";

export interface CustomerAddress {
  id: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
  company?: string;
  line1?: string;
  line2?: string;
  street1?: string;
  street2?: string;
  streetAddress?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string; // Firebase Auth UID
  firebaseUid?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  company?: string;
  businessName?: string;
  phone?: string;
  photoFileId?: string;
  photoUrl?: string;
  role: UserRole;
  defaultAddressId?: string;
  addresses?: CustomerAddress[];
  savedDesignIds?: string[];
  totalOrdersCount?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type NotificationType =
  | "order_paid"
  | "order_processing"
  | "order_shipped"
  | "order_delivered"
  | "label_approved"
  | "label_rejected"
  | "general";

export interface CustomerNotification {
  id: string;
  customerId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: "order" | "custom_label";
  relatedEntityId?: string;
  read: boolean;
  createdAt: string;
}
