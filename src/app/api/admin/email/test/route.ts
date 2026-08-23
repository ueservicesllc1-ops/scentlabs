import { NextRequest, NextResponse } from "next/server";
import { EMAILJS_CONFIG, isEmailJsConfigured, sendEmailJsMessage } from "@/lib/email/emailjs";
import { formatCurrency } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const isConfigured = isEmailJsConfigured();
    if (!isConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: "EmailJS is not fully configured. Please set EMAILJS_SERVICE_ID and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY in environment variables.",
          config: {
            serviceId: EMAILJS_CONFIG.serviceId ? "Configured" : "Missing",
            publicKey: EMAILJS_CONFIG.publicKey ? "Configured" : "Missing",
            customerTemplate: EMAILJS_CONFIG.customerTemplateId,
            adminTemplate: EMAILJS_CONFIG.adminTemplateId,
            adminEmail: EMAILJS_CONFIG.adminEmail,
          },
        },
        { status: 400 }
      );
    }

    const testParams = {
      customer_name: "SCENTLAB Admin Tester",
      customer_email: EMAILJS_CONFIG.adminEmail,
      customer_phone: "+1 (800) 555-0199",
      order_number: "SC-TEST-000001",
      order_date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      payment_status: "TEST_CONFIRMED",
      payment_id: "pi_test_simulation_123",
      order_items: `<div style="font-family: sans-serif; font-size: 13px;">10 ml Roll-On Amber Bottles &times; 100 — <strong>$84.00</strong></div>`,
      subtotal: "$84.00",
      shipping: "$8.50",
      tax: "$5.88",
      total: "$98.38",
      shipping_method: "USPS Ground Advantage (Insured)",
      shipping_address: "2000 NW 84th Ave, Suite 100<br/>Miami, FL 33122",
      estimated_delivery: "2-4 Business Days",
      order_url: "https://scentlab.com/account/orders/test",
      admin_order_url: "https://scentlab.com/admin/orders/test",
      website_url: "https://scentlab.com",
      support_email: "support@scentlab.com",
      custom_label_information: "",
    };

    const result = await sendEmailJsMessage({
      templateId: EMAILJS_CONFIG.adminTemplateId,
      templateParams: testParams,
      recipient: EMAILJS_CONFIG.adminEmail,
      type: "new_order_admin",
      orderId: "test_order_001",
      orderNumber: "SC-TEST-000001",
    });

    return NextResponse.json({
      success: result.success,
      logId: result.logId,
      error: result.error,
      recipient: EMAILJS_CONFIG.adminEmail,
      templateUsed: EMAILJS_CONFIG.adminTemplateId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch test email" },
      { status: 500 }
    );
  }
}
