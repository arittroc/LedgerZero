"use client";

import { useState } from "react";
import { X, Sparkles, ArrowRight, CheckCircle2, Loader2, Info } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/format";

interface AutoMatchSuggestion {
  invoice: {
    id: string;
    clientName: string;
    amount: number;
    date: string;
  };
  transaction: {
    id: string;
    description: string;
    amount: number;
    date: string;
  };
  confidence: string;
  reason: string;
}

interface AutoMatchModalProps {
  suggestions: AutoMatchSuggestion[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AutoMatchModal({ suggestions, onClose, onSuccess }: AutoMatchModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmAll = async () => {
    if (suggestions.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          matches: suggestions.map((s) => ({
            invoiceId: s.invoice.id,
            transactionId: s.transaction.id,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reconcile matches");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic ambient glows */}
        <div className="absolute -top-40 -left-40 h-[400px] w-[400px] bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] bg-success/10 blur-[120px] rounded-full" />

        <div className="relative z-10 flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                <Sparkles className="size-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Auto-Match Suggestions
                </h2>
                <p className="text-gray-400 text-sm font-medium">
                  We found {suggestions.length} potential matches between your bank feed and invoices.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl hover:bg-white/5 text-gray-500 hover:text-white transition-all duration-300"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
            {suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                   <Info className="size-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
                <p className="text-gray-500 max-w-sm">
                  Try uploading a fresh CSV or matching items manually to help the engine learn your patterns.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion, idx) => (
                  <div 
                    key={suggestion.invoice.id} 
                    className="group relative flex items-center gap-6 p-6 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 animate-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Bank Transaction */}
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Bank Transaction</p>
                      <h4 className="text-white font-bold leading-tight mb-1 truncate">
                        {suggestion.transaction.description}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium">{formatDate(suggestion.transaction.date)}</span>
                        <span className="text-lg font-black text-white">{formatCurrency(suggestion.transaction.amount)}</span>
                      </div>
                    </div>

                    {/* Bridge */}
                    <div className="flex flex-col items-center gap-1 text-accent">
                      <ArrowRight className="size-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[10px] font-bold tracking-tighter opacity-40 uppercase">Match</span>
                    </div>

                    {/* Invoice */}
                    <div className="flex-1 text-right">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Invoice</p>
                      <h4 className="text-white font-bold leading-tight mb-1 truncate">
                        {suggestion.invoice.clientName}
                      </h4>
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-lg font-black text-white">{formatCurrency(suggestion.invoice.amount)}</span>
                        <span className="text-xs text-gray-500 font-medium">#{suggestion.invoice.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 bg-white/[0.02] border-t border-white/5">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
                <Info className="size-5 shrink-0" />
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between gap-6">
              <button
                onClick={onClose}
                className="h-16 px-8 rounded-2xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 hover:text-white transition-all"
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirmAll}
                disabled={suggestions.length === 0 || isSubmitting}
                className="flex-1 h-16 group relative overflow-hidden rounded-[24px] bg-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center gap-3 font-black text-black text-lg tracking-tight">
                  {isSubmitting ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="size-6" />
                      Confirm & Reconcile {suggestions.length} Matches
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
