"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import type { TransactionType } from "@/types";

interface TransactionFiltersProps {
  type: TransactionType;
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
}

function getMonthOptions() {
  const options = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-CA", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });
  }

  return options;
}

export default function TransactionFilters({
  type,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedMonth,
  onMonthChange,
}: TransactionFiltersProps) {
  const { settings } = useSettings();
  const monthOptions = getMonthOptions();

  // Pull the right category list based on the active segment
  const categories =
    type === "expense" ? settings.expenseCategories : settings.incomeCategories;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <Input
        placeholder="Search by note or category..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border-fintrak-border focus-visible:ring-fintrak-accent sm:max-w-xs"
      />

      {/* Category filter */}
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent sm:w-44">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month filter */}
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent sm:w-44">
          <SelectValue placeholder="All months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All months</SelectItem>
          {monthOptions.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
