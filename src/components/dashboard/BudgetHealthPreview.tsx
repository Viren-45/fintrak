import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, PieChart } from "lucide-react";

export default function BudgetHealthPreview() {
  return (
    <Card className="border-fintrak-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-fintrak-text-primary">
            Budget Health
          </CardTitle>
          <Link
            href="/budgets"
            className="flex items-center gap-1 text-xs text-fintrak-accent hover:underline"
          >
            Set up budgets
            <ArrowRight size={12} />
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
          <div className="p-3 rounded-full bg-fintrak-bg">
            <PieChart size={24} className="text-fintrak-text-secondary" />
          </div>
          <div>
            <p className="text-sm font-medium text-fintrak-text-primary">
              Budgets not set up yet
            </p>
            <p className="text-xs text-fintrak-text-secondary mt-1">
              Set monthly limits per category to track your spending health
              here.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
