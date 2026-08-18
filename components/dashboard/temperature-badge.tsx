import { Flame, Sun, Snowflake } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { LeadTemperature } from "@/types/domain";
import { LEAD_TEMPERATURE_LABEL } from "@/types/domain";

const ICONS = { hot: Flame, warm: Sun, cold: Snowflake } as const;

export function TemperatureBadge({ temperature }: { temperature: LeadTemperature }) {
  const Icon = ICONS[temperature];
  return (
    <Badge variant={temperature}>
      <Icon className="h-3 w-3" />
      {LEAD_TEMPERATURE_LABEL[temperature]}
    </Badge>
  );
}
