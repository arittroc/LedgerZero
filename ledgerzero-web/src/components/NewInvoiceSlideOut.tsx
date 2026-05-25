"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar, User, DollarSign, UploadCloud, FileSpreadsheet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createInvoice } from "@/app/actions/invoice";
import Papa from "papaparse";

function SlideOutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("action") === "new-invoice";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Controlled form state for auto-fill
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleClose = () => {
    router.push("/dashboard", { scroll: false });
    // Reset state on close
    setClientName("");
    setAmount("");
    setDueDate("");
    setSelectedFile(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }

    setSelectedFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data[0] as any;
        if (data) {
          // Attempt to map common CSV headers to our fields
          setClientName(data.client || data.name || data.customer || "");
          setAmount(data.amount || data.total || data.price || "");
          setDueDate(data.due_date || data.date || data.deadline || "");
        }
      },
      error: (err) => {
        console.error("CSV Parsing Error:", err);
        setError("Failed to parse CSV file.");
      }
    });
  };

  async function handleSubmit(formData: FormData) {
    console.log("[NewInvoiceSlideOut] Submitting form...");
    setIsSubmitting(true);
    setError(null);
    try {
      await createInvoice(formData);
      console.log("[NewInvoiceSlideOut] Success, closing...");
      handleClose();
    } catch (err: any) {
      console.error("[NewInvoiceSlideOut] Error:", err);
      setError(err.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  }

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

            <div className="flex-1 space-y-8">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative group cursor-pointer border-2 border-dashed rounded-[32px] p-8 transition-all duration-300
                  ${isDragging ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"}
                  ${selectedFile ? "border-green-500/50 bg-green-500/5" : ""}
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <div className="flex flex-col items-center text-center gap-4">
                  <div className={`
                    size-16 rounded-full flex items-center justify-center transition-transform duration-300
                    ${isDragging ? "scale-110 bg-orange-500/20" : "bg-white/5 group-hover:scale-105"}
                    ${selectedFile ? "bg-green-500/20" : ""}
                  `}>
                    {selectedFile ? (
                      <FileSpreadsheet className="size-8 text-green-400" />
                    ) : (
                      <UploadCloud className={`size-8 ${isDragging ? "text-orange-500" : "text-gray-400"}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {selectedFile ? selectedFile.name : "Import via CSV"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedFile ? "File parsed successfully" : "Drag and drop or click to upload"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-gray-600 uppercase tracking-widest font-medium italic">Or manual entry</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <form action={handleSubmit} className="space-y-8">
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

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        Create Invoice
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <User className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-auto pt-8 border-t border-white/5 text-center text-xs text-gray-600">
              Invoices are automatically set to 'pending' status.
            </div>
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
