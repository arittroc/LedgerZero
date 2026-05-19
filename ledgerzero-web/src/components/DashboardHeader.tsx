import { CheckCircle2, Wallet } from "lucide-react";
import { formatCurrency } from "@/utils/format";

interface DashboardHeaderProps {
  totalUnreconciled: number;
  onApprove: () => void;
  isApproved: boolean;
}

export function DashboardHeader({
  totalUnreconciled,
  onApprove,
  isApproved,
}: DashboardHeaderProps) {
  return (
    <nav
      className="sticky top-[18px] z-20 mx-auto flex max-w-[1240px] items-center justify-between gap-4 rounded-[28px] border border-glass-border bg-white/42 p-3 shadow-custom backdrop-blur-[26px] backdrop-saturate-[1.18]"
      aria-label="LedgerZero dashboard"
    >
      <div className="flex items-center gap-[10px] pl-[10px] font-display text-[18px] font-[760] tracking-normal text-fg whitespace-nowrap">
        <span className="grid size-8 place-items-center rounded-xl bg-fg text-surface shadow-[inset_0_1px_0_oklch(100%_0_0_/_0.2)]">
          <Wallet className="size-[18px]" />
        </span>
        LedgerZero
      </div>

      <div className="flex min-h-[42px] items-center justify-center rounded-full border border-white/58 bg-white/52 px-[18px] text-[14px] font-[650] text-muted shadow-[inset_0_1px_0_oklch(100%_0_0_/_0.72)] backdrop-blur-[18px] whitespace-nowrap">
        Total Unreconciled:{" "}
        <strong className="ml-[6px] font-[760] text-fg tabular-nums">
          {formatCurrency(totalUnreconciled)}
        </strong>
      </div>

      <button
        className="flex min-h-[44px] items-center justify-center gap-[9px] rounded-full border-0 bg-fg px-[18px] text-[14px] font-[700] text-surface shadow-[0_15px_35px_oklch(18%_0.012_250_/_0.24),inset_0_1px_0_oklch(100%_0_0_/_0.18)] transition-all duration-[180ms] hover:-translate-y-[1px] hover:bg-slate-800 hover:shadow-[0_19px_44px_oklch(18%_0.012_250_/_0.27),inset_0_1px_0_oklch(100%_0_0_/_0.2)] active:translate-y-0 whitespace-nowrap"
        type="button"
        onClick={onApprove}
      >
        <CheckCircle2 className="size-[18px]" />
        {isApproved ? "Matches Approved" : "Approve All Matches"}
      </button>
    </nav>
  );
}
