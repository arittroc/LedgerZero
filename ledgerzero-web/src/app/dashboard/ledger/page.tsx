import { redirect } from "next/navigation";
import { LogOut, ArrowLeft, History, FileText, CheckCircle2, Wallet, Download } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function LedgerPage() {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Reconciliation History
  const history = await prisma.reconciliation.findMany({
    where: {
      userId: user.id,
    },
    include: {
      invoice: true,
      transaction: true,
    },
    orderBy: {
      reconciledAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-orange-500/30">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
                <Wallet className="size-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">LedgerZero</h1>
            </div>

            <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Link
                href="/dashboard"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <div className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white">
                Ledger History
              </div>
            </nav>
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

        {/* Back Link for Mobile */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 md:hidden">
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <History className="size-6 text-orange-500" />
              <h2 className="text-4xl font-bold tracking-tighter">Reconciliation Ledger</h2>
            </div>
            <p className="text-gray-500 max-w-lg">
              A complete audit trail of all automated matches between your bank deposits and sent invoices.
            </p>
          </div>

          {history && history.length > 0 && (
            <a
              href="/api/export/ledger"
              download
              className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-semibold text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <Download className="size-4" />
              Export to CSV
            </a>
          )}
        </div>

        {/* Ledger Table Section */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-[32px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {!history || history.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <History className="size-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No reconciled records yet</h3>
              <p className="text-gray-500 text-sm max-w-[300px]">
                Once you run the auto-reconcile engine, matched transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-5 text-xs font-semibold tracking-widest text-gray-500 uppercase">Match Date</th>
                    <th className="px-8 py-5 text-xs font-semibold tracking-widest text-gray-500 uppercase">Client / Invoice</th>
                    <th className="px-8 py-5 text-xs font-semibold tracking-widest text-gray-500 uppercase">Bank Description</th>
                    <th className="px-8 py-5 text-xs font-semibold tracking-widest text-gray-500 uppercase text-right">Matched Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((record) => (
                    <tr key={record.id} className="group hover:bg-white/[0.03] transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-white">
                          {new Date(record.reconciledAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">
                          {new Date(record.reconciledAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <FileText className="size-4 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {record.invoice.clientName || "Unknown Client"}
                            </p>
                            <p className="text-xs text-gray-500">
                              #{record.invoice.id.split("-")[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-gray-300 line-clamp-1 max-w-xs">
                            {record.transaction.description}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                            <CheckCircle2 className="size-3" />
                            Verified Deposit
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-lg font-bold tracking-tight text-white">
                          ${record.invoice.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
