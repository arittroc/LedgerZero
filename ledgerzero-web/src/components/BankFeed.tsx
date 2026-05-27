"use client";

import { useState, useTransition, useRef } from "react";
import { Activity, Upload, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { uploadBankStatement } from "@/app/actions/bank";
import { autoReconcile } from "@/app/actions/reconcile";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface BankFeedProps {
  initialTransactions: BankTransaction[];
}

export default function BankFeed({ initialTransactions }: BankFeedProps) {
  const [isUploading, startUpload] = useTransition();
  const [isReconciling, startReconcile] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startUpload(async () => {
      const result = await uploadBankStatement(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `Successfully uploaded ${result.count} transactions.` });
      }
    });
  }

  async function handleAutoReconcile() {
    startReconcile(async () => {
      const result = await autoReconcile();
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: result.message || "Reconciliation complete." });
      }
    });
  }

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-[32px] p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Activity className="size-5 text-gray-400" />
          <h3 className="text-lg font-semibold">Live Bank Feed</h3>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="Upload Bank Statement"
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv"
          className="hidden"
        />
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-xl text-xs font-medium border ${
          message.type === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px] mb-8 pr-2 custom-scrollbar">
        {initialTransactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-40">
            <Activity className="size-8 mb-3 text-gray-600" />
            <p className="text-sm font-medium">No pending transactions</p>
            <p className="text-xs text-gray-500 mt-1">Upload a bank statement to start.</p>
          </div>
        ) : (
          initialTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-white line-clamp-1">{tx.description}</p>
                <p className="text-xs text-gray-500">{tx.date}</p>
              </div>
              <p className="text-sm font-bold text-green-400">
                +${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleAutoReconcile}
        disabled={isReconciling || initialTransactions.length === 0}
        className="w-full h-12 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none group"
      >
        {isReconciling ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="size-4 group-hover:animate-pulse" />
            Run Auto-Reconcile
          </>
        )}
      </button>
    </div>
  );
}
