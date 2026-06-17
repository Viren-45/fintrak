"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAccounts } from "@/hooks/useAccounts";
import { BANKS } from "@/lib/banks";
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
import {
  Loader2,
  Landmark,
  PiggyBank,
  CreditCard,
  Wallet,
  TrendingUp,
} from "lucide-react";
import type { Account, AccountType } from "@/types";

interface AccountFormDialogProps {
  open: boolean;
  onClose: () => void;
  account?: Account | null; // pass an account to edit, omit/null to add
}

// Account type options with icon + accent color
const ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    value: "chequing",
    label: "Chequing",
    icon: <Landmark size={18} />,
    accent: "#3B82F6",
  },
  {
    value: "savings",
    label: "Savings",
    icon: <PiggyBank size={18} />,
    accent: "#10B981",
  },
  {
    value: "credit_card",
    label: "Credit Card",
    icon: <CreditCard size={18} />,
    accent: "#8B5CF6",
  },
  {
    value: "cash",
    label: "Cash",
    icon: <Wallet size={18} />,
    accent: "#F59E0B",
  },
  {
    value: "investment",
    label: "Investment",
    icon: <TrendingUp size={18} />,
    accent: "#06B6D4",
  },
];

// Types that have a bank + account number
const BANK_BACKED: AccountType[] = ["chequing", "savings", "credit_card"];

function getEmptyForm() {
  return {
    type: "chequing" as AccountType,
    bankId: "",
    nickname: "",
    lastFour: "",
    balance: "",
    creditLimit: "",
    error: "",
  };
}

