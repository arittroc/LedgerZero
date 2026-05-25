"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Calendar, User, DollarSign } from "lucide-react";
import { createInvoice } from "@/app/actions/invoice";
import { motion, AnimatePresence } from "framer-motion";

interface NewInvoiceSlideOutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewInvoiceSlideOut({ isOpen, onClose }: NewInvoiceSlideOutProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(formData: FormData) {
    console.log("[NewInvoiceSlideOut] Submitting form...");
    setIsSubmitting(true);
    setError(null);
    try {
      await createInvoice(formData);
      console.log("[NewInvoiceSlideOut] Success, closing...");
      onClose();
    } catch (err: any) {
      console.error("[NewInvoiceSlideOut] Error:", err);
      setError(err.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
          {/* Backdrop - captures clicks to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Slide-out Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-[110] w-full max-w-md bg-[#0a0a0a]/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl p-8 flex flex-col pointer-events-auto h-full"
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-white">New Invoice</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            <form action={handleSubmit} className="space-y-8 flex-1">
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <User className="size-4" /> Client Name
                  </label>
                  <input
                    name="clientName"
                    required
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <DollarSign className="size-4" /> Total Amount
                  </label>
                  <div className="relative">
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Calendar className="size-4" /> Due Date
                  </label>
                  <input
                    name="dueDate"
                    type="date"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    "Create Invoice"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-auto pt-8 border-t border-white/5 text-center text-xs text-gray-600">
              Invoices are automatically set to 'pending' status.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
