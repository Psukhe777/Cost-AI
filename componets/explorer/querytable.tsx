import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { usd } from "@/lib/money";
import type { SerializedLog } from "@/lib/types";

export function QueryTable({
  logs,
  initialSearch = ""
}: {
  logs: SerializedLog[];
  initialSearch?: string;
}) {
  return (
    <Card className="min-h-[430px]">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Cost Per Query</CardTitle>
        <form action="/dashboard/explorer" className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={initialSearch}
            placeholder="Search model, agent, project"
            className="pl-9"
          />
        </form>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead className="text-right">Prompt</TableHead>
              <TableHead className="text-right">Completion</TableHead>
              <TableHead className="text-right">TTFT</TableHead>
              <TableHead className="text-right">Latency</TableHead>
              <TableHead className="text-right">TPS</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <EmptyTableRow colSpan={10}>No matching calls</EmptyTableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-zinc-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge>{log.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-44 items-center gap-2">
                      <span className="truncate font-medium text-zinc-200">{log.model}</span>
                      <Badge variant="outline">
                        {log.modelType.toLowerCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="grid min-w-40 gap-1">
                      <div className="truncate text-zinc-200">{log.agentName ?? "default-agent"}</div>
                      <div className="truncate font-mono text-xs text-zinc-500">
                        {log.projectId ?? "untagged"}
                      </div>
                      {log.tags.length > 0 ? (
                        <div className="flex max-w-48 flex-wrap gap-1">
                          {log.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <NumericTableCell>
                    {log.promptTokens.toLocaleString()}
                  </NumericTableCell>
                  <NumericTableCell>
                    {log.completionTokens.toLocaleString()}
                  </NumericTableCell>
                  <NumericTableCell>
                    {log.ttftMs == null ? "-" : `${log.ttftMs} ms`}
                  </NumericTableCell>
                  <NumericTableCell>
                    {log.latencyMs == null ? "-" : `${log.latencyMs} ms`}
                  </NumericTableCell>
                  <NumericTableCell>
                    {log.tps.toFixed(1)}
                  </NumericTableCell>
                  <NumericTableCell highlight>
                    {usd(log.costUsd)}
                  </NumericTableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
