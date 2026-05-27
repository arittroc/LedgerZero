import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Secure Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Data Fetching
    const history = await prisma.reconciliation.findMany({
      where: {
        userId: user.id,
      },
      include: {
        invoice: true,
        transaction: true,
      },
      orderBy: {
        reconciledAt: "desc",
      },
    });

    // 3. CSV Formatting
    const headers = ["Date", "Client", "Invoice ID", "Bank Description", "Amount"].join(",");
    const rows = history.map((record) => {
      const date = new Date(record.reconciledAt).toLocaleDateString();
      const client = record.invoice.clientName || "Unknown Client";
      const invoiceId = record.invoice.id.split("-")[0];
      const description = record.transaction.description;
      const amount = record.invoice.amount.toFixed(2);

      // Wrap text fields in double quotes to handle commas
      return [
        `"${date}"`,
        `"${client}"`,
        `"${invoiceId}"`,
        `"${description}"`,
        amount,
      ].join(",");
    });

    const csvString = [headers, ...rows].join("\n");

    // 4. Response with Download Headers
    return new NextResponse(csvString, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="ledger_export.csv"',
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
