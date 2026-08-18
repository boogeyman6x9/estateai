import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/types/domain";
import { LEAD_STATUS_LABEL } from "@/types/domain";

const VARIANT: Record<LeadStatus, "default" | "secondary" | "outline" | "positive" | "hot"> = {
  new: "secondary",
  contacted: "secondary",
  qualified: "outline",
  inspection_booked: "outline",
  negotiating: "outline",
  converted: "positive",
  lost: "hot",
  archived: "secondary",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={VARIANT[status]}>{LEAD_STATUS_LABEL[status]}</Badge>;
}
