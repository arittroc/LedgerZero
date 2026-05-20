export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  const userId = (await headers()).get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [invoices, transactions] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId,
          status: "UNPAID",
        },
        orderBy: { date: "desc" },
      }),
      prisma.bankTransaction.findMany({
        where: { userId },
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
      { status: 500 },
    );
  }
}
