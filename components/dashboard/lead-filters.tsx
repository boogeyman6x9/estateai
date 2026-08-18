"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEMPERATURES = ["all", "hot", "warm", "cold"];
const STATUSES = [
  "all", "new", "contacted", "qualified", "inspection_booked",
  "negotiating", "converted", "lost", "archived",
];

export function LeadFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        defaultValue={searchParams.get("temperature") ?? "all"}
        onValueChange={(v) => setParam("temperature", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Temperature" />
        </SelectTrigger>
        <SelectContent>
          {TEMPERATURES.map((t) => (
            <SelectItem key={t} value={t}>
              {t === "all" ? "All temperatures" : t[0].toUpperCase() + t.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(v) => setParam("status", v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s === "all" ? "All statuses" : s.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
