"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import TransactionItem from "@/components/transactions/TransactionItem";
import ExpenseFilters from "./ExpenseFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Get current month as default filter e.g. "2025-06"
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function ExpenseList() {
  const { transactions, isLoading, error } = useTransactions("expense");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Filter transactions based on search, category, and month
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.note?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || t.category === selectedCategory;

      const matchesMonth =
        selectedMonth === "all" || t.date.startsWith(selectedMonth);

      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [transactions, search, selectedCategory, selectedMonth]);

  // Monthly total for filtered transactions
  const monthlyTotal = useMemo(() => {
    return filtered.reduce((sum, t) => sum + t.amount, 0);
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2
          size={24}
          className="animate-spin text-fintrak-text-secondary"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-fintrak-expense/30 rounded-md px-4 py-3">
        <p className="text-sm text-fintrak-expense">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Monthly total */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-fintrak-expense">
          {formatCurrency(monthlyTotal)}
        </span>
        <span className="text-sm text-fintrak-text-secondary">
          {filtered.length} {filtered.length === 1 ? "expense" : "expenses"}
          {selectedMonth !== "all" ? " this month" : " total"}
        </span>
      </div>

      {/* Filters */}
      <ExpenseFilters
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* List */}
      <Card className="border-fintrak-border shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-fintrak-text-secondary text-sm">
                {transactions.length === 0
                  ? "No expenses yet. Tap + to add one."
                  : "No expenses match your filters."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-fintrak-border">
              {filtered.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
