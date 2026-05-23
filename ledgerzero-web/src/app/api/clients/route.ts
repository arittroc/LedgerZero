export const runtime = 'edge';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  let business_id = searchParams.get('business_id');

  // If no business_id provided, fetch the default one
  if (!business_id) {
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .limit(1);

    if (bizError || !businesses || businesses.length === 0) {
      return NextResponse.json({ data: [] });
    }
    business_id = (businesses as any)[0].id;
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', business_id as string)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { business_id, name, email } = await request.json();

    if (!business_id || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clients')
      // @ts-ignore
      .insert({ business_id, name, email })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Client creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
