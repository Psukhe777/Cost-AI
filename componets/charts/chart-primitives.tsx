import type { ReactNode } from "react";

export const CHART = {
  accent: "#8fbeca",
  accentMuted: "#638996",
  grid: "rgb(255 255 255 / 0.08)",
  tick: "#71717a",
  cursorFill: "rgb(255 255 255 / 0.04)",
  cursorStroke: "rgb(255 255 255 / 0.16)"
} as const;

export const chartTick = {
  fill: CHART.tick,
  fontSize: 11,
  fontFamily: "monospace"
};

export type ChartTooltipPayload = {
  dataKey?: string | number;
  name?: string | number;
  value?: number;
  color?: string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  formatValue
}: {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
  formatValue: (item: ChartTooltipPayload) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/90 px-3 py-2 shadow-xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-2 font-mono text-xs text-zinc-400">{label}</div>
      <div className="grid gap-1">
        {payload.map((item) => (
          <div
            key={`${item.dataKey ?? item.name}`}
            className="flex items-center justify-between gap-5 font-mono text-xs"
          >
            <span style={{ color: item.color }}>{item.name}</span>
            <span className="text-zinc-100">{formatValue(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] font-mono text-xs text-zinc-500">
      {children}
    </div>
  );
}
