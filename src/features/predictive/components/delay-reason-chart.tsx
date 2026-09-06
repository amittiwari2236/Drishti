"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

const COLORS = [
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f97316",
];

export type DelayCategoryStat = {
  category: string;
  count: number;
  totalDays: number;
};

export function DelayReasonChart({ data }: { data: DelayCategoryStat[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delay Causes Distribution</CardTitle>
          <CardDescription className="text-xs">
            Frequency of reported impediment categories across progress updates
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-sm text-muted-foreground">
          No delay records logged yet across monitored projects.
        </CardContent>
      </Card>
    );
  }

  // Format short names for chart labels
  const formattedData = data.map((d) => ({
    name: d.category.length > 20 ? d.category.slice(0, 18) + "…" : d.category,
    fullName: d.category,
    occurrences: d.count,
    days: d.totalDays,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Delay Causes Distribution</CardTitle>
            <CardDescription className="text-xs">
              Reported impediment categories & total impact days across monthly submissions
            </CardDescription>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            {data.reduce((sum, d) => sum + d.totalDays, 0)} Total Delay Days
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={120}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val: number, name: string) => [
                  name === "days" ? `${val} days` : `${val} reports`,
                  name === "days" ? "Estimated Delay" : "Frequency",
                ]}
                labelFormatter={(_, items) => items?.[0]?.payload?.fullName || ""}
              />
              <Bar dataKey="days" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                {formattedData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
