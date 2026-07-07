import { KeyRound, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/shell/sidebar";
import { usd } from "@/lib/money";

type ShellUser = {
  email: string;
  apiSecretPreview: string;
  budgetUsd: number;
  usedUsd: number;
};

export function AppShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: ShellUser;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
            <div className="flex min-h-16 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between lg:px-6">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
                  COST AI
                </h1>
                <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary md:flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Telemetry Node Active
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 md:hidden">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Telemetry Node Active
                </Badge>
                <Badge variant="outline" className="gap-1.5 font-mono">
                  <RadioTower className="h-3.5 w-3.5 text-primary" />
                  Local Node
                </Badge>
                <Badge variant="outline" className="gap-1.5 font-mono">
                  <KeyRound className="h-3.5 w-3.5 text-zinc-500" />
                  {user.apiSecretPreview}
                </Badge>
                <Badge variant="secondary" className="font-mono">
                  {usd(user.usedUsd)} / {usd(user.budgetUsd)}
                </Badge>
              </div>
            </div>
          </header>

          <div className="px-4 py-4 lg:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
