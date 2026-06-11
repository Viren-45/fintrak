"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type RangeOption = "3" | "6" | "12";

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-fintrak-card border border-fintrak-border rounded-lg px-3 py-2 shadow-md space-y-1">
      <p className="text-xs font-medium text-fintrak-text-secondary mb-1">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-fintrak-text-secondary capitalize">
            {entry.name}:
          </span>
          <span className="text-xs font-semibold text-fintrak-text-primary">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SpendingTrend() {
  const { getExpenseTrend, getIncomeTrend } = useDashboard();
  const [range, setRange] = useState<RangeOption>("6");

  const months = parseInt(range);
  const expenseTrend = getExpenseTrend(months);
  const incomeTrend = getIncomeTrend(months);

  // Merge income and expense data by month label
  const chartData = expenseTrend.map((exp, i) => ({
    month: exp.label,
    income: incomeTrend[i]?.amount ?? 0,
    expenses: exp.amount,
  }));

  const hasData = chartData.some((d) => d.income > 0 || d.expenses > 0);

  return (
    <Card className="border-fintrak-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base text-fintrak-text-primary">
            Income vs Expenses
          </CardTitle>
          <Select
            value={range}
            onValueChange={(val) => setRange(val as RangeOption)}
          >
            <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <div className="py-12 text-center">
            <p className="text-sm text-fintrak-text-secondary">
              No data available for this period.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E2E8F0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`
                }
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-fintrak-text-secondary capitalize">
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="income"
                name="income"
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="expenses"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
