# LedgerZero v1.1: The Zero-Effort Reconciliation Engine

LedgerZero is a cloud-native financial operating system designed to eliminate manual data entry for modern businesses. By combining **Atomic Reconciliation** with a multimodal **AI Omni-Parser**, LedgerZero transforms unstructured financial reality—receipts, photos, and messy bank feeds—into a verified, audit-ready ledger with zero friction.

---

## ✨ What's New in v1.1: The Omni-Parser Upgrade
The defining milestone of v1.1 is the transition from strict deterministic ingestion to agentic automation.
- **Multimodal AI Ingestion:** Powered by **Google Gemini 1.5 Flash**, the new "Smart Scan" feature extracts structured financial data from raw images, PDFs, and unstructured text files.
- **Agentic Normalization:** Intelligent extraction of client names, amounts, and due dates with automated business-context mapping.
- **Glassmorphic Ledger History:** A high-fidelity, Apple-inspired audit trail for all auto-reconciled transactions.
- **CSV Audit Export:** Secure, one-click exports for external reporting and tax compliance.

---

## 🛠 The Tech Stack
Built for speed, security, and extreme developer productivity:
- **Frontend:** Next.js 14+ (App Router), React 19, Tailwind CSS 4.
- **Backend:** Next.js Server Actions & Route Handlers.
- **Database:** PostgreSQL via **Supabase**.
- **ORM:** Prisma (Native UUID support).
- **AI:** Google Generative AI (Gemini 1.5 Flash).
- **Infrastructure:** Vercel Edge Network.

---

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env` file in the `ledgerzero-web` directory:
```env
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
GEMINI_API_KEY="your-google-ai-key"
```
*Note: Ensure you use port **5432** (Direct Connection) for Prisma migrations to bypass connection pooling conflicts.*

### 2. Installation & Database Sync
```bash
npm install
npx prisma generate
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 📈 Roadmap & Investment Opportunity
LedgerZero is built as a foundational SaaS infrastructure. Our immediate scaling targets include:
1. **Plaid Integration:** Real-time, authenticated bank feed synchronization.
2. **AI Fuzzy Matching:** Intelligent handling of partial payments and localized currency discrepancies.
3. **Enterprise RLS:** Multi-tenant data isolation for global SaaS scaling.

---
*LedgerZero: Because financial clarity shouldn't require effort.*
