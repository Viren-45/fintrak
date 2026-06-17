"use client";

import { useState } from "react";
import { useQuickAdd } from "./QuickAddProvider";
import { useSettings } from "@/hooks/useSettings";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { getBankById } from "@/lib/banks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import type { QuickAddType, Account } from "@/types";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getEmptyForm(type: QuickAddType) {
  return {
    type,
    amount: "",
    category: "",
    accountId: "",
    date: getTodayDate(),
    note: "",
    error: "",
  };
}

// Builds a readable account label for the dropdown
function getAccountLabel(account: Account): string {
  if (account.nickname) return account.nickname;
  if (account.bankId) {
    const bank = getBankById(account.bankId);
    if (bank) return bank.name;
  }
  return account.type.charAt(0).toUpperCase() + account.type.slice(1);
}

export default function QuickAddDialog() {
  const { isOpen, defaultType, closeDialog } = useQuickAdd();
  const { settings, isLoading: settingsLoading } = useSettings();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { addTransaction, isAdding } = useTransactions();

  const [form, setForm] = useState(() => getEmptyForm(defaultType));

  const [lastDefaultType, setLastDefaultType] = useState(defaultType);
  if (isOpen && defaultType !== lastDefaultType) {
    setLastDefaultType(defaultType);
    setForm(getEmptyForm(defaultType));
  }

  const categories =
    form.type === "expense"
      ? settings.expenseCategories
      : settings.incomeCategories;

  const isLoading = settingsLoading || accountsLoading;
  const hasNoAccounts = !accountsLoading && accounts.length === 0;

  function handleTypeChange(newType: QuickAddType) {
    setForm((prev) => ({ ...prev, type: newType, category: "" }));
  }

  function handleClose() {
    closeDialog();
    setForm(getEmptyForm("expense"));
  }

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
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        accountId: form.accountId,
        date: form.date,
        note: form.note || undefined,
      });
      handleClose();
    } catch {
      setForm((prev) => ({
        ...prev,
        error: "Something went wrong. Please try again.",
      }));
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-fintrak-card border-fintrak-border">
        <DialogHeader>
          <DialogTitle className="text-fintrak-text-primary text-lg font-semibold">
            Add Transaction
          </DialogTitle>
        </DialogHeader>

        {hasNoAccounts ? (
          // No accounts yet — nudge the user to create one first
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="p-3 rounded-full bg-fintrak-bg border border-fintrak-border">
              <Wallet size={28} className="text-fintrak-text-secondary" />
            </div>
            <div>
              <p className="text-fintrak-text-primary font-semibold">
                Add an account first
              </p>
              <p className="text-fintrak-text-secondary text-sm mt-1">
                You need at least one account before logging transactions.
              </p>
            </div>
            <Link href="/accounts" onClick={handleClose}>
              <Button className="bg-fintrak-accent hover:bg-fintrak-accent/90 text-white cursor-pointer">
                Go to Accounts
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Type toggle */}
            <div className="flex rounded-lg border border-fintrak-border p-1 gap-1">
              {(["expense", "income"] as QuickAddType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`
                    flex-1 py-1.5 rounded-md text-sm font-medium capitalize
                    transition-colors duration-150 cursor-pointer
                    ${
                      form.type === t
                        ? t === "expense"
                          ? "bg-fintrak-expense text-white"
                          : "bg-fintrak-income text-white"
                        : "text-fintrak-text-secondary hover:text-fintrak-text-primary"
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>

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
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="cursor-pointer"
                        >
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
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-fintrak-border text-fintrak-text-secondary cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 bg-fintrak-accent hover:bg-fintrak-accent/90 text-white cursor-pointer"
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
