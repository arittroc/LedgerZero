"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { type BankFeedItem, type Invoice } from "@/utils/reconcileLedger";
import { formatCurrency } from "@/utils/format";

interface ReconciliationModalProps {
  transaction: BankFeedItem;
  unpaidInvoices: Invoice[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ReconciliationModal({
  transaction,
  unpaidInvoices,
  onClose,
  onSuccess,
}: ReconciliationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  const handleReconcile = async () => {
    if (!selectedInvoiceId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          transactionId: transaction.id,
          invoiceId: selectedInvoiceId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reconcile");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#121212]/90 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 h-64 w-64 bg-accent/10 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-success/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col h-[80vh] max-h-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 p-6">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Reconcile Transaction
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Select an invoice to match with this bank record
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Transaction Info */}
          <div className="bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Bank Transaction
                </p>
                <h3 className="text-white font-medium">
                  {transaction.description}
                </h3>
                <p className="text-sm text-gray-400">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Available Invoices
            </p>
            {unpaidInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500 italic">
                No unpaid invoices found.
              </div>
            ) : (
              unpaidInvoices.map((invoice) => {
                const isExactMatch = invoice.amount === transaction.amount;
                const isSelected = selectedInvoiceId === invoice.id;

                return (
                  <button
                    key={invoice.id}
                    onClick={() => setSelectedInvoiceId(invoice.id)}
                    className={`w-full group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? "bg-accent/10 border-accent/40 shadow-lg"
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-accent text-white"
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="size-5" />
                        ) : (
                          <div className="size-2 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-medium transition-colors ${isSelected ? "text-white" : "text-gray-300 group-hover:text-white"}`}
                          >
                            {invoice.clientName}
                          </p>
                          {isExactMatch && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-bold uppercase tracking-wider">
                              <Sparkles className="size-3" />
                              Suggested Match
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Invoice #{invoice.id.slice(-6).toUpperCase()} •{" "}
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold transition-colors ${isSelected ? "text-white" : "text-gray-300 group-hover:text-white"}`}
                      >
                        {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 p-6 bg-black/20">
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                <AlertCircle className="size-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <button
              onClick={handleReconcile}
              disabled={!selectedInvoiceId || isSubmitting}
              className="w-full py-4 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl"
            >
              {isSubmitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Confirm Reconciliation"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
