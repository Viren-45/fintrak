import type { Goal } from "@/types";
import {
  calcGoalProgress,
  calcDaysRemaining,
  calcProjectedCompletion,
} from "@/lib/utils/calculations";

/**
 * Builds the goals section of the AI context.
 * Includes all active goals with progress, deadlines, and projections.
 */
export function buildGoalsContext(goals: Goal[]): string {
  const activeGoals = goals.filter((g) => g.status === "active");

  if (activeGoals.length === 0) {
    return `
=== SAVINGS GOALS ===
No active goals.
`.trim();
  }

  const lines = activeGoals.map((goal) => {
    const progress = calcGoalProgress(goal.savedAmount, goal.targetAmount);
    const daysRemaining = calcDaysRemaining(goal.deadline);
    const projected = calcProjectedCompletion(
      goal.savedAmount,
      goal.targetAmount,
      goal.createdAt,
    );

    const parts = [
      `- ${goal.name}`,
      `  Saved: $${goal.savedAmount.toFixed(2)} of $${goal.targetAmount.toFixed(2)} (${progress}%)`,
      `  Remaining: $${Math.max(goal.targetAmount - goal.savedAmount, 0).toFixed(2)}`,
    ];

    if (goal.description) {
      parts.push(`  Description: ${goal.description}`);
    }

    if (daysRemaining !== null) {
      parts.push(
        daysRemaining < 0
          ? `  Deadline: OVERDUE by ${Math.abs(daysRemaining)} days`
          : `  Deadline: ${daysRemaining} days remaining`,
      );
    }

    if (projected) {
      parts.push(`  Projected completion at current rate: ${projected}`);
    }

    return parts.join("\n");
  });

  return `
=== SAVINGS GOALS ===
${lines.join("\n\n")}
`.trim();
}
