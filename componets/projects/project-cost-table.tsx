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
import type { ProjectBreakdown } from "@/lib/types";

export function ProjectCostTable({ rows }: { rows: ProjectBreakdown[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent And Project Costs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Cloud Spend</TableHead>
              <TableHead className="text-right">Local Tokens</TableHead>
              <TableHead className="text-right">Saved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <EmptyTableRow colSpan={6}>No tagged usage</EmptyTableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${row.projectId}:${row.agentName}`}>
                  <TableCell>
                    <Badge variant={row.projectId === "untagged" ? "outline" : "secondary"}>
                      {row.projectId}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-300">{row.agentName}</TableCell>
                  <NumericTableCell>
                    {compactNumber(row.totalTokens)}
                  </NumericTableCell>
                  <NumericTableCell>
                    {usd(row.cloudSpendUsd)}
                  </NumericTableCell>
                  <NumericTableCell>
                    {compactNumber(row.localTokens)}
                  </NumericTableCell>
                  <NumericTableCell highlight>
                    {usd(row.savedUsd)}
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
