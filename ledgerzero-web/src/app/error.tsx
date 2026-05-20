"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our telemetry service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
      <div className="max-w-md w-full backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center shadow-2xl overflow-hidden relative group">
        {/* Animated background glow */}
        <div className="absolute -inset-24 bg-red-500/10 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            We've encountered an unexpected error. Our systems have been
            notified and we're looking into it.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full py-3.5 px-6 bg-white text-black font-medium rounded-2xl hover:bg-gray-200 transition-colors duration-200 active:scale-[0.98]"
            >
              Try again
            </button>
            <a
              href="/"
              className="w-full py-3.5 px-6 bg-white/5 text-white font-medium rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-200 active:scale-[0.98]"
            >
              Return home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
