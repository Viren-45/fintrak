import { Suspense } from "react";
import TransactionTabs from "@/components/transactions/TransactionTabs";

export default function TransactionsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fintrak-text-primary">
          Transactions
        </h1>
        <p className="text-sm text-fintrak-text-secondary mt-1">
          Track your income, expenses, and transfers
        </p>
      </div>

      <Suspense>
        <TransactionTabs />
      </Suspense>
    </div>
  );
}
