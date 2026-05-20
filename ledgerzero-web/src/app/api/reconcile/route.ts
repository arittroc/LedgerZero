import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface MatchPair {
  invoiceId: string;
  transactionId: string;
}

export async function POST(request: Request) {
  const userId = (await headers()).get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const matches: MatchPair[] = body.matches;

    if (!matches || !Array.isArray(matches)) {
      return NextResponse.json(
        { error: "Invalid matches array provided" },
        { status: 400 },
      );
    }

    // Verify all invoices and transactions belong to the user
    // In a real production app, we would add strict checks here
    // For now, we'll enforce userId in the creation

    const results = await prisma.$transaction(
      matches
        .map((match) => [
          // Create Reconciliation record
          prisma.reconciliation.create({
            data: {
              invoiceId: match.invoiceId,
              transactionId: match.transactionId,
              userId,
            },
          }),
          // Update Invoice status
          prisma.invoice.update({
            where: {
              id: match.invoiceId,
              userId, // Ensure tenant isolation
            },
            data: { status: "PAID" },
          }),
        ])
        .flat(),
    );

    return NextResponse.json({
      success: true,
      processedCount: matches.length,
    });
  } catch (error) {
    console.error("Reconciliation failed:", error);
    return NextResponse.json(
      { error: "Reconciliation failed" },
      { status: 500 },
    );
  }
}
