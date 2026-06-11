import GoalList from "@/components/goals/GoalList";

export default function GoalsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fintrak-text-primary">Goals</h1>
        <p className="text-sm text-fintrak-text-secondary mt-1">
          Track your savings goals and stay on target
        </p>
      </div>

      <GoalList />
    </div>
  );
}
