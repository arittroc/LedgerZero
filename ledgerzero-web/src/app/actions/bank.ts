"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";

export async function uploadBankStatement(formData: FormData) {
  try {
    const supabase = await createClient();

    // 1. Secure Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "Unauthorized: Please log in again." };
    }

    // 2. Extract File
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file uploaded." };
    }

    const csvText = await file.text();
    
    // 3. Parse CSV
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.error("CSV Parsing Errors:", parsed.errors);
      return { error: "Failed to parse CSV file." };
    }

    // 4. Business Management (Context)
    let business = await prisma.business.findFirst({
      where: { ownerId: user.id }
    });

    if (!business) {
      business = await prisma.business.create({
        data: {
          ownerId: user.id,
          companyName: "My Business",
        }
      });
    }

    // 5. Data Sanitization & Filtering
    const transactionsToCreate = parsed.data
      .map((row: any) => {
        // Find headers dynamically or assume standard names
        const dateStr = row.Date || row.date || row.DATE;
        const descStr = row.Description || row.description || row.DESCRIPTION || row.Particulars || "No description";
        const amountStr = row.Amount || row.amount || row.AMOUNT || row.Credit || row.credit || row.CREDIT;

        if (!dateStr || !amountStr) return null;

        const date = new Date(dateStr);
        // Clean amount string: remove commas, currency symbols
        const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));

        // Ignore invalid rows or withdrawals (MVP: deposits only)
        if (isNaN(date.getTime()) || isNaN(amount) || amount <= 0) {
          return null;
        }

        return {
          businessId: business.id,
          userId: user.id,
          date: date,
          description: descStr,
          amount: amount,
          status: "UNRECONCILED",
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    if (transactionsToCreate.length === 0) {
      return { error: "No valid deposit transactions found in the CSV." };
    }

    // 6. Database Insertion
    // Using a loop to handle potential conflicts or specific business logic if needed later, 
    // but createMany is more efficient for initial ingestion.
    await prisma.bankTransaction.createMany({
      data: transactionsToCreate,
    });

    // 7. Success Handling & Revalidation
    revalidatePath("/dashboard");
    return { success: true, count: transactionsToCreate.length };

  } catch (error: any) {
    console.error("Bank Upload Error:", error);
    return { 
      error: error instanceof Error 
        ? error.message 
        : "An unexpected error occurred during bank statement upload." 
    };
  }
}
