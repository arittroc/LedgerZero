"use client";

import { useState, useCallback } from "react";
import { Scanner, Upload, Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface SmartScanDropzoneProps {
  onExtractionComplete: (data: any) => void;
}

export function SmartScanDropzone({ onExtractionComplete }: SmartScanDropzoneProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleExtract = async (file: File) => {
    setIsExtracting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/invoices/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Extraction failed");
      }

      const data = await response.json();
      onExtractionComplete(data);
    } catch (err: any) {
      console.error("Extraction error:", err);
      setError(err.message || "Failed to extract invoice data.");
    } finally {
      setIsExtracting(false);
    }
  };

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleExtract(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.dataTransfer?.files[0]) {
      handleExtract(e.target.files[0]);
    } else if (e.target.files && e.target.files[0]) {
      handleExtract(e.target.files[0]);
    }
  };

  return (
    <div className="relative group w-full mb-6">
      <label
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-36 
          px-4 transition-all duration-500 border-2 border-dashed rounded-[28px] cursor-pointer
          overflow-hidden backdrop-blur-xl bg-white/[0.02]
          ${dragActive ? "border-accent/50 bg-accent/5 scale-[1.02]" : "border-white/10 hover:border-white/20 hover:bg-white/5"}
          ${error ? "border-danger/40 bg-danger/5" : ""}
        `}
      >
        {isExtracting ? (
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <div className="relative mb-3">
               <div className="absolute inset-0 bg-accent/20 blur-xl animate-pulse rounded-full" />
               <Loader2 className="w-10 h-10 text-accent animate-spin relative z-10" />
            </div>
            <p className="text-sm font-bold text-white tracking-tight">Extracting invoice data...</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Gemini AI is processing</p>
            
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
              <Upload className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
              Smart Scan Invoice
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Drag & drop a bill, receipt, or PDF
            </p>
          </div>
        )}

        <input
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          disabled={isExtracting}
        />
      </label>

      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-[12px] font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="size-4 shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-gray-400 hover:text-white">
            <X className="size-3" />
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
