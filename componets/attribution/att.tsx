import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EmptyTableRow,
  NumericTableCell,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { compactNumber, usd } from "@/lib/money";
import type { AgentTagBreakdown, SparklinePoint } from "@/lib/types";

function sparklinePath(points: SparklinePoint[]) {
  if (points.length === 0) return "";

  const width = 118;
  const height = 28;
  const max = Math.max(...points.map((point) => point.costUsd), 0.0001);
  const step = points.length > 1 ? width / (points.length - 1) : width;

  return points
    .map((point, index) => {
      const x = index * step;
      const y = height - (point.costUsd / max) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function InlineSparkline({ points }: { points: SparklinePoint[] }) {
  const path = sparklinePath(points);

  return (
    <svg viewBox="0 0 118 28" className="h-7 w-[118px]" role="img" aria-label="24h spend trend">
      <path d="M0 27.5H118" stroke="rgb(255 255 255 / 0.08)" strokeWidth="1" />
      {path ? (
        <path d={path} fill="none" stroke="#8fbeca" strokeLinecap="round" strokeWidth="1.8" />
      ) : null}
    </svg>
  );
}

export function AgentTagCostTable({ rows }: { rows: AgentTagBreakdown[] }) {
  const topRows = rows.slice(0, 10);

  return (
    <Card className="min-h-[370px]">
      <CardHeader>
        <CardTitle>Cost By Agent / Tag</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attribution</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Calls</TableHead>
              <TableHead className="text-right">Latency</TableHead>
              <TableHead className="text-right">24h Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topRows.length === 0 ? (
              <EmptyTableRow colSpan={7} className="h-28 font-mono text-xs text-zinc-500">
                No agent or tag attribution yet
              </EmptyTableRow>
            ) : (
              topRows.map((row) => (
                <TableRow key={`${row.type}:${row.key}`}>
                  <TableCell className="max-w-[220px]">
                    <Badge variant={row.type === "tag" ? "default" : "outline"} className="max-w-full truncate font-mono">
                      {row.type === "tag" && !row.key.startsWith("#") ? `#${row.key}` : row.key}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-zinc-500">{row.type}</span>
                  </TableCell>
                  <NumericTableCell className="text-xs">
                    {usd(row.totalCostUsd)}
                  </NumericTableCell>
                  <NumericTableCell className="text-xs text-zinc-400">
                    {compactNumber(row.totalTokens)}
                  </NumericTableCell>
                  <NumericTableCell className="text-xs text-zinc-400">
                    {row.callCount.toLocaleString()}
                  </NumericTableCell>
                  <NumericTableCell className="text-xs">
                    {Math.round(row.avgLatencyMs)} ms
                  </NumericTableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <InlineSparkline points={row.sparkline} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
