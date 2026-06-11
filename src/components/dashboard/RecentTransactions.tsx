"use client";

import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";

export default function RecentTransactions() {
  const { recentTransactions, isLoading } = useDashboard();

  return (
    <Card className="border-fintrak-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-fintrak-text-primary">
            Recent Transactions
          </CardTitle>
          <Link
            href="/expenses"
            className="flex items-center gap-1 text-xs text-fintrak-accent hover:underline"
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2
              size={20}
              className="animate-spin text-fintrak-text-secondary"
            />
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-fintrak-text-secondary">
              No transactions yet. Tap + to add one.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-fintrak-border">
            {recentTransactions.map((t) => {
              const isExpense = t.type === "expense";
              const formattedDate = new Date(
                t.date + "T00:00:00",
              ).toLocaleDateString("en-CA", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isExpense ? "bg-fintrak-expense" : "bg-fintrak-income"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fintrak-text-primary truncate">
                        {t.category}
                      </p>
                      {t.note && (
                        <p className="text-xs text-fintrak-text-secondary truncate">
                          {t.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm font-semibold ${
                        isExpense
                          ? "text-fintrak-expense"
                          : "text-fintrak-income"
                      }`}
                    >
                      {isExpense ? "-" : "+"}
                      {formatCurrency(t.amount)}
                    </span>
                    <span className="text-xs text-fintrak-text-secondary w-14 text-right">
                      {formattedDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
