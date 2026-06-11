"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  valueColor: string;
  subtitle?: string;
}

function SummaryCard({
  title,
  value,
  icon,
  valueColor,
  subtitle,
}: SummaryCardProps) {
  return (
    <Card className="border-fintrak-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-fintrak-text-secondary font-medium">
              {title}
            </p>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-fintrak-text-secondary">{subtitle}</p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-fintrak-bg text-fintrak-text-secondary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SummaryCards() {
  const { totalIncome, totalExpenses, netBalance, savingRate, isLoading } =
    useDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-fintrak-border shadow-sm">
            <CardContent className="p-5">
              <div className="h-16 animate-pulse bg-fintrak-bg rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const isPositive = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Income"
        value={formatCurrency(totalIncome)}
        icon={<TrendingUp size={18} />}
        valueColor="text-fintrak-income"
        subtitle="This month"
      />
      <SummaryCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses)}
        icon={<TrendingDown size={18} />}
        valueColor="text-fintrak-expense"
        subtitle="This month"
      />
      <SummaryCard
        title="Net Balance"
        value={formatCurrency(Math.abs(netBalance))}
        icon={<Wallet size={18} />}
        valueColor={isPositive ? "text-fintrak-income" : "text-fintrak-expense"}
        subtitle={isPositive ? "Surplus this month" : "Deficit this month"}
      />
      <SummaryCard
        title="Saving Rate"
        value={`${savingRate}%`}
        icon={<PiggyBank size={18} />}
        valueColor={
          savingRate >= 20
            ? "text-fintrak-income"
            : savingRate >= 10
              ? "text-fintrak-warning"
              : "text-fintrak-expense"
        }
        subtitle="Of income saved"
      />
    </div>
  );
}
