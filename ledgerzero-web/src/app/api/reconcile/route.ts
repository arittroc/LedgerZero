import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface MatchPair {
  invoiceId: string;
  transactionId: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const matches: MatchPair[] = body.matches;

    if (!matches || !Array.isArray(matches)) {
      return NextResponse.json(
        { error: "Invalid matches array provided" },
        { status: 400 }
      );
    }

    const results = await prisma.$transaction(
      matches.map((match) => [
        // Create Reconciliation record
        prisma.reconciliation.create({
          data: {
            invoiceId: match.invoiceId,
            transactionId: match.transactionId,
          },
        }),
        // Update Invoice status
        prisma.invoice.update({
          where: { id: match.invoiceId },
          data: { status: "PAID" },
        }),
      ]).flat()
    );

    return NextResponse.json({
      success: true,
      processedCount: matches.length,
    });
  } catch (error) {
    console.error("Reconciliation failed:", error);
    return NextResponse.json(
      { error: "Reconciliation failed" },
      { status: 500 }
    );
  }
}
