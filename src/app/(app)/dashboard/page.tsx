import SummaryCards from "@/components/dashboard/SummaryCards";
import SpendingByCategory from "@/components/dashboard/SpendingByCategory";
import SpendingTrend from "@/components/dashboard/SpendingTrend";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import GoalsPreview from "@/components/dashboard/GoalsPreview";
import BudgetHealthPreview from "@/components/dashboard/BudgetHealthPreview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-fintrak-text-primary">
          Dashboard
        </h1>
        <p className="text-sm text-fintrak-text-secondary mt-1">
          Your financial snapshot
        </p>
      </div>

      {/* Summary cards */}
      <SummaryCards />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SpendingTrend />
        <SpendingByCategory />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentTransactions />
        </div>
        <div className="space-y-6">
          <GoalsPreview />
          <BudgetHealthPreview />
        </div>
      </div>
    </div>
  );
}
