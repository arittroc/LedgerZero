"use client";

import { useState } from "react";
import { Wallet, Loader2, Mail, Chrome, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { authService } from "@/lib/supabase-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await authService.signInWithMagicLink(email);
      if (error) throw error;
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send magic link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google login failed.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#050505]">
      {/* Liquid Glass Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Branding */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150" />
             <div className="relative grid size-16 place-items-center rounded-[22px] bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Wallet className="size-7 text-white" />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
            LedgerZero
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
            Zero Effort Reconciliation
          </p>
        </div>

        {/* Glass Container */}
        <div className="relative group">
          {/* Subtle outer glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent rounded-[32px] blur-sm opacity-50 group-hover:opacity-100 transition duration-1000" />
          
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
            <div className="p-10">
              {isSent ? (
                <div className="text-center animate-in fade-in zoom-in duration-500">
                  <div className="size-16 bg-success/10 border border-success/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="size-8 text-success" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-3">Check your email</h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    We've sent a magic link to <span className="text-white font-medium">{email}</span>. Click it to sign in instantly.
                  </p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="text-sm font-medium text-gray-500 hover:text-white transition-colors"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleMagicLink} className="flex flex-col gap-6">
                    <div className="space-y-2">
                      <div className="relative group/input">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 px-5 text-white placeholder-gray-500 transition-all duration-300 focus:border-white/30 focus:outline-none focus:bg-white/10 peer"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 peer-focus:opacity-100 transition-opacity duration-300">
                           <ArrowRight className="size-5 text-white/50" />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-in slide-in-from-top-1">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="relative h-14 w-full group/btn overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] transition-none" />
                      <span className="relative flex items-center justify-center gap-2 font-bold text-black text-base">
                        {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Continue with Email"}
                      </span>
                    </button>
                  </form>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest">
                      <span className="bg-[#0e0e0e] px-4 text-gray-600 font-bold">or</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="h-14 w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        <Chrome className="size-5" />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {!isSent && (
          <p className="mt-8 text-center text-sm text-gray-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-gray-400 hover:text-white underline underline-offset-4 transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-gray-400 hover:text-white underline underline-offset-4 transition-colors">Privacy</Link>.
          </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}
