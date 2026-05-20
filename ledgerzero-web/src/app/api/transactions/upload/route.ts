import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface TransactionInput {
  description: string;
  amount: string | number;
  date: string;
}

export async function POST(request: Request) {
  const userId = (await headers()).get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactions = await request.json();

    if (!Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 },
      );
    }

    // Map incoming data to BankTransaction schema and ensure userId is set
    const dataToInsert = transactions.map((t: TransactionInput) => ({
      description: t.description,
      amount: typeof t.amount === "string" ? parseFloat(t.amount) : t.amount,
      date: new Date(t.date),
      userId: userId,
    }));

    const result = await prisma.bankTransaction.createMany({
      data: dataToInsert,
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error("Failed to upload transactions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
