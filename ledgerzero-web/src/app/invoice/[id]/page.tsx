import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { formatCurrency, formatDate } from "@/utils/format";
import { Wallet, Building2, Calendar, FileText, User } from "lucide-react";
import { InvoicePaymentAction } from "@/components/InvoicePaymentAction";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicInvoicePage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch full invoice graph bypassing RLS safely via service role
  const { data: invoice, error } = await supabaseAdmin
    .from("invoices")
    .select(`
      *,
      businesses (
        company_name,
        currency
      ),
      clients (
        name,
        email
      ),
      invoice_items (*)
    `)
    .eq("id", id)
    .single();

  if (error || !invoice) {
    console.error("Public Invoice Fetch Error:", error);
    return notFound();
  }

  const business = invoice.businesses as any;
  const client = invoice.clients as any;
  const items = invoice.invoice_items || [];

  return (
    <main className="min-h-screen bg-[#050505] p-6 lg:p-12 flex flex-col items-center">
      {/* Background Liquid Glass Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Header Branding */}
      <div className="relative z-10 w-full max-w-[800px] mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl">
             <Wallet className="size-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">LedgerZero</span>
        </div>
        <InvoicePaymentAction 
          invoiceId={invoice.id} 
          status={invoice.status} 
          totalAmount={Number(invoice.total_amount)}
        />
      </div>

      {/* The Invoice Sheet */}
      <div className="relative z-10 w-full max-w-[800px] overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.02] backdrop-blur-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 duration-700">
        
        {/* Top Section: Business & Meta */}
        <div className="p-12 border-b border-white/5 grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">From</p>
            <div className="flex items-center gap-4 mb-2">
               <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Building2 className="size-6" />
               </div>
               <h1 className="text-3xl font-black text-white tracking-tighter">{business?.company_name}</h1>
            </div>
          </div>

          <div className="md:text-right space-y-6">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Invoice ID</p>
              <p className="text-lg font-bold text-white tracking-tight">#{invoice.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex md:justify-end gap-10">
               <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Issued</p>
                 <p className="text-sm font-bold text-white">{formatDate(invoice.created_at)}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1 text-accent">Due Date</p>
                 <p className="text-sm font-bold text-white">{formatDate(invoice.due_date || invoice.created_at)}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Client Section */}
        <div className="p-12 bg-white/[0.01] border-b border-white/5">
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Billed To</p>
           <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                 <User className="size-6" />
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-white tracking-tight">{client?.name}</h2>
                 <p className="text-gray-400 font-medium">{client?.email}</p>
              </div>
           </div>
        </div>

        {/* Line Items Table */}
        <div className="p-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <th className="pb-6 pl-4">Description</th>
                <th className="pb-6 text-center">Qty</th>
                <th className="pb-6 text-right pr-4">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item: any) => (
                <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-8 pl-4">
                    <p className="text-lg font-bold text-white leading-tight">{item.description}</p>
                  </td>
                  <td className="py-8 text-center text-gray-400 font-bold tabular-nums">
                    {Number(item.quantity)}
                  </td>
                  <td className="py-8 text-right pr-4 text-lg font-bold text-white tabular-nums">
                    {formatCurrency(item.unit_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grand Total */}
        <div className="p-12 bg-white/[0.03] flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                 <FileText className="size-5" />
              </div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Amount Due</span>
           </div>
           <div className="text-right">
              <p className="text-5xl font-black text-white tracking-tighter tabular-nums">
                {formatCurrency(invoice.total_amount)}
              </p>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-600 font-medium text-sm">
        Secured by LedgerZero & Razorpay.
      </footer>
    </main>
  );
}
