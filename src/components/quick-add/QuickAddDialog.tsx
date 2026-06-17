// src/components/quick-add/QuickAddDialog.tsx

"use client";

import { useState } from "react";
import { useQuickAdd } from "./QuickAddProvider";
import { useAccounts } from "@/hooks/useAccounts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import Link from "next/link";
import IncomeExpenseForm from "./IncomeExpenseForm";
import TransferForm from "./TransferForm";
import type { QuickAddType } from "@/types";

export default function QuickAddDialog() {
  const { isOpen, defaultType, closeDialog } = useQuickAdd();
  const { accounts, isLoading: accountsLoading } = useAccounts();

  const [activeType, setActiveType] = useState<QuickAddType>(defaultType);

  // Sync active type when dialog opens with a different default
  const [lastDefaultType, setLastDefaultType] = useState(defaultType);
  if (isOpen && defaultType !== lastDefaultType) {
    setLastDefaultType(defaultType);
    setActiveType(defaultType);
  }

  const hasNoAccounts = !accountsLoading && accounts.length === 0;

  function handleClose() {
    closeDialog();
    setActiveType("expense");
  }

  function handleSuccess() {
    handleClose();
  }

  const toggleOptions: { type: QuickAddType; label: string }[] = [
    { type: "expense", label: "Expense" },
    { type: "income", label: "Income" },
    { type: "transfer", label: "Transfer" },
  ];

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
            {/* Three-way type toggle */}
            <div className="flex rounded-lg border border-fintrak-border p-1 gap-1">
              {toggleOptions.map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`
                    flex-1 py-1.5 rounded-md text-sm font-medium
                    transition-colors duration-150 cursor-pointer
                    ${
                      activeType === type
                        ? type === "expense"
                          ? "bg-fintrak-expense text-white"
                          : type === "income"
                            ? "bg-fintrak-income text-white"
                            : "bg-fintrak-accent text-white"
                        : "text-fintrak-text-secondary hover:text-fintrak-text-primary"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Render the correct form based on active type */}
            {activeType === "transfer" ? (
              <TransferForm onSuccess={handleSuccess} />
            ) : (
              <IncomeExpenseForm
                key={activeType}
                type={activeType}
                onSuccess={handleSuccess}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
