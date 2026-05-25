"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewInvoiceSlideOut } from "@/components/NewInvoiceSlideOut";

export function DashboardClientWrapper() {
  const [isSlideOutOpen, setIsSlideOutOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsSlideOutOpen(true)}
        className="h-12 px-6 rounded-full bg-white text-black font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="size-4" />
        New Invoice
      </button>

      <NewInvoiceSlideOut
        isOpen={isSlideOutOpen}
        onClose={() => setIsSlideOutOpen(false)}
      />
    </>
  );
}
