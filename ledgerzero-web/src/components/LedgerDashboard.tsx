"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { CheckCircle2, Loader2, MessageSquare, X, ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LeftColumn } from "@/components/LeftColumn";
import { MatchBridge, type BridgeRow } from "@/components/MatchBridge";
import { RightColumn } from "@/components/RightColumn";
import { CsvUploader } from "@/components/CsvUploader";
import { CookieConsent } from "@/components/CookieConsent";
import { ReconciliationModal } from "@/components/ReconciliationModal";
import Link from "next/link";
import {
  type BankFeedItem,
  type Invoice,
  reconcileLedger,
} from "@/utils/reconcileLedger";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/supabase-auth";

import { RevenueAnalytics } from "@/components/RevenueAnalytics";
import { SmartScanDropzone } from "@/components/SmartScanDropzone";
import { SmartInvoiceModal } from "@/components/SmartInvoiceModal";
import { AutoMatchModal } from "@/components/AutoMatchModal";

export function LedgerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bankFeed, setBankFeed] = useState<BankFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Smart Scan state
  const [extractedInvoice, setExtractedInvoice] = useState<any>(null);
  const [showSmartModal, setShowSmartModal] = useState(false);

  // Auto-Match state
  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([]);
  const [showAutoMatchModal, setShowAutoMatchModal] = useState(false);
  const [isRunningAutoMatch, setIsRunningAutoMatch] = useState(false);

  // Manual Reconciliation state
  const [reconcilingTransaction, setReconcilingTransaction] =
    useState<BankFeedItem | null>(null);

  // Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("BUG");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleExtractionComplete = (data: any) => {
    setExtractedInvoice(data);
    setShowSmartModal(true);
  };

  const handleRunAutoMatch = async () => {
    setIsRunningAutoMatch(true);
    try {
      const response = await fetch("/api/reconcile/auto", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Auto-match failed");
      const data = await response.json();
      setSuggestedMatches(data.suggestions);
      setShowAutoMatchModal(true);
    } catch (error) {
      console.error("Auto-match error:", error);
    } finally {
      setIsRunningAutoMatch(false);
    }
  };

  const fetchLedgerData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/ledger", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch ledger data");
      const data = await response.json();
      setInvoices(data.invoices);
      setBankFeed(data.transactions);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error fetching ledger:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    fetchLedgerData();

    // Listen for auth changes
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') fetchLedgerData();
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setInvoices([]);
        setBankFeed([]);
      }
    });

    // Real-time Subscriptions
    const invoicesChannel = supabase
      .channel('realtime:invoices')
      .on('postgres_changes', { event: '*', table: 'invoices', schema: 'public' }, () => {
        fetchLedgerData();
      })
      .subscribe();

    const transactionsChannel = supabase
      .channel('realtime:transactions')
      .on('postgres_changes', { event: '*', table: 'bank_transactions', schema: 'public' }, () => {
        fetchLedgerData();
      })
      .subscribe();

    return () => {
      authListener.unsubscribe();
      supabase.removeChannel(invoicesChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [fetchLedgerData, supabase]);

  const handleLogout = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) throw error;

      setIsAuthenticated(false);
      setInvoices([]);
      setBankFeed([]);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const reconciliation = useMemo(
    () => reconcileLedger(invoices, bankFeed),
    [invoices, bankFeed],
  );

  useEffect(() => {
    if (reconciliation.matchedPairs.length > 0 && !selectedMatch) {
      setSelectedMatch(reconciliation.matchedPairs[0].id);
    }
  }, [reconciliation, selectedMatch]);

  const totalUnreconciled = useMemo(
    () =>
      reconciliation.unmatchedInvoices.reduce(
        (sum, invoice) => sum + invoice.amount,
        0,
      ),
    [reconciliation],
  );

  const bridgeRows = useMemo((): BridgeRow[] => {
    return invoices.map((invoice) => {
      const match = reconciliation.matchedPairs.find(
        (p) => p.invoice.id === invoice.id,
      );
      return {
        id: match ? match.id : `empty-${invoice.id}`,
        type: match ? "matched" : "empty",
      };
    });
  }, [invoices, reconciliation.matchedPairs]);

  const handleApproveAll = async () => {
    if (reconciliation.matchedPairs.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setToastMessage("");

    try {
      const response = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          matches: reconciliation.matchedPairs.map((p) => ({
            invoiceId: p.invoice.id,
            transactionId: p.bankItem.id,
          })),
        }),
      });

      if (!response.ok) throw new Error("Reconciliation failed");

      setIsApproved(true);
      setShowToast(true);

      const matchIds = reconciliation.matchedPairs.map((p) => p.id);
      let currentIndex = 0;
      const cycleInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % matchIds.length;
        setSelectedMatch(matchIds[currentIndex]);
      }, 800);

      setTimeout(async () => {
        clearInterval(cycleInterval);
        await fetchLedgerData();
        setIsApproved(false);
        setIsSubmitting(false);
        setShowToast(false);
      }, 4000);
    } catch (error) {
      console.error("Failed to approve matches:", error);
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage || isSubmittingFeedback) return;

    setIsSubmittingFeedback(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: feedbackMessage, type: feedbackType }),
      });

      if (response.ok) {
        setFeedbackMessage("");
        setShowFeedbackModal(false);
        // Could show a success toast here too
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell min-h-screen p-8">
        <div className="mx-auto max-w-[1240px] space-y-12">
          {/* Header Skeleton */}
          <div className="h-16 w-full rounded-[28px] bg-white/5 animate-pulse border border-white/5" />
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-[minmax(0,1fr)_70px_minmax(0,1fr)] gap-[18px]">
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 w-full rounded-[22px] bg-white/[0.03] animate-pulse border border-white/5" />
              ))}
            </div>
            <div className="flex flex-col items-center py-8 space-y-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 w-0.5 bg-white/5 animate-pulse" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 w-full rounded-[22px] bg-white/[0.03] animate-pulse border border-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="app-shell min-h-screen">
      <DashboardHeader
        totalUnreconciled={totalUnreconciled}
        onApprove={handleApproveAll}
        isApproved={isApproved || isSubmitting}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
      />

      <h1 className="sr-only">LedgerZero invoice reconciliation dashboard</h1>

      {!isAuthenticated && (
        <div className="relative mx-auto mt-12 max-w-[1240px] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-16 text-center backdrop-blur-2xl shadow-2xl">
          {/* Liquid glass glows */}
          <div className="absolute -top-40 -left-40 size-96 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-blue-600/5 blur-[120px]" />
          
          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-bold text-white tracking-tight">
              Ready to Reconcile?
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-gray-400 text-lg leading-relaxed">
              Experience the future of zero-effort accounting. Log in to securely connect your bank data and automate your reconciliation workflow.
            </p>
            <div className="flex justify-center">
              <Link
                href="/login"
                className="group relative flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-white px-12 font-bold text-black shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100 active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center gap-2">
                  Get Started <ArrowRight className="size-5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && <RevenueAnalytics invoices={invoices} />}

      <section
        className={`relative mx-auto mt-[54px] grid max-w-[1240px] grid-cols-[minmax(0,1fr)_70px_minmax(0,1fr)] items-start gap-[18px] transition-opacity duration-500 ${isAuthenticated ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        aria-label="Invoice reconciliation workspace"
      >
        <div className="flex flex-col gap-4">
          {isAuthenticated && <SmartScanDropzone onExtractionComplete={handleExtractionComplete} />}
          <LeftColumn
            invoices={invoices}
            activeMatchId={selectedMatch}
            isApproved={isApproved}
            onSelectMatch={setSelectedMatch}
            reconciliation={reconciliation}
          />
        </div>

        <MatchBridge
          rows={bridgeRows}
          selectedMatchId={selectedMatch}
          isApproved={isApproved}
        />

        <div className="flex flex-col gap-4">
          {isAuthenticated && (
            <div className="flex flex-col gap-4 mb-4">
              <CsvUploader onUploadSuccess={fetchLedgerData} />
              <button
                onClick={handleRunAutoMatch}
                disabled={isRunningAutoMatch}
                className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-6 font-bold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center gap-2">
                  {isRunningAutoMatch ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="size-5 text-accent" />
                      Run Auto-Match
                    </>
                  )}
                </span>
              </button>
            </div>
          )}
          <RightColumn
            bankFeed={bankFeed}
            activeMatchId={selectedMatch}
            isApproved={isApproved}
            onSelectMatch={setSelectedMatch}
            onOpenReconcile={setReconcilingTransaction}
            reconciliation={reconciliation}
          />
        </div>
      </section>

      {/* Auto-Match Modal */}
      {showAutoMatchModal && (
        <AutoMatchModal
          suggestions={suggestedMatches}
          onClose={() => setShowAutoMatchModal(false)}
          onSuccess={() => {
            setShowAutoMatchModal(false);
            setToastMessage(`${suggestedMatches.length} matches approved via Auto-Match!`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }}
        />
      )}

      {/* Smart Scan Review Modal */}
      {extractedInvoice && (
        <SmartInvoiceModal
          isOpen={showSmartModal}
          data={extractedInvoice}
          onClose={() => setShowSmartModal(false)}
          onSuccess={() => {
            setShowSmartModal(false);
            setToastMessage("Invoice scanned & saved successfully!");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }}
        />
      )}

      {/* Manual Reconciliation Modal */}
      {reconcilingTransaction && (
        <ReconciliationModal
          transaction={reconcilingTransaction}
          unpaidInvoices={reconciliation.unmatchedInvoices}
          onClose={() => setReconcilingTransaction(null)}
          onSuccess={async () => {
            setReconcilingTransaction(null);
            setToastMessage("Reconciliation successful!");
            setShowToast(true);
            await fetchLedgerData();
            setTimeout(() => setShowToast(false), 3000);
          }}
        />
      )}

      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowFeedbackModal(true)}
        className="fixed right-8 bottom-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-white/20 active:scale-95 group"
        aria-label="Report a bug"
      >
        <MessageSquare className="size-6 text-white group-hover:text-accent transition-colors" />
      </button>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#121212]/90 backdrop-blur-2xl p-8 shadow-2xl">
              {/* Subtle background glow */}
              <div className="absolute -top-24 -right-24 h-48 w-48 bg-accent/10 blur-[80px]" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white tracking-tight">
                    Report an issue
                  </h2>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="p-1 rounded-lg hover:bg-white/5 text-gray-400 transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitFeedback}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Issue type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["BUG", "FEATURE"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFeedbackType(t)}
                          className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                            feedbackType === t
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-transparent border-white/5 text-gray-500 hover:border-white/10"
                          }`}
                        >
                          {t.charAt(0) + t.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Message
                    </label>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Describe what happened..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!feedbackMessage || isSubmittingFeedback}
                    className="w-full py-4 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingFeedback ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`fixed left-1/2 bottom-8 z-30 flex min-h-[44px] max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-[9px] rounded-full border border-white/54 bg-white/72 px-4 py-0 text-[14px] font-[680] text-fg shadow-[0_20px_56px_oklch(18%_0.012_250_/_0.14)] backdrop-blur-[20px] transition-all duration-[300ms] pointer-events-none whitespace-nowrap ${
          showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="size-[15px] text-success" />
        {toastMessage ||
          `${reconciliation.matchedPairs.length} matches approved.`}
      </div>

      <CookieConsent />
    </main>
  );
}
