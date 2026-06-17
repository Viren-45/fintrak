// src/components/quick-add/TransferForm.tsx

"use client";

import { useState } from "react";
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

interface TransferFormProps {
  onSuccess: () => void;
}

export default function TransferForm({ onSuccess }: TransferFormProps) {
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { addTransaction, isAdding } = useTransactions();

  const [form, setForm] = useState({
    amount: "",
    fromAccountId: "",
    toAccountId: "",
    date: getTodayDate(),
    note: "",
    error: "",
  });

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
    if (!form.fromAccountId) {
      setForm((prev) => ({ ...prev, error: "Please select a From account" }));
      return;
    }
    if (!form.toAccountId) {
      setForm((prev) => ({ ...prev, error: "Please select a To account" }));
      return;
    }
    if (form.fromAccountId === form.toAccountId) {
      setForm((prev) => ({
        ...prev,
        error: "From and To accounts must be different",
      }));
      return;
    }

    try {
      await addTransaction({
        type: "transfer",
        amount: Number(form.amount),
        fromAccountId: form.fromAccountId,
        toAccountId: form.toAccountId,
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

      {/* From Account */}
      <div className="space-y-1.5">
        <Label className="text-fintrak-text-primary text-sm font-medium">
          From
        </Label>
        {accountsLoading ? (
          <div className="flex items-center gap-2 text-fintrak-text-secondary text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Loading...
          </div>
        ) : (
          <Select
            value={form.fromAccountId}
            onValueChange={(val) =>
              setForm((prev) => ({ ...prev, fromAccountId: val }))
            }
          >
            <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent cursor-pointer">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem
                  key={account.id}
                  value={account.id}
                  className="cursor-pointer"
                  // Disable if already selected as To account
                  disabled={account.id === form.toAccountId}
                >
                  {getAccountLabel(account)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* To Account */}
      <div className="space-y-1.5">
        <Label className="text-fintrak-text-primary text-sm font-medium">
          To
        </Label>
        {accountsLoading ? (
          <div className="flex items-center gap-2 text-fintrak-text-secondary text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Loading...
          </div>
        ) : (
          <Select
            value={form.toAccountId}
            onValueChange={(val) =>
              setForm((prev) => ({ ...prev, toAccountId: val }))
            }
          >
            <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent cursor-pointer">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem
                  key={account.id}
                  value={account.id}
                  className="cursor-pointer"
                  // Disable if already selected as From account
                  disabled={account.id === form.fromAccountId}
                >
                  {getAccountLabel(account)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
