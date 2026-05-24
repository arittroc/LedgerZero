import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase environment variables are missing! Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Verify Signature (if secret is provided)
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("❌ Invalid Razorpay Webhook Signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      console.warn("⚠️ Razorpay Webhook received without verification (Secret missing or signature absent)");
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    console.log(`🔔 Razorpay Webhook Event: ${event}`);

    // 2. Handle successful payment
    if (event === "order.paid" || event === "payment.captured") {
      const payment = payload.payload.payment?.entity || payload.payload.order?.entity;
      const invoiceId = payload.payload.order?.entity?.notes?.invoiceId || payload.payload.payment?.entity?.notes?.invoiceId;

      if (invoiceId) {
        console.log(`✅ Marking invoice ${invoiceId} as PAID via Razorpay`);

        const { error } = await supabaseAdmin
          .from("invoices")
          .update({ status: "paid" })
          .eq("id", invoiceId);

        if (error) {
          console.error(`❌ Failed to update invoice ${invoiceId}:`, error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ status: "ok" });

  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
