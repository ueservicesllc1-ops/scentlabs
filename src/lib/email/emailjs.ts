import { Order } from "@/types/order";
import { EmailLog, EmailType } from "@/types/email";
import { buildEmailJsParams } from "./templates";
import { emailLogRepository } from "../firestore/email-logs";
import { orderRepository } from "../firestore/orders";
import { logger } from "../logger";

const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

export const EMAILJS_CONFIG = {
  get publicKey() {
    return process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";
  },
  get serviceId() {
    return process.env.EMAILJS_SERVICE_ID || "";
  },
  get customerTemplateId() {
    return process.env.EMAILJS_ORDER_CONFIRMATION_TEMPLATE_ID || "template_bnf8vrj";
  },
  get adminTemplateId() {
    return process.env.EMAILJS_ADMIN_ORDER_TEMPLATE_ID || "template_771c56e";
  },
  get adminEmail() {
    return process.env.EMAILJS_ADMIN_NOTIFICATION_EMAIL || "ueservicesllc1@gmail.com";
  },
  get privateKey() {
    return process.env.EMAILJS_PRIVATE_KEY || "";
  },
};

export function isEmailJsConfigured(): boolean {
  return Boolean(
    (EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.privateKey) &&
    EMAILJS_CONFIG.serviceId
  );
}

/**
 * Sends an email via EmailJS REST API and logs the transaction.
 * NEVER throws an uncaught error or disrupts order flows.
 */
export async function sendEmailJsMessage({
  templateId,
  templateParams,
  recipient,
  type,
  orderId,
  orderNumber,
}: {
  templateId: string;
  templateParams: Record<string, any>;
  recipient: string;
  type: EmailType;
  orderId: string;
  orderNumber?: string;
}): Promise<{ success: boolean; logId: string; error?: string }> {
  const logId = `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const emailLog: EmailLog = {
    id: logId,
    orderId,
    orderNumber,
    type,
    recipient,
    templateId,
    provider: "emailjs",
    status: "pending",
    payload: {
      to_email: recipient,
      order_number: orderNumber || orderId,
      total: templateParams.total,
    },
    createdAt: now,
  };

  // 1. Validation check
  if (!recipient || !templateId) {
    emailLog.status = "failed";
    emailLog.error = "Missing recipient email address or template ID";
    await emailLogRepository.save(emailLog);
    return { success: false, logId, error: emailLog.error };
  }

  // 2. If EmailJS is not configured in this environment, record as failed with configuration explanation
  if (!isEmailJsConfigured()) {
    emailLog.status = "failed";
    emailLog.error = "EmailJS service or keys not configured in environment variables";
    await emailLogRepository.save(emailLog);
    logger.warn(`EmailJS not configured. Logged failed attempt for ${recipient} (${type})`);
    return { success: false, logId, error: emailLog.error };
  }

  try {
    const payload: Record<string, any> = {
      service_id: EMAILJS_CONFIG.serviceId,
      template_id: templateId,
      user_id: EMAILJS_CONFIG.publicKey,
      template_params: {
        ...templateParams,
        to_email: recipient,
        to_name: templateParams.customer_name || recipient,
      },
    };

    if (EMAILJS_CONFIG.privateKey) {
      payload.accessToken = EMAILJS_CONFIG.privateKey;
    }

    const response = await fetch(EMAILJS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const responseText = await response.text();
      emailLog.status = "sent";
      emailLog.messageId = responseText || "EMAILJS_OK";
      emailLog.sentAt = new Date().toISOString();
      await emailLogRepository.save(emailLog);
      logger.info(`EmailJS message sent successfully to ${recipient} (Template: ${templateId})`);
      return { success: true, logId };
    } else {
      const errorText = await response.text();
      emailLog.status = "failed";
      emailLog.error = `HTTP ${response.status}: ${errorText}`;
      await emailLogRepository.save(emailLog);
      logger.error(`EmailJS dispatch failed for ${recipient}`, errorText);
      return { success: false, logId, error: emailLog.error };
    }
  } catch (err: any) {
    emailLog.status = "failed";
    emailLog.error = err.message || "Network error during EmailJS request";
    await emailLogRepository.save(emailLog);
    logger.error(`EmailJS network error for ${recipient}`, err);
    return { success: false, logId, error: emailLog.error };
  }
}

/**
 * Triggers transactional order emails (Customer Confirmation & Admin Notification)
 * strictly after payment is confirmed. Handles duplicate prevention via idempotency checks.
 */
export async function sendOrderEmails(
  order: Order,
  options?: { forceCustomer?: boolean; forceAdmin?: boolean }
): Promise<{ customerSent: boolean; adminSent: boolean }> {
  const params = buildEmailJsParams(order);
  let customerSent = false;
  let adminSent = false;

  const existingLogs = await emailLogRepository.getByOrderId(order.id);
  const hasCustomerLog = existingLogs.some((l) => l.type === "order_confirmation");
  const hasAdminLog = existingLogs.some((l) => l.type === "new_order_admin");

  // 1. Send Customer Order Confirmation (template_bnf8vrj)
  if ((!order.customerConfirmationEmailSent && !hasCustomerLog) || options?.forceCustomer) {
    const result = await sendEmailJsMessage({
      templateId: EMAILJS_CONFIG.customerTemplateId,
      templateParams: params,
      recipient: order.customerEmail,
      type: "order_confirmation",
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
    customerSent = result.success;
    order.customerConfirmationEmailSent = true;
  }

  // 2. Send Admin New Order Notification (template_771c56e)
  if ((!order.adminNotificationEmailSent && !hasAdminLog) || options?.forceAdmin) {
    const adminRecipient = EMAILJS_CONFIG.adminEmail;
    const result = await sendEmailJsMessage({
      templateId: EMAILJS_CONFIG.adminTemplateId,
      templateParams: params,
      recipient: adminRecipient,
      type: "new_order_admin",
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
    adminSent = result.success;
    order.adminNotificationEmailSent = true;
  }

  // 3. Mark idempotency flags on Order
  await orderRepository.updateOrder(order.id, {
    customerConfirmationEmailSent: true,
    adminNotificationEmailSent: true,
  });

  return { customerSent, adminSent };
}

/**
 * Resends a specific email from the admin dashboard
 */
export async function resendEmailLog(logId: string): Promise<{ success: boolean; error?: string }> {
  const log = await emailLogRepository.getById(logId);
  if (!log) return { success: false, error: "Email log not found" };

  const order = await orderRepository.getOrderById(log.orderId);
  if (!order) return { success: false, error: "Referenced order not found" };

  const params = buildEmailJsParams(order);

  const result = await sendEmailJsMessage({
    templateId: log.templateId,
    templateParams: params,
    recipient: log.recipient,
    type: log.type,
    orderId: order.id,
    orderNumber: order.orderNumber,
  });

  if (result.success) {
    await emailLogRepository.update(logId, {
      status: "sent",
      retryCount: (log.retryCount || 0) + 1,
      sentAt: new Date().toISOString(),
      error: undefined,
    });
    return { success: true };
  } else {
    await emailLogRepository.update(logId, {
      status: "failed",
      retryCount: (log.retryCount || 0) + 1,
      error: result.error,
    });
    return { success: false, error: result.error };
  }
}
