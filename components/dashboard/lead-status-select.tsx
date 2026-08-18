"use client";

import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeadStatusAction } from "@/lib/actions/leads";
import type { LeadStatus } from "@/types/domain";
import { LEAD_STATUS_LABEL } from "@/types/domain";

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={status}
      disabled={pending}
      onValueChange={(value) =>
        startTransition(() => updateLeadStatusAction(leadId, value as LeadStatus))
      }
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(LEAD_STATUS_LABEL) as LeadStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            {LEAD_STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
