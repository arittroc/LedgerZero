export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [invoices, transactions] = await Promise.all([
      prisma.invoice.findMany({
        where: { status: "UNPAID" },
        orderBy: { date: "desc" },
      }),
      prisma.bankTransaction.findMany({
        orderBy: { date: "desc" },
      }),
    ]);

    return NextResponse.json({
      invoices,
      transactions,
    });
  } catch (error) {
    console.error("Failed to fetch ledger data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
