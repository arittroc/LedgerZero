import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type ItemInsert = Database['public']['Tables']['invoice_items']['Insert'];

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const { business_id, client_id, due_date, status, items } = await request.json();

    if (!business_id || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert the Invoice
    // RLS will automatically block this if business_id doesn't belong to auth.uid()
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        business_id,
        client_id,
        due_date,
        status: status || 'draft',
      } as InvoiceInsert)
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 400 });
    }

    // 2. Insert Invoice Items
    // The total_amount in the 'invoices' table is handled by the trg_recalculate_invoice_total trigger.
    const itemsToInsert: ItemInsert[] = items.map((item: any) => ({
      invoice_id: invoice.id,
      business_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // Manual cleanup if items fail (or consider using an RPC for true atomicity)
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data: invoice 
    });

  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
