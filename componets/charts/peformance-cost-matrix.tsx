"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART, ChartEmptyState, ChartTooltip, chartTick } from "@/components/charts/chart-primitives";
import { usd } from "@/lib/money";
import type { PerformanceCostPoint } from "@/lib/types";

export function PerformanceCostMatrix({ data }: { data: PerformanceCostPoint[] }) {
  return (
    <Card className="min-h-[360px]">
      <CardHeader>
        <CardTitle>Performance Vs Cost Matrix</CardTitle>
      </CardHeader>
      <CardContent className="h-[290px]">
        {data.length === 0 ? (
          <ChartEmptyState>No latency/cost samples</ChartEmptyState>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                vertical={false}
                stroke={CHART.grid}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="model"
                tickLine={false}
                axisLine={false}
                tick={chartTick}
              />
              <YAxis
                yAxisId="cost"
                tickLine={false}
                axisLine={false}
                tick={chartTick}
                tickFormatter={(value) => usd(Number(value), 2)}
              />
              <YAxis
                yAxisId="latency"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={chartTick}
                tickFormatter={(value) => `${Math.round(Number(value))}ms`}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatValue={(item) => {
                      const value = Number(item.value ?? 0);
                      return item.dataKey === "costUsd"
                        ? usd(value)
                        : `${Math.round(value)} ms`;
                    }}
                  />
                }
                cursor={{ fill: CHART.cursorFill }}
              />
              <Bar
                yAxisId="cost"
                dataKey="costUsd"
                name="Cost"
                fill={CHART.accent}
                radius={[3, 3, 0, 0]}
              />
              <Line
                yAxisId="latency"
                type="monotone"
                dataKey="avgLatencyMs"
                name="Latency"
                stroke={CHART.accent}
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="latency"
                type="monotone"
                dataKey="avgTtftMs"
                name="TTFT"
                stroke={CHART.accentMuted}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

