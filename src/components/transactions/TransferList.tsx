// src/components/transactions/TransferList.tsx

"use client";

import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { isTransfer } from "@/types";
import TransferItem from "./TransferItem";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeftRight, Search } from "lucide-react";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getLastSixMonths(): { value: string; label: string }[] {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-CA", {
      month: "short",
      year: "numeric",
    });
    months.push({ value, label });
  }
  return months;
}

export default function TransferList() {
  const { transactions, isLoading, error } = useTransactions();
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const months = useMemo(() => getLastSixMonths(), []);

  // Filter to transfers only
  const transfers = useMemo(
    () => transactions.filter(isTransfer),
    [transactions],
  );

  const filtered = useMemo(() => {
    return transfers.filter((t) => {
      const matchesMonth =
        selectedMonth === "all" || t.date.startsWith(selectedMonth);
      const matchesSearch =
        search === "" ||
        t.note?.toLowerCase().includes(search.toLowerCase()) ||
        t.amount.toString().includes(search);
      return matchesMonth && matchesSearch;
    });
  }, [transfers, search, selectedMonth]);

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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fintrak-text-secondary"
          />
          <Input
            placeholder="Search by note or amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 border-fintrak-border focus-visible:ring-fintrak-accent text-sm"
          />
        </div>

        {/* Month filter */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-9 rounded-md border border-fintrak-border bg-fintrak-card px-3 text-sm text-fintrak-text-primary focus:outline-none focus:ring-1 focus:ring-fintrak-accent cursor-pointer"
        >
          <option value="all">All time</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <Card className="border-fintrak-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
              <div className="p-4 rounded-full bg-fintrak-bg border border-fintrak-border">
                <ArrowLeftRight
                  size={24}
                  className="text-fintrak-text-secondary"
                />
              </div>
              <div>
                <p className="text-fintrak-text-primary font-semibold">
                  {transfers.length === 0
                    ? "No transfers yet"
                    : "No results match your filters"}
                </p>
                <p className="text-fintrak-text-secondary text-sm mt-1">
                  {transfers.length === 0
                    ? "Use the + button and select Transfer to move money between accounts."
                    : "Try adjusting the month or search term."}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-fintrak-border">
              {filtered.map((transfer) => (
                <TransferItem key={transfer.id} transfer={transfer} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
