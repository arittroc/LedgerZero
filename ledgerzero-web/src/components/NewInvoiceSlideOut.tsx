"use client";

import { useState, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar, User, DollarSign, UploadCloud } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createInvoice } from "@/app/actions/invoice";

function SlideOutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("action") === "new-invoice";

  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleFile = (file: File) => {
    if (file.type === "text/csv" || file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          // Handle both Windows (\r\n) and Mac/Linux (\n) line endings
          const lines = text.split(/\r?\n/).filter(line => line.trim());
          
          if (lines.length > 1) {
            // Clean and lowercase headers for matching
            const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/['"]/g, ''));
            // Grab the first row of actual data
            const values = lines[1].split(',').map(v => v.trim().replace(/['"]/g, ''));

            // Smart mapping: Hunt for keywords in headers
            let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('client') || h.includes('customer') || h.includes('description'));
            let amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('total') || h.includes('price') || h.includes('credit'));
            let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('due'));

            // Fallback: If keywords aren't found, default to first 3 columns
            if (nameIdx === -1) nameIdx = 0;
            if (amountIdx === -1) amountIdx = 1;
            if (dateIdx === -1) dateIdx = 2;

            // Safely set the state if the column exists in the data row
            if (values[nameIdx]) setClientName(values[nameIdx]);
            if (values[amountIdx]) {
              // Strip out any currency symbols or commas for the number input
              const cleanAmount = values[amountIdx].replace(/[^0-9.-]+/g, "");
              setAmount(cleanAmount);
            }
            if (values[dateIdx]) {
              let parsedDate = values[dateIdx];
              // Convert DD-MM-YYYY or DD/MM/YYYY to YYYY-MM-DD
              const dateMatch = parsedDate.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
              if (dateMatch) {
                parsedDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
              }
              setDueDate(parsedDate);
            }
          } else {
             setError("CSV appears to be empty or missing data rows.");
          }
        } catch (err) {
          setError("Failed to parse CSV format.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Please upload a valid .csv file.");
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
                  disabled={isSubmitting}
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
                  <span className="flex-shrink-0 mx-4 text-xs text-gray-500 uppercase tracking-widest font-medium">Or Auto-Fill</span>
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
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                    isDragging 
                      ? "border-orange-500 bg-orange-500/10 scale-[1.02]" 
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                  <UploadCloud className={`size-8 mb-3 transition-colors ${isDragging ? "text-orange-500" : "text-gray-400"}`} />
                  <p className="text-sm font-medium text-white text-center">
                    {selectedFile ? <span className="text-orange-400">{selectedFile.name}</span> : "Click or drag CSV to upload"}
                  </p>
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
