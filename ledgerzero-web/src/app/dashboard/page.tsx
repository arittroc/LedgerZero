import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LogOut, Wallet } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-orange-600/5 blur-[120px]" />
      </div>

      {/* Header */}
      <nav className="relative z-10 mx-auto max-w-7xl px-6 py-8 flex justify-between items-center border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <div className="size-8 rounded-lg bg-white flex items-center justify-center">
            <div className="size-4 bg-black rounded-sm rotate-45" />
          </div>
          LedgerZero
        </div>
        
        <form action="/api/auth/logout" method="POST">
          <button 
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-medium text-sm text-gray-400 hover:text-white"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </form>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400 text-xs font-semibold mb-8">
          Authorized Session
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-6">
          Welcome to your <br />
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            LedgerZero Workspace
          </span>
        </h1>
        <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
          Your financial data is being synchronized. We're setting up your automated reconciliation pipelines.
        </p>

        {/* Placeholder Bento Grid for Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="text-gray-500 text-sm mb-2">Connected Banks</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          <div className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="text-gray-500 text-sm mb-2">Pending Invoices</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          <div className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="text-gray-500 text-sm mb-2">Automated Matches</div>
            <div className="text-3xl font-bold">0%</div>
          </div>
        </div>
      </main>
    </div>
  );
}
