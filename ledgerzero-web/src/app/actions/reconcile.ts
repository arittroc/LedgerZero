"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function autoReconcile() {
  try {
    const supabase = await createClient();

    // 1. Secure Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "Unauthorized: Please log in again." };
    }

    // 2. Fetch Pending Records
    const [unpaidInvoices, unreconciledTransactions] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId: user.id,
          status: "UNPAID",
        },
        orderBy: { date: "asc" },
      }),
      prisma.bankTransaction.findMany({
        where: {
          userId: user.id,
          status: "UNRECONCILED",
        },
        orderBy: { date: "asc" },
      }),
    ]);

    if (unpaidInvoices.length === 0 || unreconciledTransactions.length === 0) {
      return { success: true, matchesFound: 0, message: "No pending records found to match." };
    }

    let matchesFound = 0;
    const usedTransactionIds = new Set<string>();

    // 3. Matching Logic (Exact Amount)
    for (const invoice of unpaidInvoices) {
      // Find a matching transaction that hasn't been used in this batch
      const match = unreconciledTransactions.find(
        (tx) => 
          tx.amount === invoice.amount && 
          !usedTransactionIds.has(tx.id)
      );

      if (match) {
        usedTransactionIds.add(match.id);

        // 4. Mutation: Link and Update Statuses
        await prisma.$transaction([
          prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: "PAID" },
          }),
          prisma.bankTransaction.update({
            where: { id: match.id },
            data: { status: "RECONCILED" },
          }),
          prisma.reconciliation.create({
            data: {
              invoiceId: invoice.id,
              transactionId: match.id,
              userId: user.id,
              businessId: invoice.businessId,
            },
          }),
        ]);

        matchesFound++;
      }
    }

    // 5. Success Handling & Revalidation
    if (matchesFound > 0) {
      revalidatePath("/dashboard");
    }

    return { 
      success: true, 
      matchesFound, 
      message: matchesFound > 0 
        ? `Successfully auto-reconciled ${matchesFound} matches.` 
        : "No matching amounts found between invoices and bank transactions." 
    };

  } catch (error: any) {
    console.error("Auto-Reconcile Error:", error);
    return { 
      error: error instanceof Error 
        ? error.message 
        : "An unexpected error occurred during auto-reconciliation." 
    };
  }
}
