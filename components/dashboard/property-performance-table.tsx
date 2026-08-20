import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Building2 } from "lucide-react";

export interface PropertyPerformanceRow {
  id: string;
  title: string;
  suburb: string;
  enquiries: number;
}

export function PropertyPerformanceTable({ rows }: { rows: PropertyPerformanceRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top performing properties</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No enquiries yet"
            description="Once leads start enquiring about listings, the best performers will show up here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Suburb</TableHead>
                <TableHead className="text-right">Enquiries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/properties/${row.id}`} className="hover:underline">
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.suburb}</TableCell>
                  <TableCell className="text-right font-mono">{row.enquiries}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