export default function AccountFormDialog({
  open,
  onClose,
  account,
}: AccountFormDialogProps) {
  const { addAccount, updateAccount, isAdding, isUpdating } = useAccounts();
  const isEditing = !!account;

  const [form, setForm] = useState(getEmptyForm);

  // Track the dialog "session" so we repopulate the form once each time it opens —
  // without useEffect, avoiding React 19 cascading-render warnings
  const [lastOpenState, setLastOpenState] = useState(false);
  if (open && !lastOpenState) {
    setLastOpenState(true);

    if (account) {
      // Credit card stored negative — show positive "owed" in the form
      const displayBalance =
        account.type === "credit_card"
          ? Math.abs(account.openingBalance)
          : account.openingBalance;

      setForm({
        type: account.type,
        bankId: account.bankId ?? "",
        nickname: account.nickname ?? "",
        lastFour: account.lastFour ?? "",
        balance: String(displayBalance),
        creditLimit: account.creditLimit ? String(account.creditLimit) : "",
        error: "",
      });
    } else {
      setForm(getEmptyForm());
    }
  } else if (!open && lastOpenState) {
    setLastOpenState(false);
  }

  const isBankBacked = BANK_BACKED.includes(form.type);
  const isCreditCard = form.type === "credit_card";
  const isSaving = isAdding || isUpdating;

  const balanceLabel = isCreditCard
    ? "Current balance owed"
    : "Opening balance";

  function handleClose() {
    onClose();
  }

  function handleTypeChange(newType: AccountType) {
    // Clear bank-specific fields if switching to a non-bank type
    setForm((prev) => ({
      ...prev,
      type: newType,
      bankId: BANK_BACKED.includes(newType) ? prev.bankId : "",
      lastFour: BANK_BACKED.includes(newType) ? prev.lastFour : "",
      creditLimit: newType === "credit_card" ? prev.creditLimit : "",
      error: "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForm((prev) => ({ ...prev, error: "" }));

    // Validate bank for bank-backed types
    if (isBankBacked && !form.bankId) {
      setForm((prev) => ({ ...prev, error: "Please select a bank" }));
      return;
    }

    // Validate last 4 if provided
    if (form.lastFour && !/^\d{4}$/.test(form.lastFour)) {
      setForm((prev) => ({
        ...prev,
        error: "Last 4 digits must be exactly 4 numbers",
      }));
      return;
    }

    const balanceNum = Number(form.balance) || 0;
    if (balanceNum < 0) {
      setForm((prev) => ({ ...prev, error: "Balance cannot be negative" }));
      return;
    }

    // Credit card balance stored negative (debt)
    const signedBalance = isCreditCard ? -balanceNum : balanceNum;

    const creditLimitNum = form.creditLimit
      ? Number(form.creditLimit)
      : undefined;

    try {
      const payload = {
        type: form.type,
        bankId: isBankBacked ? form.bankId : undefined,
        nickname: form.nickname.trim() || undefined,
        lastFour: isBankBacked && form.lastFour ? form.lastFour : undefined,
        openingBalance: signedBalance,
        creditLimit: isCreditCard ? creditLimitNum : undefined,
      };

      if (isEditing && account) {
        await updateAccount({ id: account.id, ...payload });
        toast.success("Account updated");
      } else {
        await addAccount(payload);
        toast.success("Account added");
      }

      handleClose();
    } catch {
      setForm((prev) => ({
        ...prev,
        error: "Something went wrong. Please try again.",
      }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md bg-fintrak-card border-fintrak-border">
        <DialogHeader>
          <DialogTitle className="text-fintrak-text-primary text-lg font-semibold">
            {isEditing ? "Edit Account" : "Add Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          {form.error && (
            <p className="text-sm text-fintrak-expense">{form.error}</p>
          )}

          {/* Account type — visual card selector */}
          <div className="space-y-2">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Account type
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((t) => {
                const isActive = form.type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTypeChange(t.value)}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-150 cursor-pointer"
                    style={{
                      borderColor: isActive ? t.accent : "#E2E8F0",
                      backgroundColor: isActive
                        ? `${t.accent}0D`
                        : "transparent",
                      color: isActive ? t.accent : "#64748B",
                    }}
                  >
                    {t.icon}
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bank — only for bank-backed types */}
          {isBankBacked && (
            <div className="space-y-1.5">
              <Label className="text-fintrak-text-primary text-sm font-medium">
                Bank
              </Label>
              <Select
                value={form.bankId}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, bankId: val }))
                }
              >
                <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent cursor-pointer">
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem
                      key={bank.id}
                      value={bank.id}
                      className="cursor-pointer"
                    >
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nickname — always shown */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Nickname{" "}
              <span className="text-fintrak-text-secondary font-normal">
                (optional)
              </span>
            </Label>
            <Input
              placeholder="e.g. Everyday Spending"
              value={form.nickname}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nickname: e.target.value }))
              }
              className="border-fintrak-border focus-visible:ring-fintrak-accent"
            />
          </div>

          {/* Last 4 — only for bank-backed types */}
          {isBankBacked && (
            <div className="space-y-1.5">
              <Label className="text-fintrak-text-primary text-sm font-medium">
                Last 4 digits{" "}
                <span className="text-fintrak-text-secondary font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={form.lastFour}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    lastFour: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className="border-fintrak-border focus-visible:ring-fintrak-accent"
              />
            </div>
          )}

          {/* Balance — always shown */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              {balanceLabel}
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
                value={form.balance}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, balance: e.target.value }))
                }
                className="pl-7 border-fintrak-border focus-visible:ring-fintrak-accent"
              />
            </div>
            {isCreditCard && (
              <p className="text-xs text-fintrak-text-secondary">
                Enter what you currently owe. Leave 0 if paid off.
              </p>
            )}
          </div>

          {/* Credit limit — only for credit cards */}
          {isCreditCard && (
            <div className="space-y-1.5">
              <Label className="text-fintrak-text-primary text-sm font-medium">
                Credit limit{" "}
                <span className="text-fintrak-text-secondary font-normal">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fintrak-text-secondary text-sm">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="5,000.00"
                  value={form.creditLimit}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      creditLimit: e.target.value,
                    }))
                  }
                  className="pl-7 border-fintrak-border focus-visible:ring-fintrak-accent"
                />
              </div>
            </div>
          )}

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
              disabled={isSaving}
              className="flex-1 bg-fintrak-accent hover:bg-fintrak-accent/90 text-white cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  {isEditing ? "Saving..." : "Adding..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Account"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
