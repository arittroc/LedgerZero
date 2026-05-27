"use client";

import { useState, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar, User, DollarSign, UploadCloud, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createInvoice, processSmartInvoice } from "@/app/actions/invoice";

function SlideOutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("action") === "new-invoice";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag and Drop & Auto-fill State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleClose = () => {
    // Reset state on close
    setClientName("");
    setAmount("");
    setDueDate("");
    setSelectedFile(null);
    setError(null);
    setIsAnalyzing(false);
    router.push("/dashboard", { scroll: false });
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createInvoice(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        handleClose();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await processSmartInvoice(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setClientName(result.data.clientName);
        setAmount(result.data.amount.toString());
        setDueDate(result.data.dueDate);
      }
    } catch (err) {
      setError("AI extraction failed. Please enter details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0a0a0a]/95 backdrop-blur-3xl border-l border-white/10 z-[100] p-8 flex flex-col shadow-2xl h-full overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-white">New Invoice</h2>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
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
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
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
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
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
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isAnalyzing}
                  className="w-full h-14 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    "Create Invoice"
                  )}
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-xs text-gray-500 uppercase tracking-widest font-medium">Or Smart Scan</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-200 ${
                    isAnalyzing ? "cursor-wait border-orange-500/50 bg-orange-500/5" : "cursor-pointer border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  } ${
                    isDragging 
                      ? "border-orange-500 bg-orange-500/10 scale-[1.02]" 
                      : ""
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf,text/csv,text/plain"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                  {isAnalyzing ? (
                    <>
                      <div className="relative mb-3">
                        <Sparkles className="size-8 text-orange-500 animate-pulse" />
                        <Loader2 className="size-10 text-orange-500/20 animate-spin absolute -inset-1" />
                      </div>
                      <p className="text-sm font-medium text-orange-400 text-center animate-pulse">
                        ✨ AI is analyzing your document...
                      </p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className={`size-8 mb-3 transition-colors ${isDragging ? "text-orange-500" : "text-gray-400"}`} />
                      <p className="text-sm font-medium text-white text-center">
                        {selectedFile ? <span className="text-orange-400">{selectedFile.name}</span> : "Drop image, PDF, or CSV"}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">Powered by Gemini AI</p>
                    </>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function NewInvoiceSlideOut() {
  return (
    <Suspense fallback={null}>
      <SlideOutContent />
    </Suspense>
  );
}
