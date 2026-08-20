"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LeadSourceChart({ data }: { data: { source: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead source breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="source"
                axisLine={false}
                tickLine={false}
                width={110}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Bar dataKey="count" fill="var(--navy-700)" radius={[0, 4, 4, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
