"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, Plus, Trash2, Calendar, Building2, DollarSign } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency } from "@/utils/format";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface SmartInvoiceData {
  clientName: string;
  totalAmount: number;
  dueDate: string;
  items: InvoiceItem[];
}

interface SmartInvoiceModalProps {
  data: SmartInvoiceData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SmartInvoiceModal({ data, isOpen, onClose, onSuccess }: SmartInvoiceModalProps) {
  const supabase = createClient();
  const [formData, setFormData] = useState<SmartInvoiceData>(data);
  const [isSaving, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total
    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    setFormData({ ...formData, items: newItems, totalAmount: newTotal });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Get user business
      const { data: businesses } = await supabase.from('businesses').select('id').limit(1).single();
      if (!businesses) throw new Error("No business found. Please complete onboarding.");

      // 2. Ensure client exists or create one
      let clientId: string;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('name', formData.clientName)
        .eq('business_id', businesses.id)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({ name: formData.clientName, business_id: businesses.id })
          .select()
          .single();
        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // 3. Call our existing POST /api/invoices route (safer to keep logic centralized)
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businesses.id,
          client_id: clientId,
          due_date: formData.dueDate,
          status: 'sent',
          items: formData.items
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save invoice");
      }

      onSuccess();
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-[40px] shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <CheckCircle2 className="size-6 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Review Smart Scan</h2>
              <p className="text-gray-500 text-sm font-medium">Verify the extracted data before saving to ledger.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/5 text-gray-500 hover:text-white transition-all">
            <X className="size-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Top Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                <Building2 className="size-3" />
                Vendor / Client Name
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full h-14 rounded-2xl border border-white/5 bg-white/5 px-5 text-white focus:border-white/20 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                <Calendar className="size-3" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full h-14 rounded-2xl border border-white/5 bg-white/5 px-5 text-white focus:border-white/20 focus:outline-none transition-all color-scheme-dark"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Line Items</label>
              <button 
                onClick={handleAddItem}
                className="flex items-center gap-2 text-xs font-bold text-accent hover:text-white transition-colors"
              >
                <Plus className="size-3" /> Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 group animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="flex-[3] h-14 rounded-2xl border border-white/5 bg-white/5 px-5 text-sm text-white focus:border-white/10 focus:outline-none transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value))}
                    className="flex-1 h-14 rounded-2xl border border-white/5 bg-white/5 px-4 text-sm text-white focus:border-white/10 focus:outline-none transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                    className="flex-1 h-14 rounded-2xl border border-white/5 bg-white/5 px-4 text-sm text-white focus:border-white/10 focus:outline-none transition-all"
                  />
                  <button 
                    onClick={() => handleRemoveItem(idx)}
                    className="size-14 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center text-gray-600 hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Extraction</span>
            <span className="text-3xl font-black text-white tracking-tighter">{formatCurrency(formData.totalAmount)}</span>
          </div>

          <div className="flex gap-4">
             {error && <p className="text-red-400 text-xs font-medium mr-4 flex items-center animate-pulse">{error}</p>}
             <button
                onClick={handleSave}
                disabled={isSaving || formData.items.length === 0}
                className="h-16 px-10 group relative overflow-hidden rounded-[24px] bg-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center gap-3 font-black text-black text-lg tracking-tight">
                  {isSaving ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <>
                      Save to Ledger
                    </>
                  )}
                </span>
              </button>
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
