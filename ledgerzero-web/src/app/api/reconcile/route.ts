import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const userId = (await headers()).get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { transactionId, invoiceId } = await request.json();

    if (!transactionId || !invoiceId) {
      return NextResponse.json(
        { error: "transactionId and invoiceId are required" },
        { status: 400 },
      );
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify both records exist and belong to the authenticated userId
      const transaction = await tx.bankTransaction.findUnique({
        where: { id: transactionId, userId },
      });

      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId, userId },
      });

      if (!transaction || !invoice) {
        throw new Error("Transaction or Invoice not found or unauthorized");
      }

      // 2. Create a new Reconciliation record linking the two IDs
      const reconciliation = await tx.reconciliation.create({
        data: {
          transactionId,
          invoiceId,
          userId,
        },
      });

      // 3. Update the Invoice status to 'PAID'
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" },
      });

      // Note: The BankTransaction model in schema.prisma doesn't have a 'status' field.
      // We'll update it if it existed, but based on the schema it doesn't.
      // However, we can check for existence of reconciliation record in the UI.

      return reconciliation;
    });

    return NextResponse.json({
      success: true,
      reconciliation: result,
    });
  } catch (error) {
    console.error("Reconciliation error:", error);
    const message =
      error instanceof Error ? error.message : "Reconciliation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
