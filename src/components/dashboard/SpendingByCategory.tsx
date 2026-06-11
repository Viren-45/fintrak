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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Donut chart colors — cycles through these for each category
const CHART_COLORS = [
  "#10B981", // emerald
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#8B5CF6", // purple
  "#EF4444", // red
  "#06B6D4", // cyan
  "#F97316", // orange
  "#84CC16", // lime
];

function getMonthOptions() {
  const options = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-CA", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });
  }

  return options;
}

// Custom tooltip shown on hover
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-fintrak-card border border-fintrak-border rounded-lg px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-fintrak-text-primary">
        {payload[0].name}
      </p>
      <p className="text-sm text-fintrak-expense font-semibold">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function SpendingByCategory() {
  const { getSpendingByCategory, currentMonth } = useDashboard();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const monthOptions = getMonthOptions();

  const data = getSpendingByCategory(selectedMonth);
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Card className="border-fintrak-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base text-fintrak-text-primary">
            Spending by Category
          </CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-fintrak-text-secondary">
              No expenses recorded for this period.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Donut chart */}
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="category"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-fintrak-text-secondary">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Category breakdown list */}
            <div className="space-y-2">
              {data.map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-sm text-fintrak-text-primary truncate">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-fintrak-text-secondary">
                      {total > 0 ? Math.round((item.amount / total) * 100) : 0}%
                    </span>
                    <span className="text-sm font-medium text-fintrak-text-primary">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
