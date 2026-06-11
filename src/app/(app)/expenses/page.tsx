import ExpenseList from "@/components/expenses/ExpenseList";

export default function ExpensesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fintrak-text-primary">
          Expenses
        </h1>
        <p className="text-sm text-fintrak-text-secondary mt-1">
          Track and manage your spending
        </p>
      </div>

      <ExpenseList />
    </div>
  );
}
