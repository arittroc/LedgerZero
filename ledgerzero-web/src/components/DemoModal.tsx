"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [iframeSrc, setIframeSrc] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIframeSrc(`/ledgerzero-demo.html?t=${Date.now()}`);
    } else {
      document.body.style.overflow = "unset";
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-[90%] max-w-5xl h-[80vh] rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>
        
        <iframe 
          src={iframeSrc}
          className="w-full h-full border-none" 
          title="LedgerZero Demo" 
        />
      </div>
    </div>
  );
}
