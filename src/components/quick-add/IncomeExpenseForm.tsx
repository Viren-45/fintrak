// src/components/quick-add/IncomeExpenseForm.tsx

"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { getBankById } from "@/lib/banks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Account } from "@/types";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getAccountLabel(account: Account): string {
  if (account.nickname) return account.nickname;
  if (account.bankId) {
    const bank = getBankById(account.bankId);
    if (bank) return bank.name;
  }
  return account.type.charAt(0).toUpperCase() + account.type.slice(1);
}

interface IncomeExpenseFormProps {
  type: "expense" | "income";
  onSuccess: () => void;
}

export default function IncomeExpenseForm({
  type,
  onSuccess,
}: IncomeExpenseFormProps) {
  const { settings, isLoading: settingsLoading } = useSettings();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { addTransaction, isAdding } = useTransactions();

  const [form, setForm] = useState({
    amount: "",
    category: "",
    accountId: "",
    date: getTodayDate(),
    note: "",
    error: "",
  });

  const categories =
    type === "expense" ? settings.expenseCategories : settings.incomeCategories;

  const isLoading = settingsLoading || accountsLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForm((prev) => ({ ...prev, error: "" }));

    if (
      !form.amount ||
      isNaN(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setForm((prev) => ({ ...prev, error: "Please enter a valid amount" }));
      return;
    }
    if (!form.category) {
      setForm((prev) => ({ ...prev, error: "Please select a category" }));
      return;
    }
    if (!form.accountId) {
      setForm((prev) => ({ ...prev, error: "Please select an account" }));
      return;
    }

    try {
      await addTransaction({
        type,
        amount: Number(form.amount),
        category: form.category,
        accountId: form.accountId,
        date: form.date,
        note: form.note || undefined,
      });
      onSuccess();
    } catch {
      setForm((prev) => ({
        ...prev,
        error: "Something went wrong. Please try again.",
      }));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.error && (
        <p className="text-sm text-fintrak-expense">{form.error}</p>
      )}

      {/* Amount */}
      <div className="space-y-1.5">
        <Label className="text-fintrak-text-primary text-sm font-medium">
          Amount
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fintrak-text-secondary text-sm">
            $
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            className="pl-7 border-fintrak-border focus-visible:ring-fintrak-accent"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-fintrak-text-primary text-sm font-medium">
          Category
        </Label>
        {isLoading ? (
          <div className="flex items-center gap-2 text-fintrak-text-secondary text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Loading...
          </div>
        ) : (
          <Select
            value={form.category}
            onValueChange={(val) =>
              setForm((prev) => ({ ...prev, category: val }))
            }
          >
            <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent cursor-pointer">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="cursor-pointer">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Account */}
      <div className="space-y-1.5">
        <Label className="text-fintrak-text-primary text-sm font-medium">
          Account
        </Label>
        <Select
          value={form.accountId}
          onValueChange={(val) =>
            setForm((prev) => ({ ...prev, accountId: val }))
          }
        >
          <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent cursor-pointer">
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem
                key={account.id}
                value={account.id}
                className="cursor-pointer"
              >
                {getAccountLabel(account)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label className="text-fintrak-text-primary text-sm font-medium">
          Date
        </Label>
        <Input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, date: e.target.value }))
          }
          className="border-fintrak-border focus-visible:ring-fintrak-accent"
          required
        />
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label className="text-fintrak-text-primary text-sm font-medium">
          Note{" "}
          <span className="text-fintrak-text-secondary font-normal">
            (optional)
          </span>
        </Label>
        <Input
          type="text"
          placeholder="Add a note..."
          value={form.note}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, note: e.target.value }))
          }
          className="border-fintrak-border focus-visible:ring-fintrak-accent"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          disabled={isAdding}
          className="w-full bg-fintrak-accent hover:bg-fintrak-accent/90 text-white cursor-pointer"
        >
          {isAdding ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
}
