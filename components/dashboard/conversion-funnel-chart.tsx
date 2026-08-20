"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FunnelStage {
  stage: string;
  count: number;
  fill: string;
}

export function ConversionFunnelChart({ data }: { data: FunnelStage[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 12, right: 24 }}>
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
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                width={110}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {data.map((entry) => (
                  <Cell key={entry.stage} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  fill="var(--foreground)"
                  fontSize={12}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
