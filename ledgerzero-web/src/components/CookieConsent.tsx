"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-8 right-8 z-50 animate-in slide-in-from-bottom-8 duration-500">
      <div className="mx-auto max-w-4xl backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-sm text-gray-300 leading-relaxed text-center md:text-left">
          We use essential cookies to ensure you get the best experience on
          LedgerZero. By continuing to use the dashboard, you agree to our{" "}
          <Link
            href="/privacy"
            className="text-white hover:underline underline-offset-4"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/terms"
            className="text-white hover:underline underline-offset-4"
          >
            Terms of Service
          </Link>
          .
        </div>
        <button
          onClick={handleAccept}
          className="whitespace-nowrap py-3 px-8 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-colors active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
