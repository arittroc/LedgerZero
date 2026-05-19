import { CheckCircle2, Sparkles } from "lucide-react";
import { cx } from "@/utils/cx";
import { formatCurrency, formatDate } from "@/utils/format";
import { Invoice } from "@/utils/reconcileLedger";

interface InvoiceCardProps {
  invoice: Invoice;
  isActive: boolean;
  isMatched: boolean;
  isApproved: boolean;
  onSelect: () => void;
}

export function InvoiceCard({
  invoice,
  isActive,
  isMatched,
  isApproved,
  onSelect,
}: InvoiceCardProps) {
  return (
    <button
      className={cx(
        "record-card-base relative grid min-h-[106px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-[16px] p-[18px] text-left rounded-[22px]",
        isMatched && isApproved
          ? "border-[oklch(86%_0.06_150_/_0.9)] bg-[oklch(98%_0.022_155_/_0.78)]"
          : isMatched
          ? "border-success-border bg-success-soft"
          : "",
        isActive &&
          "shadow-[0_0_0_3px_oklch(58%_0.18_255_/_0.14),0_22px_48px_oklch(18%_0.012_250_/_0.12),inset_0_1px_0_oklch(100%_0_0_/_0.78)]"
      )}
      type="button"
      onClick={onSelect}
    >
      <span className="min-w-0">
        <span className="mb-[9px] flex items-center gap-[8px] overflow-wrap-anywhere font-display text-[17px] font-[760] leading-[1.15] tracking-normal text-fg">
          {isMatched && (
            <span
              className="size-2 shrink-0 rounded-full bg-success shadow-[0_0_0_4px_oklch(64%_0.145_150_/_0.14)]"
              aria-hidden="true"
            />
          )}
          {invoice.clientName}
        </span>
        <span className="block text-[13px] font-[600] leading-[1.2] text-muted">
          {formatDate(invoice.date)}
        </span>
        <span
          className={cx(
            "mt-[12px] flex items-center gap-[7px] text-[12px] font-[650]",
            isMatched ? "text-[oklch(40%_0.12_150)]" : "text-muted"
          )}
        >
          {isMatched ? (
            <CheckCircle2 className="size-[15px]" />
          ) : (
            <Sparkles className="size-[15px]" />
          )}
          {isApproved && isMatched
            ? "Approved match"
            : isMatched
            ? "Perfect match"
            : "Needs review"}
        </span>
      </span>
      <span className="self-start text-[clamp(18px,2vw,24px)] font-[780] leading-none tracking-normal text-fg tabular-nums whitespace-nowrap">
        {formatCurrency(invoice.amount)}
      </span>
      <span className="sr-only">invoice</span>
    </button>
  );
}
