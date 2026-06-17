// src/components/transactions/TransactionItem.tsx
"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import { useAccounts } from "@/hooks/useAccounts";
import { getBankById, getBankLogoUrl } from "@/lib/banks";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import { formatDate } from "@/lib/utils/formatdate";
import { ACCOUNT_TYPE_META } from "@/lib/accountMeta";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Pencil, Trash2, Loader2 } from "lucide-react";
import type { IncomeExpenseTransaction, Account } from "@/types";

function getAccountLabel(account: Account): string {
  if (account.nickname) return account.nickname;
  if (account.bankId) {
    const bank = getBankById(account.bankId);
    if (bank) return bank.name;
  }
  return account.type.charAt(0).toUpperCase() + account.type.slice(1);
}

interface TransactionItemProps {
  transaction: IncomeExpenseTransaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const type = transaction.type;
  const { updateTransaction, deleteTransaction, isUpdating, isDeleting } =
    useTransactions(type);
  const { settings } = useSettings();
  const { accounts } = useAccounts();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [editForm, setEditForm] = useState({
    amount: String(transaction.amount),
    category: transaction.category,
    accountId: transaction.accountId,
    date: transaction.date,
    note: transaction.note ?? "",
  });

  const isExpense = type === "expense";
  const amountColor = isExpense
    ? "text-fintrak-expense"
    : "text-fintrak-income";
  const amountPrefix = isExpense ? "−" : "+";
  const categories = isExpense
    ? settings.expenseCategories
    : settings.incomeCategories;

  const account = accounts.find((a) => a.id === transaction.accountId);
  const logoUrl = account?.bankId ? getBankLogoUrl(account.bankId) : null;
  const accountLabel = account ? getAccountLabel(account) : "Unknown account";

  async function handleUpdate() {
    try {
      await updateTransaction({
        id: transaction.id,
        type,
        amount: Number(editForm.amount),
        category: editForm.category,
        accountId: editForm.accountId,
        date: editForm.date,
        note: editForm.note || undefined,
      });
      toast.success("Transaction updated");
      setShowEditDialog(false);
    } catch {
      toast.error("Failed to update transaction", {
        description: "Please try again.",
      });
    }
  }

  async function handleDelete() {
    try {
      await deleteTransaction(transaction.id);
      toast.success("Transaction deleted");
      setShowDeleteDialog(false);
    } catch {
      toast.error("Failed to delete transaction", {
        description: "Please try again.",
      });
    }
  }

  return (
    <>
      {/* Transaction row */}
      <div className="group flex items-center gap-3 px-4 py-3.5 hover:bg-fintrak-bg transition-colors">
        {/* Logo / type icon */}
        <div className="w-10 h-10 rounded-lg bg-fintrak-bg border border-fintrak-border shrink-0 flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : account ? (
            <span className="text-fintrak-text-secondary">
              {ACCOUNT_TYPE_META[account.type].icon}
            </span>
          ) : null}
        </div>

        {/* Middle — category, account, note */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fintrak-text-primary truncate">
            {transaction.category}
          </p>
          <p className="text-xs text-fintrak-text-secondary truncate">
            {accountLabel}
            {transaction.note ? ` · ${transaction.note}` : ""}
          </p>
        </div>

        {/* Right — amount, date, actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className={`text-sm font-semibold ${amountColor}`}>
              {amountPrefix}
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-xs text-fintrak-text-secondary">
              {formatDate(transaction.date)}
            </p>
          </div>

          {/* Actions — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowEditDialog(true)}
              className="p-1.5 rounded-md text-fintrak-text-secondary hover:text-fintrak-text-primary hover:bg-fintrak-border transition-colors cursor-pointer"
              aria-label={`Edit ${type}`}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-1.5 rounded-md text-fintrak-text-secondary hover:text-fintrak-expense hover:bg-red-50 transition-colors cursor-pointer"
              aria-label={`Delete ${type}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md bg-fintrak-card border-fintrak-border">
          <DialogHeader>
            <DialogTitle className="text-fintrak-text-primary capitalize">
              Edit {type}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className="pl-7 border-fintrak-border focus-visible:ring-fintrak-accent"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-fintrak-text-primary text-sm font-medium">
                Category
              </Label>
              <Select
                value={editForm.category}
                onValueChange={(val) =>
                  setEditForm((prev) => ({ ...prev, category: val }))
                }
              >
                <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent cursor-pointer">
                  <SelectValue />
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
            </div>

            {/* Account */}
            <div className="space-y-1.5">
              <Label className="text-fintrak-text-primary text-sm font-medium">
                Account
              </Label>
              <Select
                value={editForm.accountId}
                onValueChange={(val) =>
                  setEditForm((prev) => ({ ...prev, accountId: val }))
                }
              >
                <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent cursor-pointer">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem
                      key={acc.id}
                      value={acc.id}
                      className="cursor-pointer"
                    >
                      {getAccountLabel(acc)}
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
                value={editForm.date}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="border-fintrak-border focus-visible:ring-fintrak-accent"
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
                value={editForm.note}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, note: e.target.value }))
                }
                className="border-fintrak-border focus-visible:ring-fintrak-accent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="flex-1 border-fintrak-border text-fintrak-text-secondary cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-fintrak-accent hover:bg-fintrak-accent/90 text-white cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-fintrak-card border-fintrak-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fintrak-text-primary">
              Delete this {type}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-fintrak-text-secondary">
              {formatCurrency(transaction.amount)} — {transaction.category} on{" "}
              {formatDate(transaction.date)}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-fintrak-border text-fintrak-text-secondary cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-fintrak-expense hover:bg-fintrak-expense/90 text-white cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
