import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
});

export async function POST(request: Request) {
  try {
    const { invoiceId, totalAmount } = await request.json();

    if (!invoiceId || !totalAmount) {
      return NextResponse.json({ error: "Invoice ID and Amount are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Verify Invoice exists and is unpaid
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
    }

    // 2. Create Razorpay Order
    // amount is in the smallest currency unit (paise for INR)
    const options = {
      amount: Math.round(Number(totalAmount) * 100),
      currency: "INR",
      receipt: `receipt_${invoiceId.slice(-10)}`,
      notes: {
        invoiceId: invoiceId, // Important for webhook identification
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
