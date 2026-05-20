import Link from "next/link";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Data Collection
            </h2>
            <p>
              LedgerZero collects minimal personal data required to provide our
              reconciliation services. This includes your email address for
              authentication and the financial data you choose to upload or
              sync.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Use of Information
            </h2>
            <p>
              Your data is used solely to facilitate the reconciliation process
              within your private tenant. We do not sell, trade, or otherwise
              transfer your information to outside parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Security
            </h2>
            <p>
              We implement a variety of security measures to maintain the safety
              of your personal information, including industry-standard
              encryption for data at rest and in transit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Cookies
            </h2>
            <p>
              We use secure cookies to maintain your session and improve your
              user experience. By using our service, you consent to our use of
              these essential cookies.
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
