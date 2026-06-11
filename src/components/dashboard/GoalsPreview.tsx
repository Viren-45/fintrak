"use client";

import Link from "next/link";
import { useGoals } from "@/hooks/useGoals";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import { calcGoalProgress } from "@/lib/utils/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";

export default function GoalsPreview() {
  const { activeGoals, isLoading } = useGoals();

  // Show max 3 goals on dashboard
  const previewGoals = activeGoals.slice(0, 3);

  return (
    <Card className="border-fintrak-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-fintrak-text-primary">
            Goals
          </CardTitle>
          <Link
            href="/goals"
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
        ) : previewGoals.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-fintrak-text-secondary">
              No active goals. Create one in the Goals tab.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-fintrak-border">
            {previewGoals.map((goal) => {
              const progress = calcGoalProgress(
                goal.savedAmount,
                goal.targetAmount,
              );

              return (
                <div key={goal.id} className="px-5 py-3 space-y-2">
                  {/* Goal name and percentage */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-fintrak-text-primary truncate">
                      {goal.name}
                    </p>
                    <span className="text-xs font-medium text-fintrak-text-secondary shrink-0 ml-2">
                      {progress}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-fintrak-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-fintrak-accent transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  {/* Amounts */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-fintrak-text-secondary">
                      {formatCurrency(goal.savedAmount)} saved
                    </span>
                    <span className="text-xs text-fintrak-text-secondary">
                      {formatCurrency(goal.targetAmount)} target
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
