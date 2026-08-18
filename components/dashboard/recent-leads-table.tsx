import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TemperatureBadge } from "./temperature-badge";
import { StatusBadge } from "./status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Users } from "lucide-react";
import type { LeadStatus, LeadTemperature } from "@/types/domain";

interface RecentLead {
  id: string;
  first_name: string | null;
  last_name: string | null;
  lead_score: number;
  lead_temperature: LeadTemperature;
  status: LeadStatus;
  source: string;
}

export function RecentLeadsTable({ leads }: { leads: RecentLead[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent leads</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/leads">
            View all
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No leads yet"
            description="New enquiries from your website chat widget will appear here automatically."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/leads/${lead.id}`} className="hover:underline">
                      {lead.first_name} {lead.last_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{lead.lead_score}</span>
                      <TemperatureBadge temperature={lead.lead_temperature} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
