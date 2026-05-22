import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const transactions = await request.json();

    if (!Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 },
      );
    }

    // 1. Get the user's business (default to first business found)
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .limit(1);

    if (bizError || !businesses || businesses.length === 0) {
      return NextResponse.json({ error: "No business found" }, { status: 400 });
    }
    const businessId = businesses[0].id;

    // 2. Map and format data for insertion
    const dataToInsert = transactions.map((t: any) => ({
      business_id: businessId,
      description: t.description,
      amount: typeof t.amount === "string" ? parseFloat(t.amount) : t.amount,
      date: new Date(t.date).toISOString(),
    }));

    // 3. Batch insert bank transactions
    const { error: insertError } = await supabase
      .from('bank_transactions')
      .insert(dataToInsert);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: dataToInsert.length,
    });
  } catch (error) {
    console.error("Failed to upload transactions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
