"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART, ChartEmptyState, ChartTooltip, chartTick } from "@/components/charts/chart-primitives";
import { usd } from "@/lib/money";
import type { ModelBreakdown } from "@/lib/types";

export function CostByModelChart({ rows }: { rows: ModelBreakdown[] }) {
  const data = rows
    .map((row) => ({
      name: `${row.model} ${row.modelType === "LOCAL" ? "(local)" : ""}`,
      costUsd: row.costUsd,
      totalTokens: row.totalTokens
    }))
    .sort((a, b) => b.costUsd - a.costUsd)
    .slice(0, 8);

  return (
    <Card className="min-h-[340px]">
      <CardHeader>
        <CardTitle>Cost By Model</CardTitle>
      </CardHeader>
      <CardContent className="h-[270px]">
        {data.length === 0 ? (
          <ChartEmptyState>No model spend</ChartEmptyState>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 12, right: 8 }}>
              <CartesianGrid
                vertical={false}
                stroke={CHART.grid}
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={chartTick}
                tickFormatter={(value) => usd(value, 2)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={118}
                tickLine={false}
                axisLine={false}
                tick={chartTick}
              />
              <Tooltip
                cursor={{ fill: CHART.cursorFill }}
                content={
                  <ChartTooltip
                    formatValue={(item) => {
                      const value = Number(item.value ?? 0);
                      return item.dataKey === "costUsd"
                        ? usd(value)
                        : value.toLocaleString();
                    }}
                  />
                }
              />
              <Bar dataKey="costUsd" name="Cost" fill={CHART.accent} radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
