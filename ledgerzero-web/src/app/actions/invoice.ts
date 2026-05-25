"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  const supabase = await createClient();

  const clientName = formData.get("clientName") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dueDate = formData.get("dueDate") as string;

  if (!clientName || isNaN(amount) || !dueDate) {
    throw new Error("Missing required fields");
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 1. Get the user's business
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", session.user.id)
    .single();

  if (bizError || !business) {
    throw new Error("Business not found. Please complete onboarding.");
  }

  // 2. Find or create the client
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
      throw new Error("Failed to create client");
    }
    clientId = newClient.id;
  }

  // 3. Insert the invoice
  const { error: invError } = await supabase
    .from("invoices")
    .insert({
      business_id: business.id,
      client_id: clientId,
      total_amount: amount,
      due_date: dueDate,
      status: "sent", // 'sent' serves as our 'pending' for now per schema types
    });

  if (invError) {
    console.error("Error creating invoice:", invError);
    throw new Error("Failed to create invoice");
  }

  revalidatePath("/dashboard");
  return { success: true };
}
