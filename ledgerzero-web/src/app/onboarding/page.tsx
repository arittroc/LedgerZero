"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Loader2, Sparkles, Building2, Coins, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [companyName, setCompanyName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Authentication required");

      // 2. Create the first business record
      // RLS allows this because auth.uid() = owner_id
      const { error: insertError } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          company_name: companyName,
          currency: currency,
        });

      if (insertError) throw insertError;

      // 3. Success! Redirect to dashboard
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      setError(err.message || "Failed to set up your business.");
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#050505]">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-success/10 blur-[140px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Progress header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150" />
             <div className="relative grid size-16 place-items-center rounded-2xl bg-white/5 border border-white/20 backdrop-blur-2xl">
                <Sparkles className="size-8 text-white" />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Welcome to LedgerZero
          </h1>
          <p className="text-gray-400 text-sm max-w-[280px]">
            Let's set up your business profile to get started with reconciliation.
          </p>
        </div>

        {/* Onboarding Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-[40px] blur-sm opacity-50" />
          
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.02] backdrop-blur-[40px] shadow-2xl">
            <div className="p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company Name Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    <Building2 className="size-3" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Design Studio"
                    className="w-full h-16 rounded-2xl border border-white/5 bg-white/5 px-6 text-lg text-white placeholder-gray-600 transition-all duration-300 focus:border-white/20 focus:outline-none focus:bg-white/[0.08]"
                  />
                </div>

                {/* Currency Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    <Coins className="size-3" />
                    Base Currency
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["USD", "EUR", "GBP"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`h-14 rounded-2xl border font-bold text-sm transition-all duration-300 ${
                          currency === c 
                          ? "bg-white text-black border-white shadow-lg scale-[1.02]" 
                          : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/10"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in slide-in-from-top-1">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !companyName}
                  className="group relative h-16 w-full overflow-hidden rounded-[20px] bg-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative flex items-center justify-center gap-2 font-black text-black text-lg tracking-tight">
                    {isLoading ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      <>
                        Complete Setup <ArrowRight className="size-5" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Skip/Back hint */}
        <p className="mt-8 text-center text-xs text-gray-600 font-medium">
          You can change these settings anytime in the dashboard.
        </p>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}
