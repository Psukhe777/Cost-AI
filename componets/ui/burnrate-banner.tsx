import { AlertTriangle } from "lucide-react";
import { compactNumber } from "@/lib/money";
import type { BurnRateSnapshot } from "@/lib/types";

export function BurnRateBanner({ burnRate }: { burnRate: BurnRateSnapshot }) {
  if (!burnRate.anomalyDetected) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-zinc-200 backdrop-blur-xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Velocity Watchdog Anomaly
          </div>
        </div>
        <div className="font-mono text-xs text-zinc-400">
          Current burn {compactNumber(burnRate.currentTokensPerMinute)} tokens/min,
          up {Math.round(burnRate.spikePercent)}% vs baseline
        </div>
      </div>
    </div>
  );
}
