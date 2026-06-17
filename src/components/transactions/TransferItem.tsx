// src/components/transactions/TransferItem.tsx

"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { getBankById, getBankLogoUrl } from "@/lib/banks";
import { ACCOUNT_TYPE_META } from "@/lib/accountMeta";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import { formatDate } from "@/lib/utils/formatdate";
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
import { ArrowRight, Trash2, Loader2 } from "lucide-react";
import type { TransferTransaction, Account } from "@/types";

function getAccountLabel(account: Account): string {
  if (account.nickname) return account.nickname;
  if (account.bankId) {
    const bank = getBankById(account.bankId);
    if (bank) return bank.name;
  }
  return ACCOUNT_TYPE_META[account.type].label;
}

function AccountChip({ account }: { account: Account }) {
  const logoUrl = account.bankId ? getBankLogoUrl(account.bankId) : null;
  const label = getAccountLabel(account);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-9 h-9 rounded-xl bg-fintrak-bg border border-fintrak-border shrink-0 flex items-center justify-center overflow-hidden">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="w-5 h-5 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="text-fintrak-text-secondary text-xs">
            {ACCOUNT_TYPE_META[account.type].icon}
          </span>
        )}
      </div>
      <span className="text-sm font-semibold text-fintrak-text-primary truncate leading-tight">
        {label}
      </span>
    </div>
  );
}

interface TransferItemProps {
  transfer: TransferTransaction;
}

export default function TransferItem({ transfer }: TransferItemProps) {
  const { accounts } = useAccounts();
  const { deleteTransaction, isDeleting } = useTransactions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fromAccount = accounts.find((a) => a.id === transfer.fromAccountId);
  const toAccount = accounts.find((a) => a.id === transfer.toAccountId);

  async function handleDelete() {
    try {
      await deleteTransaction(transfer.id);
      toast.success("Transfer deleted");
      setShowDeleteDialog(false);
    } catch {
      toast.error("Failed to delete transfer", {
        description: "Please try again.",
      });
    }
  }

  return (
    <>
      <div className="group flex items-center gap-4 px-5 py-4 hover:bg-fintrak-bg transition-colors">
        {/* Flow — from → arrow → to */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {fromAccount ? (
            <AccountChip account={fromAccount} />
          ) : (
            <span className="text-sm text-fintrak-text-secondary">Unknown</span>
          )}

          {/* Arrow */}
          <div className="shrink-0 w-7 h-7 rounded-full border border-fintrak-border bg-fintrak-card flex items-center justify-center">
            <ArrowRight size={13} className="text-fintrak-accent" />
          </div>

          {toAccount ? (
            <AccountChip account={toAccount} />
          ) : (
            <span className="text-sm text-fintrak-text-secondary">Unknown</span>
          )}
        </div>

        {/* Right — amount + meta + delete */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Amount + date + note stacked */}
          <div className="text-right">
            <p className="text-sm font-bold text-fintrak-text-primary tabular-nums">
              {formatCurrency(transfer.amount)}
            </p>
            <p className="text-xs text-fintrak-text-secondary mt-0.5">
              {formatDate(transfer.date)}
            </p>
            {transfer.note && (
              <p className="text-xs text-fintrak-accent/70 mt-0.5 italic">
                {transfer.note}
              </p>
            )}
          </div>

          {/* Delete — vertically centered, separate from text */}
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-1.5 rounded-md text-fintrak-text-secondary hover:text-fintrak-expense hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="Delete transfer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-fintrak-card border-fintrak-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fintrak-text-primary">
              Delete this transfer?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-fintrak-text-secondary">
              {formatCurrency(transfer.amount)} transfer on{" "}
              {formatDate(transfer.date)}. Both account balances will update
              automatically. This cannot be undone.
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
