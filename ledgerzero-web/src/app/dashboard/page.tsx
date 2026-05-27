import { redirect } from "next/navigation";
import { LogOut, FileText, Activity, Wallet, ArrowRight, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import NewInvoiceSlideOut from "@/components/NewInvoiceSlideOut";
import BankFeed from "@/components/BankFeed";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Outstanding Invoices using Prisma
  const invoices = await prisma.invoice.findMany({
    where: { 
      userId: user.id,
      status: "UNPAID",
    },
    orderBy: { createdAt: "desc" }
  });

  // 3. Fetch Unreconciled Bank Transactions
  const bankTransactions = await prisma.bankTransaction.findMany({
    where: {
      userId: user.id,
      status: "UNRECONCILED",
    },
    orderBy: { date: "desc" },
    take: 5,
  });

  const totalOutstanding = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

  // Safely stringify data for client components to prevent hydration errors or rendering crashes
  const serializedTransactions = bankTransactions.map(tx => ({
    id: tx.id,
    description: tx.description,
    amount: Number(tx.amount),
    date: new Date(tx.date).toLocaleDateString(),
  }));

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-orange-500/30">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        {/* Top Navigation / Header */}
        <header className="flex items-center justify-between mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
              <Wallet className="size-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">LedgerZero</h1>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500 font-medium">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                <LogOut className="size-4" />
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main KPI Card */}
          <div className="lg:col-span-3 group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-[32px] p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">

            {/* Background glow with pointer-events disabled */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <p className="text-gray-400 text-sm font-semibold tracking-widest uppercase mb-4 relative z-10">Total Unreconciled</p>

            <div className="flex items-end justify-between relative z-10">
              <h2 className="text-6xl font-bold tracking-tighter">
                ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>

              {/* Elevated Link to ensure clickability */}
              <Link
                href="/dashboard?action=new-invoice"
                scroll={false}
                className="relative z-10 h-12 px-6 rounded-full bg-white text-black font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="size-4" />
                New Invoice
              </Link>
            </div>
          </div>

          {/* Outstanding Invoices Pane */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-[32px] p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-gray-400" />
                <h3 className="text-lg font-semibold">Outstanding Invoices</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400">
                {invoices?.length || 0} Total
              </span>
            </div>

            {!invoices || invoices.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <div className="size-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <FileText className="size-6 text-gray-500" />
                </div>
                <p className="text-white font-medium mb-1">No outstanding invoices</p>
                <p className="text-gray-500 text-sm max-w-[250px]">You are completely caught up. Create a new invoice to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="group/item flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="size-2 rounded-full bg-orange-500 animate-pulse" />
                      <div>
                        <p className="font-medium text-white mb-0.5">Invoice #{invoice.id.split('-')[0]}</p>
                        <p className="text-xs text-gray-500">Due {new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <ArrowRight className="size-4 text-gray-600 group-hover/item:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Bank Feed Component */}
          <BankFeed initialTransactions={serializedTransactions} />

        </div>
      </div>
      <NewInvoiceSlideOut />
    </main>
  );
}
