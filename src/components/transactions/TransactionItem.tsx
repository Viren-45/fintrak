"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency } from "@/lib/utils/formatcurrency";
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
import type { Transaction } from "@/types";

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const type = transaction.type;
  const { updateTransaction, deleteTransaction, isUpdating, isDeleting } =
    useTransactions(type);
  const { settings } = useSettings();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [editForm, setEditForm] = useState({
    amount: String(transaction.amount),
    category: transaction.category,
    date: transaction.date,
    note: transaction.note ?? "",
  });

  // Derived values based on type
  const isExpense = type === "expense";
  const amountColor = isExpense
    ? "text-fintrak-expense"
    : "text-fintrak-income";
  const dotColor = isExpense ? "bg-fintrak-expense" : "bg-fintrak-income";
  const amountPrefix = isExpense ? "-" : "+";
  const categories = isExpense
    ? settings.expenseCategories
    : settings.incomeCategories;

  const formattedDate = new Date(
    transaction.date + "T00:00:00",
  ).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function handleUpdate() {
    try {
      await updateTransaction({
        id: transaction.id,
        type,
        amount: Number(editForm.amount),
        category: editForm.category,
        date: editForm.date,
        note: editForm.note || undefined,
      });
      setShowEditDialog(false);
    } catch {
      // error handled by hook
    }
  }

  async function handleDelete() {
    try {
      await deleteTransaction(transaction.id);
      setShowDeleteDialog(false);
    } catch {
      // error handled by hook
    }
  }

  return (
    <>
      {/* Transaction row */}
      <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-fintrak-bg transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-fintrak-text-primary truncate">
              {transaction.category}
            </p>
            {transaction.note && (
              <p className="text-xs text-fintrak-text-secondary truncate">
                {transaction.note}
              </p>
            )}
            <p className="text-xs text-fintrak-text-secondary">
              {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-sm font-semibold ${amountColor}`}>
            {amountPrefix}
            {formatCurrency(transaction.amount)}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowEditDialog(true)}
              className="p-1.5 rounded-md text-fintrak-text-secondary hover:text-fintrak-text-primary hover:bg-fintrak-border transition-colors"
              aria-label={`Edit ${type}`}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-1.5 rounded-md text-fintrak-text-secondary hover:text-fintrak-expense hover:bg-red-50 transition-colors"
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
                <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
                className="flex-1 border-fintrak-border text-fintrak-text-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-fintrak-accent hover:bg-fintrak-accent/90 text-white"
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
              {formattedDate}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-fintrak-border text-fintrak-text-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-fintrak-expense hover:bg-fintrak-expense/90 text-white"
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
