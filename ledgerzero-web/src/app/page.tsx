"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Zap, BarChart3, Clock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-hidden font-body">
      {/* Ambient Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-amber-600/5 blur-[100px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* Navigation */}
      <nav className="relative z-10 mx-auto max-w-7xl px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <div className="size-8 rounded-lg bg-white flex items-center justify-center">
            <div className="size-4 bg-black rounded-sm rotate-45" />
          </div>
          LedgerZero
        </div>
        <Link 
          href="/login" 
          className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all font-medium text-sm"
        >
          Sign In
        </Link>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-semibold mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Next-Gen Financial Reconciliation
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Zero Effort <br />Reconciliation
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
            Stop chasing transactions. Let LedgerZero automate your invoice matching with precision-engineered AI workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-white px-12 font-bold text-black shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              <span className="relative flex items-center gap-2">
                Get Started <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <button className="h-16 px-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all font-bold text-white w-full sm:w-auto">
              Watch Demo
            </button>
          </div>
        </section>

        {/* Live Demo Simulation */}
        <section className="mx-auto max-w-5xl px-6 mb-32">
          <div className="relative rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-8 md:p-12 overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              {/* Left Column: Bank Transaction */}
              <div className="w-full md:w-[40%] space-y-4 animate-slide-in-left">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Bank Transaction</div>
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">Razorpay Payment</div>
                    <div className="text-white">₹ 45,000.00</div>
                  </div>
                  <div className="text-sm text-gray-500 italic">TXN_ID: RZP_98231...</div>
                </div>
              </div>

              {/* Center: Glowing Match Line */}
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="h-px w-24 md:w-32 bg-gradient-to-r from-white/10 via-orange-500 to-white/10" />
                <div className="size-12 rounded-full border border-orange-500/50 bg-orange-500/10 flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-orange-500" />
                </div>
                <div className="h-px w-24 md:w-32 bg-gradient-to-r from-white/10 via-orange-500 to-white/10" />
              </div>

              {/* Right Column: Invoice */}
              <div className="w-full md:w-[40%] space-y-4 animate-slide-in-right">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Matched Invoice</div>
                <div className="p-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 backdrop-blur-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">Acme Corp Ltd.</div>
                    <div className="text-orange-400">#INV-2024-001</div>
                  </div>
                  <div className="text-sm text-gray-500">Amount: ₹ 45,000.00</div>
                </div>
              </div>
            </div>
            
            {/* Ambient Glow behind demo */}
            <div className="absolute inset-0 bg-orange-500/5 blur-[80px] -z-10" />
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="mx-auto max-w-7xl px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Bento Box - The Problem */}
            <div className="md:col-span-2 relative group overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 hover:bg-white/[0.05] transition-all">
              <div className="absolute top-0 right-0 p-8 text-orange-500/20 group-hover:text-orange-500/40 transition-colors">
                <Clock className="size-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-6 tracking-tight">Why do micro-SMEs waste 10+ hours weekly on invoice management?</h3>
                <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
                  Micro and small businesses waste significant administrative time creating, tracking, and reconciling invoices manually because enterprise-grade ERP systems are prohibitively expensive, overly complex for their simple needs, and require extensive training that small teams cannot afford.
                </p>
              </div>
            </div>

            {/* Feature Box 1 */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 hover:bg-white/[0.05] transition-all flex flex-col justify-between">
              <div className="size-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                <Zap className="size-6 text-orange-500" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Real-time Sync</h4>
                <p className="text-gray-500">Instantly match bank statements with outstanding invoices.</p>
              </div>
            </div>

            {/* Feature Box 2 */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 hover:bg-white/[0.05] transition-all flex flex-col justify-between">
              <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <Shield className="size-6 text-blue-500" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Enterprise Security</h4>
                <p className="text-gray-500">Bank-grade encryption for all your financial data.</p>
              </div>
            </div>

            {/* Feature Box 3 - Stats */}
            <div className="md:col-span-2 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 hover:bg-white/[0.05] transition-all flex flex-col md:flex-row items-center gap-12">
              <div className="size-24 rounded-full border-4 border-orange-500/20 border-t-orange-500 flex items-center justify-center text-2xl font-bold animate-spin-slow">
                98%
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-2 italic">Precision Matching</h4>
                <p className="text-gray-500 text-lg">Our AI reduces manual entry errors by up to 98%, saving your team from costly financial discrepancies.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto max-w-7xl px-6 py-20 border-t border-white/5 text-center text-gray-600 text-sm">
          <p>© 2026 LedgerZero. Built for the modern SME.</p>
        </footer>
      </main>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 1s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
}
