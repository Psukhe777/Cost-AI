import { ArrowDownRight, Cloud, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { compactNumber, usd } from "@/lib/money";

export function SavingsWidget({
  savedUsd,
  localTokens,
  cloudTokens
}: {
  savedUsd: number;
  localTokens: number;
  cloudTokens: number;
}) {
  const total = localTokens + cloudTokens;
  const localShare = total > 0 ? (localTokens / total) * 100 : 0;

  return (
    <Card className="min-h-[278px]">
      <CardHeader>
        <CardTitle>Local Savings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-4xl font-semibold tracking-tight text-primary">
          {usd(savedUsd)}
        </div>

        <div className="mt-6 grid gap-3">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Cpu className="h-4 w-4 text-primary" />
              Local tokens
            </div>
            <div className="text-right font-mono text-sm text-zinc-50">{compactNumber(localTokens)}</div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Cloud className="h-4 w-4 text-zinc-500" />
              Cloud tokens
            </div>
            <div className="text-right font-mono text-sm text-zinc-50">{compactNumber(cloudTokens)}</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-zinc-500">
            <span>Local routing</span>
            <span className="flex items-center gap-1 text-primary">
              <ArrowDownRight className="h-3.5 w-3.5" />
              {Math.round(localShare)}%
            </span>
          </div>
          <Progress value={localShare} />
        </div>
      </CardContent>
    </Card>
  );
}
