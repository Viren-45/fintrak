// src/lib/utils/calculations.ts

/**
 * Calculate percentage of goal completion
 * e.g. saved=500, target=1000 → 50
 */
export function calcGoalProgress(
  savedAmount: number,
  targetAmount: number,
): number {
  if (targetAmount <= 0) return 0;
  return Math.min(Math.round((savedAmount / targetAmount) * 100), 100);
}

/**
 * Calculate days remaining until a deadline
 * Returns null if no deadline set
 */
export function calcDaysRemaining(deadline?: string): number | null {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline + "T00:00:00");
  const diff = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Project completion date based on current saving rate
 * Returns null if not enough data to project
 */
export function calcProjectedCompletion(
  savedAmount: number,
  targetAmount: number,
  createdAt: string,
): string | null {
  const remaining = targetAmount - savedAmount;
  if (remaining <= 0) return null;

  const created = new Date(createdAt);
  const now = new Date();
  const daysElapsed = Math.max(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    1,
  );

  const dailyRate = savedAmount / daysElapsed;
  if (dailyRate <= 0) return null;

  const daysNeeded = remaining / dailyRate;
  const projected = new Date();
  projected.setDate(projected.getDate() + Math.ceil(daysNeeded));

  return projected.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculate net balance (income - expenses)
 */
export function calcNetBalance(
  totalIncome: number,
  totalExpenses: number,
): number {
  return totalIncome - totalExpenses;
}

/**
 * Calculate total amount from a list of transactions
 */
export function calcTotal(amounts: number[]): number {
  return amounts.reduce((sum, amount) => sum + amount, 0);
}

/**
 * Calculate saving rate as a percentage
 * e.g. income=5000, expenses=3000 → 40
 */
export function calcSavingRate(
  totalIncome: number,
  totalExpenses: number,
): number {
  if (totalIncome <= 0) return 0;
  const saved = totalIncome - totalExpenses;
  return Math.max(Math.round((saved / totalIncome) * 100), 0);
}
