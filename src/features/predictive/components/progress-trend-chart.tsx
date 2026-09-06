"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

export type ProgressTrendPoint = {
  date: string;
  actualProgress: number;
  expectedProgress: number | null;
  expenditure: number;
  delayDays: number | null;
};

export function ProgressTrendChart({
  data,
  totalCost,
}: {
  data: ProgressTrendPoint[];
  totalCost: number;
}) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress Trajectory (Actual vs Expected)</CardTitle>
          <CardDescription className="text-xs">
            Historical progression plotted against planned timeline
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-sm text-muted-foreground">
          No historical progress submissions available for this project.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Physical Progress Trajectory */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Physical Progress Trajectory</CardTitle>
          <CardDescription className="text-xs">
            Actual reported physical completion (%) vs planned linear projection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any, name: any) => [
                    `${typeof val === "number" ? val.toFixed(1) : val}%`,
                    name === "actualProgress" ? "Actual Progress" : "Planned Expected",
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-foreground font-medium">
                      {value === "actualProgress" ? "Actual Progress" : "Planned Timeline"}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="actualProgress"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6 }}
                />
                {data.some((d) => d.expectedProgress !== null) && (
                  <Line
                    type="monotone"
                    dataKey="expectedProgress"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: "#6366f1" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Cumulative Expenditure Trend */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Cumulative Expenditure Trend</CardTitle>
              <CardDescription className="text-xs">
                Financial burn vs total sanctioned cost envelope (₹{totalCost.toLocaleString()} Cr)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any) => [`₹${Number(val ?? 0).toLocaleString()} Cr`, "Cumulative Expenditure"]}
                />
                <Area
                  type="monotone"
                  dataKey="expenditure"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
