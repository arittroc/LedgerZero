"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  try {
    const supabase = await createClient();

    // 1. Secure Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "Unauthorized: Please log in again." };
    }

    // 2. Strict Type Parsing
    const clientName = formData.get("clientName") as string;
    const rawAmount = formData.get("amount") as string;
    const rawDueDate = formData.get("dueDate") as string;

    // Enforce Float and Date types strictly for Prisma
    const amount = parseFloat(rawAmount);
    const date = new Date(rawDueDate);

    if (!clientName || isNaN(amount) || isNaN(date.getTime())) {
      return { error: "Missing or invalid required fields. Ensure amount is a number and date is valid." };
    }

    // 3. Business & Client Management (Enforce relations)
    // Find or Auto-onboard the user's business
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

    // Find or create the client record for this business
    let client = await prisma.client.findFirst({
      where: {
        businessId: business.id,
        name: clientName
      }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          businessId: business.id,
          name: clientName
        }
      });
    }

    // 4. Prisma Create Query with Strict Types and Relations
    await prisma.invoice.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        clientName: clientName, 
        amount: amount,
        date: date,
        status: "UNPAID", 
        userId: user.id,
      }
    });

    // 5. Success Handling & Revalidation
    revalidatePath("/dashboard");
    return { success: true };

  } catch (error: any) {
    // Console log the original error for server-side debugging
    console.error("Database Error:", error);

    // Return a safe, serializable error object instead of throwing
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Failed to create invoice due to a database error." 
    };
  }
}
