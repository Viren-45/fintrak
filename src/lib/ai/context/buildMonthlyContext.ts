// src/lib/ai/context/buildMonthlyContext.ts

import type { Transaction } from "@/types";
import { isIncomeExpense } from "@/types";
import { calcNetBalance, calcSavingRate } from "@/lib/utils/calculations";

function getLastNMonths(n: number): string[] {
  const months = [];
  const now = new Date();

  for (let i = 0; i < n; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  }

  return months;
}

/**
 * Builds the monthly breakdown section of the AI context.
 * Includes current month details and last 6 months trend.
 * Transfers are excluded — they don't affect income/expense totals.
 */
export function buildMonthlyContext(transactions: Transaction[]): string {
  const months = getLastNMonths(6);
  const currentMonth = months[0];

  const sections: string[] = [];

  // Filter to income/expense only — transfers are excluded from all calculations
  const incomeExpenseOnly = transactions.filter(isIncomeExpense);

  // Current month detailed breakdown
  const currentExpenses = incomeExpenseOnly.filter(
    (t) => t.type === "expense" && t.date.startsWith(currentMonth),
  );
  const currentIncome = incomeExpenseOnly.filter(
    (t) => t.type === "income" && t.date.startsWith(currentMonth),
  );

  const totalExpenses = currentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = currentIncome.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = calcNetBalance(totalIncome, totalExpenses);
  const savingRate = calcSavingRate(totalIncome, totalExpenses);

  // Spending by category this month — safe because currentExpenses is IncomeExpenseTransaction[]
  const categoryMap: Record<string, number> = {};
  for (const t of currentExpenses) {
    categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount;
  }

  const categoryLines = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => `  - ${cat}: $${amount.toFixed(2)}`);

  sections.push(`=== CURRENT MONTH (${currentMonth}) ===
Total Income:   $${totalIncome.toFixed(2)}
Total Expenses: $${totalExpenses.toFixed(2)}
Net Balance:    ${netBalance >= 0 ? "+" : ""}$${netBalance.toFixed(2)}
Saving Rate:    ${savingRate}%

Spending by category:
${categoryLines.length > 0 ? categoryLines.join("\n") : "  No expenses this month"}`);

  // Last 6 months trend
  const trendLines = months.map((month) => {
    const inc = incomeExpenseOnly
      .filter((t) => t.type === "income" && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0);
    const exp = incomeExpenseOnly
      .filter((t) => t.type === "expense" && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0);
    const net = calcNetBalance(inc, exp);
    return `${month} | Income: $${inc.toFixed(2)} | Expenses: $${exp.toFixed(2)} | Net: ${net >= 0 ? "+" : ""}$${net.toFixed(2)}`;
  });

  sections.push(`=== LAST 6 MONTHS TREND ===
${trendLines.join("\n")}`);

  return sections.join("\n\n");
}
