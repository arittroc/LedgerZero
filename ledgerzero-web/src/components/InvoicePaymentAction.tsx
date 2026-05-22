"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, CreditCard, Sparkles } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface InvoicePaymentActionProps {
  invoiceId: string;
  totalAmount: number;
  status: string;
}

export function InvoicePaymentAction({ invoiceId, totalAmount, status }: InvoicePaymentActionProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);

  useEffect(() => {
    // Check for success param (legacy Stripe support or general refresh)
    if (searchParams.get("success") === "true") {
      setShowSuccessModal(true);
      setLocalStatus("paid");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    // Dynamically load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [searchParams]);

  const handlePay = async () => {
    setIsLoading(true);
    try {
      // 1. Create order on backend
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, totalAmount }),
      });

      if (!response.ok) throw new Error("Failed to create Razorpay order");
      const { orderId, amount, currency } = await response.json();

      // 2. Initialize Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "LedgerZero",
        description: `Invoice Payment #${invoiceId.slice(-6).toUpperCase()}`,
        order_id: orderId,
        handler: function (response: any) {
          // Success Callback
          console.log("Payment Successful:", response.razorpay_payment_id);
          setLocalStatus("paid");
          setShowSuccessModal(true);
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        },
        theme: {
          color: "#050505",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      setIsLoading(false);
      alert("Failed to initialize payment. Please try again.");
    }
  };

  if (localStatus === "paid") {
    return (
      <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-success/10 border border-success/20 text-success font-bold text-sm uppercase tracking-widest animate-in zoom-in-95">
        <CheckCircle2 className="size-5" />
        Invoice Paid
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handlePay}
        disabled={isLoading}
        className="group relative h-16 px-12 overflow-hidden rounded-[24px] bg-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        <span className="relative flex items-center justify-center gap-3 font-black text-black text-lg tracking-tight">
          {isLoading ? (
            <>
              <Loader2 className="size-6 animate-spin" />
              Securing Checkout...
            </>
          ) : (
            <>
              <CreditCard className="size-6" />
              Pay Invoice
            </>
          )}
        </span>
      </button>

      {/* Success Celebration Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-700">
          <div className="relative w-full max-w-md p-10 overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-2xl text-center animate-in zoom-in-95 duration-500">
            <div className="absolute -top-24 -left-24 size-64 bg-success/20 blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 size-64 bg-accent/20 blur-[100px]" />

            <div className="relative z-10">
              <div className="size-24 bg-success/10 border border-success/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle2 className="size-12 text-success" />
              </div>
              
              <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Payment Received</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10">
                Thank you for your business. A receipt has been sent to your email.
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
              >
                Close View
              </button>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success via-accent to-success animate-[shimmer_3s_infinite]" />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}
