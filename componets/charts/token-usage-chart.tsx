"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART, ChartEmptyState, ChartTooltip, chartTick } from "@/components/charts/chart-primitives";
import { compactNumber } from "@/lib/money";
import type { TimeSeriesPoint } from "@/lib/types";

export function TokenUsageChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <Card className="min-h-[340px]">
      <CardHeader>
        <CardTitle>Token Usage</CardTitle>
      </CardHeader>
      <CardContent className="h-[270px]">
        {data.length === 0 ? (
          <ChartEmptyState>No usage yet</ChartEmptyState>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tokenUsageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.accent} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={CHART.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke={CHART.grid}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={chartTick}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={chartTick}
                tickFormatter={compactNumber}
              />
              <Tooltip
                cursor={{ stroke: CHART.cursorStroke, strokeDasharray: "3 3" }}
                content={
                  <ChartTooltip
                    formatValue={(item) => compactNumber(item.value ?? 0)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="totalTokens"
                name="Total Tokens"
                stroke={CHART.accent}
                fill="url(#tokenUsageGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
