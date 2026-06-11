"use client";

import { useCallback, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import {
  calcNetBalance,
  calcSavingRate,
  calcTotal,
} from "@/lib/utils/calculations";

// Returns spending totals grouped by category for a given month
function groupByCategory(
  transactions: { category: string; amount: number; date: string }[],
  month: string,
): { category: string; amount: number }[] {
  const filtered =
    month === "all"
      ? transactions
      : transactions.filter((t) => t.date.startsWith(month));

  const map: Record<string, number> = {};
  for (const t of filtered) {
    map[t.category] = (map[t.category] ?? 0) + t.amount;
  }

  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

// Returns monthly totals for the last N months
function getMonthlyTotals(
  transactions: { amount: number; date: string }[],
  months: number,
): { month: string; label: string; amount: number }[] {
  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-CA", {
      month: "short",
      year: "2-digit",
    });
    const amount = transactions
      .filter((t) => t.date.startsWith(value))
      .reduce((sum, t) => sum + t.amount, 0);
    result.push({ month: value, label, amount });
  }

  return result;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function useDashboard() {
  const { transactions: allTransactions, isLoading: loadingAll } =
    useTransactions();
  const currentMonth = getCurrentMonth();

  const expenses = useMemo(
    () => allTransactions.filter((t) => t.type === "expense"),
    [allTransactions],
  );

  const income = useMemo(
    () => allTransactions.filter((t) => t.type === "income"),
    [allTransactions],
  );

  // Current month totals
  const monthlyExpenses = useMemo(
    () => expenses.filter((t) => t.date.startsWith(currentMonth)),
    [expenses, currentMonth],
  );

  const monthlyIncome = useMemo(
    () => income.filter((t) => t.date.startsWith(currentMonth)),
    [income, currentMonth],
  );

  const totalExpenses = useMemo(
    () => calcTotal(monthlyExpenses.map((t) => t.amount)),
    [monthlyExpenses],
  );

  const totalIncome = useMemo(
    () => calcTotal(monthlyIncome.map((t) => t.amount)),
    [monthlyIncome],
  );

  const netBalance = useMemo(
    () => calcNetBalance(totalIncome, totalExpenses),
    [totalIncome, totalExpenses],
  );

  const savingRate = useMemo(
    () => calcSavingRate(totalIncome, totalExpenses),
    [totalIncome, totalExpenses],
  );

  // Last 5 transactions (income + expenses combined)
  const recentTransactions = useMemo(
    () => allTransactions.slice(0, 5),
    [allTransactions],
  );

  // Spending by category for a given month
  // Stable function references — useCallback prevents recreation on every render
  const getSpendingByCategory = useCallback(
    (month: string) => groupByCategory(expenses, month),
    [expenses],
  );

  const getExpenseTrend = useCallback(
    (months: number = 6) => getMonthlyTotals(expenses, months),
    [expenses],
  );

  const getIncomeTrend = useCallback(
    (months: number = 6) => getMonthlyTotals(income, months),
    [income],
  );

  return {
    isLoading: loadingAll,
    currentMonth,
    totalIncome,
    totalExpenses,
    netBalance,
    savingRate,
    recentTransactions,
    getSpendingByCategory,
    getExpenseTrend,
    getIncomeTrend,
  };
}
