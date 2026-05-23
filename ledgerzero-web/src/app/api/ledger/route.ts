export const runtime = 'edge';
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    // 1. Get the user's business (default to first business found)
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .limit(1);

    if (bizError) throw bizError;

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({
        invoices: [],
        transactions: [],
      });
    }

    const businessId = businesses[0].id;

    // 2. Fetch data for this business
    // RLS handles user verification; we filter by business_id for multi-tenancy
    const [invoicesRes, transactionsRes] = await Promise.all([
      supabase
        .from('invoices')
        .select('*, clients(name)')
        .eq('business_id', businessId)
        .neq('status', 'paid') // Fetch all unpaid/sent/overdue invoices
        .order('created_at', { ascending: false }),
      supabase
        .from('bank_transactions')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: false }),
    ]);

    if (invoicesRes.error) throw invoicesRes.error;
    if (transactionsRes.error) throw transactionsRes.error;

    // Map the nested client name to clientName for the frontend
    const invoices = invoicesRes.data.map((inv: any) => ({
      ...inv,
      clientName: inv.clients?.name || 'Unknown Client',
      amount: inv.total_amount, // Map total_amount to amount
      date: inv.created_at, // Use created_at as date for now
    }));

    return NextResponse.json({
      invoices,
      transactions: transactionsRes.data,
    });
  } catch (error) {
    console.error("Failed to fetch ledger data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
