"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { CheckCircle2, Loader2, MessageSquare, X } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LeftColumn } from "@/components/LeftColumn";
import { MatchBridge, type BridgeRow } from "@/components/MatchBridge";
import { RightColumn } from "@/components/RightColumn";
import { CsvUploader } from "@/components/CsvUploader";
import { CookieConsent } from "@/components/CookieConsent";
import { ReconciliationModal } from "@/components/ReconciliationModal";
import {
  type BankFeedItem,
  type Invoice,
  reconcileLedger,
} from "@/utils/reconcileLedger";

export function LedgerDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bankFeed, setBankFeed] = useState<BankFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Manual Reconciliation state
  const [reconcilingTransaction, setReconcilingTransaction] = useState<BankFeedItem | null>(null);

  // Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("BUG");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const fetchLedgerData = useCallback(async () => {
    try {
      const response = await fetch("/api/ledger", {
        credentials: "include",
      });
      if (response.status === 401) {
        setIsAuthenticated(false);
        setInvoices([]);
        setBankFeed([]);
        return;
      }
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
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuthenticated(false);
      setInvoices([]);
      setBankFeed([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

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
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <Loader2 className="size-8 animate-spin text-accent" />
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
        <div className="mx-auto mt-12 max-w-[1240px] rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Ready to Reconcile?
          </h2>
          <p className="mb-8 text-gray-400">
            Log in or create an account to upload your bank transactions and
            start matching invoices.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/login"
              className="rounded-2xl bg-white px-8 py-4 font-semibold text-black hover:bg-gray-200 transition-colors"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Sign Up
            </a>
          </div>
        </div>
      )}

      <section
        className={`relative mx-auto mt-[54px] grid max-w-[1240px] grid-cols-[minmax(0,1fr)_70px_minmax(0,1fr)] items-start gap-[18px] transition-opacity duration-500 ${isAuthenticated ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        aria-label="Invoice reconciliation workspace"
      >
        <LeftColumn
          invoices={invoices}
          activeMatchId={selectedMatch}
          isApproved={isApproved}
          onSelectMatch={setSelectedMatch}
          reconciliation={reconciliation}
        />

        <MatchBridge
          rows={bridgeRows}
          selectedMatchId={selectedMatch}
          isApproved={isApproved}
        />

        <div className="flex flex-col">
          {isAuthenticated && (
            <CsvUploader onUploadSuccess={fetchLedgerData} />
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
        {toastMessage || `${reconciliation.matchedPairs.length} matches approved.`}
      </div>

      <CookieConsent />
    </main>
  );
}
