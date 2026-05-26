"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Sanitizes date strings from various formats (e.g., DD-MM-YYYY) to YYYY-MM-DD
 */
function sanitizeDate(dateStr: string): string {
  if (!dateStr) return dateStr;

  // DD-MM-YYYY -> YYYY-MM-DD (Postgres format)
  const dmyMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return dateStr;
}
export async function createInvoice(formData: FormData) {
  const supabase = await createClient();

  const clientName = formData.get("clientName") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const rawDueDate = formData.get("dueDate") as string;
  const dueDate = sanitizeDate(rawDueDate);

  if (!clientName || isNaN(amount) || !dueDate) {
    throw new Error("Missing or invalid required fields");
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("You must be logged in to create an invoice");
  }

  // 1. Get or Auto-create the user's business
  let { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", session.user.id)
    .maybeSingle();

  if (!business) {
    const { data: newBiz, error: createBizError } = await supabase
      .from("businesses")
      .insert({
        owner_id: session.user.id,
        company_name: "My Business",
      })
      .select("id")
      .single();

    if (createBizError || !newBiz) {
      console.error("Auto-onboarding failed:", createBizError);
      throw new Error("Failed to initialize your business profile automatically.");
    }
    business = newBiz;
  }

  // 2. Find or create the client record
  let clientId: string;
  const { data: existingClient, error: clientFetchError } = await supabase
    .from("clients")
    .select("id")
    .eq("business_id", business.id)
    .eq("name", clientName)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const { data: newClient, error: clientCreateError } = await supabase
      .from("clients")
      .insert({
        business_id: business.id,
        name: clientName,
      })
      .select("id")
      .single();

    if (clientCreateError || !newClient) {
      throw new Error(`Failed to create record for client: ${clientName}`);
    }
    clientId = newClient.id;
  }

  // 3. Insert the invoice with status "sent" (per schema pending state)
  const { error: invError } = await supabase
    .from("invoices")
    .insert({
      business_id: business.id,
      client_id: clientId,
      total_amount: amount,
      due_date: dueDate,
      status: "sent", 
    });

  if (invError) {
    console.error("Invoice insertion error:", invError);
    throw new Error(`Database error: ${invError.message || "Failed to save invoice"}`);
  }

  revalidatePath("/dashboard");
  return { success: true };
}
