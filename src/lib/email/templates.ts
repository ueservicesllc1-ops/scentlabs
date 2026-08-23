import { Order, OrderItem } from "@/types/order";
import { EmailJsOrderParams } from "@/types/email";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://scentlab.com";
const SUPPORT_EMAIL = "support@scentlab.com";
const DEFAULT_ADMIN_EMAIL = process.env.EMAILJS_ADMIN_NOTIFICATION_EMAIL || "ueservicesllc1@gmail.com";

/**
 * Formats order items into clean, professional, responsive HTML for EmailJS
 */
export function formatOrderItemsHtml(items: OrderItem[]): string {
  if (!items || items.length === 0) return "<p>No items in order.</p>";

  return items
    .map((item) => {
      const unitPrice = item.unitPrice ?? (item.totalPrice ? item.totalPrice / item.quantity : 0);
      const lineTotal = item.totalPrice ?? (unitPrice * item.quantity);
      
      const customLabelMeta = item.customLabel ? `
        <div style="margin-top: 4px; padding: 6px 10px; background-color: #f3f4f6; border-left: 3px solid #d97706; border-radius: 4px; font-size: 11px; color: #4b5563;">
          <strong>Custom Label:</strong> ${item.customLabel.designName || "Custom Design"} &bull; 
          Size: ${item.customLabel.size || "Standard"} &bull; 
          Material: ${item.customLabel.material || "Gloss"}
        </div>
      ` : "";

      return `
        <div style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: top;">
                <div style="font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase;">
                  ${item.productName || item.productId}
                </div>
                ${item.variantName ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Variant: ${item.variantName}</div>` : ""}
                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                  Qty: ${item.quantity} &times; ${formatCurrency(unitPrice)}
                </div>
                ${customLabelMeta}
              </td>
              <td style="vertical-align: top; text-align: right; font-size: 14px; font-weight: 700; color: #111827; font-family: monospace;">
                ${formatCurrency(lineTotal)}
              </td>
            </tr>
          </table>
        </div>
      `;
    })
    .join("");
}

/**
 * Formats custom label information block for Admin notification
 */
export function formatCustomLabelAdminInfo(items: OrderItem[]): string {
  const customLabelItems = (items || []).filter((i) => i.customLabel);
  if (customLabelItems.length === 0) return "";

  const rows = customLabelItems
    .map(
      (item) => `
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-bottom: 8px;">
        <div style="font-size: 13px; font-weight: 700; color: #92400e; text-transform: uppercase;">${item.productName}</div>
        <div style="font-size: 12px; color: #78350f; margin-top: 4px;">
          <strong>Design:</strong> ${item.customLabel?.designName || "Custom Label"}<br/>
          <strong>Size:</strong> ${item.customLabel?.size || "Standard"}<br/>
          <strong>Material:</strong> ${item.customLabel?.material || "Standard Vinyl"}<br/>
          <strong>Quantity:</strong> ${item.quantity} units<br/>
          <strong>Status:</strong> ${item.customLabel?.status || "Artwork Submitted"}
        </div>
      </div>
    `
    )
    .join("");

  return `
    <div style="margin-top: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h3 style="font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        🎨 Custom Label Production Required
      </h3>
      ${rows}
    </div>
  `;
}

/**
 * Builds the complete dictionary of variables required by EmailJS templates
 */
export function buildEmailJsParams(order: Order): EmailJsOrderParams {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  
  const customerName = order.shippingAddress?.fullName || order.customerEmail.split("@")[0];
  const customerPhone = order.shippingAddress?.phone || "N/A";
  const orderNumber = order.orderNumber || order.id;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const addressLines = [
    order.shippingAddress?.fullName,
    order.shippingAddress?.addressLine1,
    order.shippingAddress?.addressLine2,
    `${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.postalCode || ""}`,
    order.shippingAddress?.country || "United States",
  ]
    .filter(Boolean)
    .join("<br/>");

  const orderItemsHtml = formatOrderItemsHtml(order.items);
  const customLabelInfo = formatCustomLabelAdminInfo(order.items);

  const estimatedDelivery = order.trackingNumber
    ? `Carrier: ${order.carrier || "USPS"} — Tracking: ${order.trackingNumber}`
    : "Tracking information will be available once your order ships.";

  return {
    customer_name: customerName,
    customer_email: order.customerEmail,
    customer_phone: customerPhone,
    order_number: orderNumber,
    order_date: orderDate,
    payment_status: (order.paymentStatus || "paid").toUpperCase(),
    payment_id: order.stripePaymentIntentId || order.stripeSessionId || "STRIPE_CONFIRMED",
    order_items: orderItemsHtml,
    subtotal: formatCurrency(order.subtotal),
    shipping: formatCurrency(order.shippingCost || order.shipping || 0),
    tax: formatCurrency(order.tax || 0),
    total: formatCurrency(order.totalAmount ?? order.total ?? 0),
    shipping_method: order.shippingMethod || "Standard Insured Shipping",
    shipping_address: addressLines || "Standard Delivery",
    estimated_delivery: estimatedDelivery,
    order_url: `${appUrl}/account/orders/${order.id}`,
    admin_order_url: `${appUrl}/admin/orders/${order.id}`,
    website_url: appUrl,
    support_email: SUPPORT_EMAIL,
    custom_label_information: customLabelInfo,
  };
}

/**
 * Pristine Customer Email HTML Template for EmailJS (Template ID: template_bnf8vrj)
 */
export const CUSTOMER_CONFIRMATION_EMAIL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>SCENTLAB Order Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f172a; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #030712; padding: 32px 30px; text-align: center; border-bottom: 2px solid #f59e0b;">
              <h1 style="margin: 0; color: #f59e0b; font-size: 24px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">
                SCENTLAB
              </h1>
              <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">
                Fragrance Oils & Perfumery Systems
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 20px; font-weight: 800;">
                Thank you for your order, {{customer_name}}!
              </h2>
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                Your order has been successfully confirmed and is now being prepared for fulfillment at our laboratory dock.
              </p>

              <!-- Order Metadata Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Order Number</td>
                        <td align="right" style="font-size: 14px; color: #0f172a; font-weight: 800; font-family: monospace;">{{order_number}}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Order Date</td>
                        <td align="right" style="padding-top: 8px; font-size: 13px; color: #334155; font-weight: 600;">{{order_date}}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Payment Status</td>
                        <td align="right" style="padding-top: 8px; font-size: 12px; color: #059669; font-weight: 800; text-transform: uppercase;">{{payment_status}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Order Items Section -->
              <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                Order Summary
              </h3>
              <div style="margin-bottom: 24px;">
                {{{order_items}}}
              </div>

              <!-- Cost Summary Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Subtotal:</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #334155; font-family: monospace;">{{subtotal}}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Shipping ({{shipping_method}}):</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #334155; font-family: monospace;">{{shipping}}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Estimated Tax:</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #334155; font-family: monospace;">{{tax}}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 4px 0; font-size: 16px; font-weight: 900; color: #0f172a; border-top: 2px solid #e2e8f0;">Total Paid:</td>
                  <td align="right" style="padding: 12px 0 4px 0; font-size: 18px; font-weight: 900; color: #d97706; font-family: monospace; border-top: 2px solid #e2e8f0;">{{total}}</td>
                </tr>
              </table>

              <!-- Shipping Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
                      Shipping Address
                    </div>
                    <div style="font-size: 13px; color: #334155; line-height: 1.4;">
                      {{{shipping_address}}}
                    </div>
                    <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b;">
                      <strong>Delivery Status:</strong> {{estimated_delivery}}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="{{order_url}}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #0f172a; text-decoration: none; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-radius: 10px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                      View My Order
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #475569;">
                SCENTLAB FORMULATIONS
              </p>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b;">
                Thank you for shopping with us. Questions? Contact us at <a href="mailto:{{support_email}}" style="color: #d97706; text-decoration: underline;">{{support_email}}</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                <a href="{{website_url}}" style="color: #64748b; text-decoration: none;">Visit Store</a> &bull; Fast Shipping &bull; Premium Quality Guaranteed
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Pristine Admin New Order Email HTML Template for EmailJS (Template ID: template_771c56e)
 */
export const ADMIN_NEW_ORDER_EMAIL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>SCENTLAB — New Order Received</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #030712; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #000000; padding: 28px 30px; border-bottom: 2px solid #f59e0b;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 10px; font-weight: 800; color: #f59e0b; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 4px;">
                      ADMIN FULFILLMENT ALERT
                    </span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">
                      New Paid Order Received
                    </h1>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 12px; background-color: #064e3b; border: 1px solid #059669; color: #34d399; font-size: 11px; font-weight: 800; text-transform: uppercase; border-radius: 6px; font-family: monospace;">
                      {{total}}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px; color: #e2e8f0;">
              
              <!-- Customer & Order Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="48%" style="vertical-align: top; background-color: #1e293b; padding: 16px; border-radius: 10px;">
                    <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Customer Details</div>
                    <div style="font-size: 14px; font-weight: 700; color: #ffffff;">{{customer_name}}</div>
                    <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">{{customer_email}}</div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Phone: {{customer_phone}}</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align: top; background-color: #1e293b; padding: 16px; border-radius: 10px;">
                    <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Order & Payment</div>
                    <div style="font-size: 14px; font-weight: 700; color: #f59e0b; font-family: monospace;">{{order_number}}</div>
                    <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">Date: {{order_date}}</div>
                    <div style="font-size: 11px; color: #34d399; font-weight: 700; margin-top: 2px; text-transform: uppercase;">Status: {{payment_status}}</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">Ref: {{payment_id}}</div>
                  </td>
                </tr>
              </table>

              <!-- Custom Label Alert Block (if any) -->
              {{{custom_label_information}}}

              <!-- Order Items Section -->
              <h3 style="margin: 24px 0 12px 0; color: #f8fafc; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #334155; pb: 6px;">
                Order Line Items
              </h3>
              <div style="background-color: #ffffff; border-radius: 10px; padding: 16px; margin-bottom: 24px; color: #000000;">
                {{{order_items}}}
              </div>

              <!-- Cost Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px; background-color: #1e293b; padding: 16px; border-radius: 10px;">
                <tr>
                  <td style="padding: 3px 0; font-size: 12px; color: #94a3b8;">Items Subtotal:</td>
                  <td align="right" style="padding: 3px 0; font-size: 12px; color: #ffffff; font-family: monospace;">{{subtotal}}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-size: 12px; color: #94a3b8;">Shipping ({{shipping_method}}):</td>
                  <td align="right" style="padding: 3px 0; font-size: 12px; color: #ffffff; font-family: monospace;">{{shipping}}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-size: 12px; color: #94a3b8;">Sales Tax:</td>
                  <td align="right" style="padding: 3px 0; font-size: 12px; color: #ffffff; font-family: monospace;">{{tax}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 2px 0; font-size: 15px; font-weight: 800; color: #ffffff; border-top: 1px solid #334155;">Net Received:</td>
                  <td align="right" style="padding: 10px 0 2px 0; font-size: 16px; font-weight: 800; color: #f59e0b; font-family: monospace; border-top: 1px solid #334155;">{{total}}</td>
                </tr>
              </table>

              <!-- Shipping Destination Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1e293b; border-radius: 10px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">
                      Shipment Destination
                    </div>
                    <div style="font-size: 13px; color: #f1f5f9; line-height: 1.4;">
                      {{{shipping_address}}}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Admin Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="{{admin_order_url}}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #030712; text-decoration: none; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-radius: 10px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                      Open Order in Admin Dashboard
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #000000; padding: 20px 30px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                SCENTLAB Automated Fulfillment Engine &bull; Private Admin Notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
