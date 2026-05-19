"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LeftColumn } from "@/components/LeftColumn";
import { MatchBridge, type BridgeRow } from "@/components/MatchBridge";
import { RightColumn } from "@/components/RightColumn";
import {
  type BankFeedItem,
  type Invoice,
  reconcileLedger,
} from "@/utils/reconcileLedger";

export function LedgerDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bankFeed, setBankFeed] = useState<BankFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fetchLedgerData = useCallback(async () => {
    try {
      const response = await fetch("/api/ledger");
      if (!response.ok) throw new Error("Failed to fetch ledger data");
      const data = await response.json();
      
      // Transform Prisma dates (ISO strings) to match UI expectations if needed
      // For now, assume the UI can handle the string format or that we keep it simple
      setInvoices(data.invoices);
      setBankFeed(data.transactions);
    } catch (error) {
      console.error("Error fetching ledger:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  const reconciliation = useMemo(
    () => reconcileLedger(invoices, bankFeed),
    [invoices, bankFeed]
  );

  // Set initial selected match if available
  useEffect(() => {
    if (reconciliation.matchedPairs.length > 0 && !selectedMatch) {
      setSelectedMatch(reconciliation.matchedPairs[0].id);
    }
  }, [reconciliation, selectedMatch]);

  const totalUnreconciled = useMemo(
    () =>
      reconciliation.unmatchedInvoices.reduce(
        (sum, invoice) => sum + invoice.amount,
        0
      ),
    [reconciliation]
  );

  const bridgeRows = useMemo((): BridgeRow[] => {
    return invoices.map((invoice) => {
      const match = reconciliation.matchedPairs.find(
        (p) => p.invoice.id === invoice.id
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
    
    try {
      const response = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matches: reconciliation.matchedPairs.map(p => ({
            invoiceId: p.invoice.id,
            transactionId: p.bankItem.id
          }))
        })
      });

      if (!response.ok) throw new Error("Reconciliation failed");

      // Visual feedback
      setIsApproved(true);
      setShowToast(true);
      
      // Cycle matches for visual feedback like prototype
      const matchIds = reconciliation.matchedPairs.map(p => p.id);
      let currentIndex = 0;
      const cycleInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % matchIds.length;
        setSelectedMatch(matchIds[currentIndex]);
      }, 800);

      // Refresh data and reset state after animation
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
      />

      <h1 className="sr-only">LedgerZero invoice reconciliation dashboard</h1>

      <section
        className="relative mx-auto mt-[54px] grid max-w-[1240px] grid-cols-[minmax(0,1fr)_70px_minmax(0,1fr)] items-start gap-[18px]"
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

        <RightColumn
          bankFeed={bankFeed}
          activeMatchId={selectedMatch}
          isApproved={isApproved}
          onSelectMatch={setSelectedMatch}
          reconciliation={reconciliation}
        />
      </section>

      {/* Toast Notification */}
      <div
        className={`fixed left-1/2 bottom-8 z-30 flex min-h-[44px] max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-[9px] rounded-full border border-white/54 bg-white/72 px-4 py-0 text-[14px] font-[680] text-fg shadow-[0_20px_56px_oklch(18%_0.012_250_/_0.14)] backdrop-blur-[20px] transition-all duration-[300ms] pointer-events-none whitespace-nowrap ${
          showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="size-[15px] text-success" />
        {reconciliation.matchedPairs.length} matches approved.
      </div>
    </main>
  );
}
