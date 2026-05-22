import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    // 1. Get the user's business
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .limit(1);

    if (bizError || !businesses || businesses.length === 0) {
      return NextResponse.json({ error: "No business found" }, { status: 400 });
    }
    const businessId = businesses[0].id;

    // 2. Fetch Unpaid Invoices (including client names for the UI)
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('*, clients(name)')
      .eq('business_id', businessId)
      .neq('status', 'paid')
      .order('created_at', { ascending: false });

    if (invError) throw invError;

    // 3. Fetch Unlinked Bank Transactions
    // We select bank_transactions and the related reconciliation record.
    // If reconciliations is empty, the transaction is unlinked.
    const { data: transactions, error: txError } = await supabase
      .from('bank_transactions')
      .select('*, reconciliations(id)')
      .eq('business_id', businessId)
      .order('date', { ascending: false });

    if (txError) throw txError;

    const unlinkedTransactions = transactions.filter(tx => !tx.reconciliations || tx.reconciliations.length === 0);

    // 4. Matching Algorithm
    const suggestions = [];
    const matchedTxIds = new Set<string>();
    const matchedInvIds = new Set<string>();

    for (const inv of invoices) {
      for (const tx of unlinkedTransactions) {
        if (matchedTxIds.has(tx.id) || matchedInvIds.has(inv.id)) continue;

        // Condition A: Exact Amount Match
        const amountMatch = Math.abs(Number(inv.total_amount) - Math.abs(Number(tx.amount))) < 0.01;

        if (amountMatch) {
          const invDate = new Date(inv.created_at);
          const txDate = new Date(tx.date);
          
          // Condition B: Transaction Date is on or after Invoice Creation
          // Condition C: Within a 30-day window
          const diffTime = txDate.getTime() - invDate.getTime();
          const diffDays = diffTime / (1000 * 3600 * 24);

          if (diffDays >= 0 && diffDays <= 30) {
            suggestions.push({
              invoice: {
                id: inv.id,
                clientName: inv.clients?.name || 'Unknown Client',
                amount: inv.total_amount,
                date: inv.created_at
              },
              transaction: {
                id: tx.id,
                description: tx.description,
                amount: tx.amount,
                date: tx.date
              },
              confidence: 'high',
              reason: 'Exact amount match within 30 days'
            });

            matchedTxIds.add(tx.id);
            matchedInvIds.add(inv.id);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error("Auto-match error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
