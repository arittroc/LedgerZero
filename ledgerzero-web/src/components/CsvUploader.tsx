"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { Upload, Loader2, CheckCircle2, X } from "lucide-react";

interface CsvUploaderProps {
  onUploadSuccess: () => void;
}

export function CsvUploader({ onUploadSuccess }: CsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setError(null);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const transactions = (results.data as any[]).map((row: any) => ({
              date: row.Date || row.date,
              description: row.Description || row.description,
              amount: row.Amount || row.amount,
            }));

            // Basic validation
            const validTransactions = transactions.filter(
              (t) => t.date && t.description && t.amount,
            );

            if (validTransactions.length === 0) {
              throw new Error(
                "No valid transactions found in CSV. Ensure columns are: Date, Description, Amount",
              );
            }

            const response = await fetch("/api/transactions/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(validTransactions),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                errorData.error || "Failed to upload transactions",
              );
            }

            setShowSuccess(true);
            onUploadSuccess();
            setTimeout(() => setShowSuccess(false), 3000);
          } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
          } finally {
            setIsUploading(false);
          }
        },
        error: (err) => {
          setError(err.message);
          setIsUploading(false);
        },
      });
    },
    [onUploadSuccess],
  );

  return (
    <div className="relative group w-full mb-8">
      <label
        className={`
        flex flex-col items-center justify-center w-full h-32 
        px-4 transition-all duration-300 border-2 border-dashed rounded-2xl cursor-pointer
        backdrop-blur-xl bg-white/5 
        ${
          error
            ? "border-danger/50 hover:bg-danger/5"
            : "border-white/10 hover:bg-white/10 hover:border-white/20"
        }
      `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <Loader2 className="w-8 h-8 mb-3 text-accent animate-spin" />
          ) : showSuccess ? (
            <CheckCircle2 className="w-8 h-8 mb-3 text-success animate-bounce" />
          ) : (
            <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-white transition-colors" />
          )}
          <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold text-white">Upload Bank CSV</span> or
            drag and drop
          </p>
          <p className="text-xs text-gray-500">
            Required columns: Date, Description, Amount
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={onFileChange}
          disabled={isUploading}
        />
      </label>

      {error && (
        <div className="absolute -bottom-14 left-0 right-0 flex items-center justify-between gap-2 p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl animate-in slide-in-from-top-2 z-10">
          <div className="flex items-center gap-2">
            <X
              className="w-4 h-4 cursor-pointer"
              onClick={() => setError(null)}
            />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
