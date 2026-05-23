export const runtime = 'edge';
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { transactionId, invoiceId, matches } = body;

    // 1. Determine the list of matches to process
    const matchesToProcess = matches || (transactionId && invoiceId ? [{ transactionId, invoiceId }] : []);

    if (matchesToProcess.length === 0) {
      return NextResponse.json(
        { error: "No matches provided" },
        { status: 400 },
      );
    }

    // 2. Get the user's business (default to first business found)
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .limit(1);

    if (bizError || !businesses || businesses.length === 0) {
      return NextResponse.json({ error: "No business found" }, { status: 400 });
    }
    const businessId = businesses[0].id;

    // 3. Process matches
    // In a production environment, this logic should be moved to a Postgres RPC
    // to ensure atomicity across multiple matches.
    const results = [];
    for (const match of matchesToProcess) {
      const { transactionId, invoiceId } = match;

      // Create reconciliation link
      // RLS ensures the user owns both the business and the related records
      const { data: rec, error: recError } = await supabase
        .from('reconciliations')
        .insert({
          transaction_id: transactionId,
          invoice_id: invoiceId,
          business_id: businessId
        })
        .select()
        .single();

      if (recError) {
        console.error(`Match failed for invoice ${invoiceId}:`, recError);
        continue;
      }

      // Update invoice status to 'paid'
      await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId)
        .eq('business_id', businessId);

      results.push(rec);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      reconciliations: results,
    });
  } catch (error) {
    console.error("Reconciliation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
