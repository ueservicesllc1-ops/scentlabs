export type EmailType = "order_confirmation" | "new_order_admin";

export type EmailStatus = "pending" | "sent" | "failed" | "retrying";

export interface EmailLog {
  id: string;
  orderId: string;
  orderNumber?: string;
  type: EmailType;
  recipient: string;
  templateId: string;
  provider: "emailjs";
  status: EmailStatus;
  messageId?: string;
  error?: string;
  payload?: Record<string, any>;
  retryCount?: number;
  sentAt?: string;
  createdAt: string;
}

export interface EmailJsOrderParams {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_number: string;
  order_date: string;
  payment_status: string;
  payment_id: string;
  order_items: string; // HTML formatted string
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shipping_method: string;
  shipping_address: string; // Formatted multi-line text or HTML
  estimated_delivery: string;
  order_url: string;
  admin_order_url: string;
  website_url: string;
  support_email: string;
  custom_label_information: string; // HTML formatted block for custom labels
}
