import { BankFeedItem, ReconciliationResult } from "@/utils/reconcileLedger";
import { BankFeedCard } from "./BankFeedCard";

interface RightColumnProps {
  bankFeed: BankFeedItem[];
  activeMatchId: string | null;
  isApproved: boolean;
  onSelectMatch: (id: string | null) => void;
  reconciliation: ReconciliationResult;
}

export function RightColumn({
  bankFeed,
  activeMatchId,
  isApproved,
  onSelectMatch,
  reconciliation,
}: RightColumnProps) {
  return (
    <section
      className="liquid-column min-w-0 overflow-hidden"
      aria-label="Live Bank Feed"
    >
      <header className="flex min-h-[76px] items-center justify-between gap-[14px] border-b border-white/42 px-[22px] pb-[16px] pt-[22px]">
        <h2 className="font-display text-[clamp(21px,2.2vw,28px)] font-[740] leading-none tracking-normal">
          Live Bank Feed
        </h2>
        <span className="text-[13px] font-[650] tabular-nums text-muted whitespace-nowrap">
          {bankFeed.length} transactions
        </span>
      </header>
      <div className="grid gap-[14px] p-[18px]">
        {bankFeed.map((item) => {
          const match = reconciliation.matchedPairs.find(
            (p) => p.bankItem.id === item.id,
          );
          const isMatched = !!match;
          const isActive = match ? match.id === activeMatchId : false;

          return (
            <BankFeedCard
              key={item.id}
              item={item}
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
