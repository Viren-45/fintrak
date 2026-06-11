import { PieChart } from "lucide-react";

export default function BudgetsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fintrak-text-primary">
          Budgets
        </h1>
        <p className="text-sm text-fintrak-text-secondary mt-1">
          Set monthly spending limits per category
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="p-4 rounded-full bg-fintrak-bg border border-fintrak-border">
          <PieChart size={32} className="text-fintrak-text-secondary" />
        </div>
        <div>
          <p className="text-fintrak-text-primary font-semibold text-lg">
            Budgets coming soon
          </p>
          <p className="text-fintrak-text-secondary text-sm mt-1 max-w-sm">
            You&apos;ll be able to set monthly limits per category and track
            your spending health in real time.
          </p>
        </div>
      </div>
    </div>
  );
}
