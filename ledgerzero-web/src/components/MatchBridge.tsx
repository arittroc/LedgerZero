import { CheckCircle2 } from "lucide-react";
import { cx } from "@/utils/cx";

export type BridgeRow = {
  id: string;
  type: "matched" | "empty";
};

interface MatchBridgeProps {
  rows: BridgeRow[];
  selectedMatchId: string | null;
  isApproved: boolean;
}

export function MatchBridge({
  rows,
  selectedMatchId,
  isApproved,
}: MatchBridgeProps) {
  return (
    <div className="grid gap-[14px] pt-[95px] pointer-events-none" aria-hidden="true">
      {rows.map((row) => {
        const isMatched = row.type === "matched";
        const isSelected = row.id === selectedMatchId;

        return (
          <div
            key={row.id}
            className={cx(
              "relative flex items-center justify-center min-h-[106px] transition-all duration-300",
              isMatched &&
                "after:content-[''] after:absolute after:left-[-18px] after:right-[-18px] after:top-1/2 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-[oklch(64%_0.145_150_/_0.52)] after:to-transparent after:-translate-y-1/2",
              (isSelected || isApproved) && isMatched ? "animate-approve-pulse" : ""
            )}
          >
            {isMatched && (
              <span
                className={cx(
                  "relative z-[2] grid size-[46px] place-items-center rounded-full border border-white/64 bg-[oklch(97%_0.03_155_/_0.72)] text-success shadow-[0_18px_40px_oklch(64%_0.145_150_/_0.2),inset_0_1px_0_oklch(100%_0_0_/_0.7)] backdrop-blur-[18px] transition-transform duration-300",
                  isSelected ? "scale-110" : "scale-100"
                )}
              >
                <CheckCircle2 className="size-[20px]" />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
