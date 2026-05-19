import { Invoice, ReconciliationResult } from "@/utils/reconcileLedger";
import { InvoiceCard } from "./InvoiceCard";

interface LeftColumnProps {
  invoices: Invoice[];
  activeMatchId: string | null;
  isApproved: boolean;
  onSelectMatch: (id: string | null) => void;
  reconciliation: ReconciliationResult;
}

export function LeftColumn({
  invoices,
  activeMatchId,
  isApproved,
  onSelectMatch,
  reconciliation,
}: LeftColumnProps) {
  const matchedCount = reconciliation.matchedPairs.length;

  return (
    <section className="liquid-column min-w-0 overflow-hidden" aria-label="Outstanding Invoices">
      <header className="flex min-h-[76px] items-center justify-between gap-[14px] border-b border-white/42 px-[22px] pb-[16px] pt-[22px]">
        <h2 className="font-display text-[clamp(21px,2.2vw,28px)] font-[740] leading-none tracking-normal">
          Outstanding Invoices
        </h2>
        <span className="text-[13px] font-[650] tabular-nums text-muted whitespace-nowrap">
          {matchedCount} matched
        </span>
      </header>
      <div className="grid gap-[14px] p-[18px]">
        {invoices.map((invoice) => {
          const match = reconciliation.matchedPairs.find(
            (p) => p.invoice.id === invoice.id
          );
          const isMatched = !!match;
          const isActive = match ? match.id === activeMatchId : false;

          return (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              isActive={isActive}
              isMatched={isMatched}
              isApproved={isApproved}
              onSelect={() => match && onSelectMatch(match.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
