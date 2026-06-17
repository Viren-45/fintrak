// src/lib/ai/context/buildYearlyContext.ts

import type { Transaction } from "@/types";
import { isIncomeExpense } from "@/types";

/**
 * Builds the yearly summary section of the AI context.
 * Gives Claude accurate annual totals by category to answer
 * questions like "how much did I spend on groceries this year?"
 * Transfers are excluded — they don't affect income/expense totals.
 */
export function buildYearlyContext(transactions: Transaction[]): string {
  const currentYear = new Date().getFullYear().toString();

  // Filter to income/expense only once — transfers excluded from all yearly calculations
  const incomeExpenseOnly = transactions.filter(isIncomeExpense);

  const yearlyTransactions = incomeExpenseOnly.filter((t) =>
    t.date.startsWith(currentYear),
  );

  const yearlyExpenses = yearlyTransactions.filter((t) => t.type === "expense");
  const yearlyIncome = yearlyTransactions.filter((t) => t.type === "income");

  const totalExpenses = yearlyExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = yearlyIncome.reduce((sum, t) => sum + t.amount, 0);

  // Expenses by category for the year
  const expenseCategoryMap: Record<string, { total: number; count: number }> =
    {};
  for (const t of yearlyExpenses) {
    if (!expenseCategoryMap[t.category]) {
      expenseCategoryMap[t.category] = { total: 0, count: 0 };
    }
    expenseCategoryMap[t.category].total += t.amount;
    expenseCategoryMap[t.category].count += 1;
  }

  const expenseCategoryLines = Object.entries(expenseCategoryMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(
      ([cat, { total, count }]) =>
        `  - ${cat}: $${total.toFixed(2)} (${count} transaction${count > 1 ? "s" : ""})`,
    );

  // Income by category for the year
  const incomeCategoryMap: Record<string, { total: number; count: number }> =
    {};
  for (const t of yearlyIncome) {
    if (!incomeCategoryMap[t.category]) {
      incomeCategoryMap[t.category] = { total: 0, count: 0 };
    }
    incomeCategoryMap[t.category].total += t.amount;
    incomeCategoryMap[t.category].count += 1;
  }

  const incomeCategoryLines = Object.entries(incomeCategoryMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(
      ([cat, { total, count }]) =>
        `  - ${cat}: $${total.toFixed(2)} (${count} transaction${count > 1 ? "s" : ""})`,
    );

  return `
=== YEARLY SUMMARY (${currentYear}) ===
Total Income:   $${totalIncome.toFixed(2)}
Total Expenses: $${totalExpenses.toFixed(2)}
Net Saved:      $${(totalIncome - totalExpenses).toFixed(2)}

Expenses by category this year:
${expenseCategoryLines.length > 0 ? expenseCategoryLines.join("\n") : "  No expenses recorded"}

Income by category this year:
${incomeCategoryLines.length > 0 ? incomeCategoryLines.join("\n") : "  No income recorded"}
`.trim();
}
