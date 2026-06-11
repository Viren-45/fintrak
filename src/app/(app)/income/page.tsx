import IncomeList from "@/components/income/IncomeList";

export default function IncomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fintrak-text-primary">Income</h1>
        <p className="text-sm text-fintrak-text-secondary mt-1">
          Track all money coming in
        </p>
      </div>

      <IncomeList />
    </div>
  );
}
