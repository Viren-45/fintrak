"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dummy data — replaced with real historical net worth later
const DUMMY_DATA = [
  { date: "Nov 11", value: 200000 },
  { date: "Nov 15", value: 666500 },
  { date: "Nov 19", value: 800000 },
  { date: "Nov 23", value: 672000 },
  { date: "Nov 27", value: 675500 },
  { date: "Dec 1", value: 679000 },
  { date: "Dec 5", value: 100000 },
  { date: "Dec 9", value: 1000000 },
  { date: "Dec 11", value: 1500000 },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-fintrak-card border border-fintrak-border rounded-lg px-3 py-2 shadow-md">
      <p className="text-xs text-fintrak-text-secondary mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-fintrak-text-primary">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function NetWorthChart() {
  const currentNetWorth = DUMMY_DATA[DUMMY_DATA.length - 1].value;
  const firstValue = DUMMY_DATA[0].value;
  const change = currentNetWorth - firstValue;
  const changePercent = ((change / firstValue) * 100).toFixed(1);

  return (
    <Card className="border-fintrak-border shadow-sm">
      <CardContent className="p-5 space-y-4">
        {/* Net worth summary */}
        <div>
          <p className="text-xs font-medium text-fintrak-text-secondary uppercase tracking-wide">
            Net Worth
          </p>
          <div className="flex items-baseline gap-2 mt-3 flex-wrap">
            <span className="text-3xl font-bold text-fintrak-text-primary">
              {formatCurrency(currentNetWorth)}
            </span>
            <span className="text-sm font-medium text-fintrak-income">
              ↑ {formatCurrency(change)} ({changePercent}%)
            </span>
            <span className="text-sm text-fintrak-text-secondary">
              placeholder data
            </span>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={DUMMY_DATA}
            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#netWorthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
