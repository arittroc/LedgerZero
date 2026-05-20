import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 p-8 md:p-24">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-white mb-12 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">
          Terms of Service
        </h1>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using LedgerZero, you agree to be bound by these
              Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Use License
            </h2>
            <p>
              Permission is granted to use LedgerZero for private, commercial,
              or internal business purposes related to financial reconciliation.
              This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Disclaimer
            </h2>
            <p>
              LedgerZero is provided on an 'as is' basis. We make no warranties,
              expressed or implied, regarding the accuracy or reliability of the
              automated reconciliation results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Limitations
            </h2>
            <p>
              In no event shall LedgerZero or its suppliers be liable for any
              damages arising out of the use or inability to use the services.
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-8 border-t border-white/10">
            Last updated: May 19, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
