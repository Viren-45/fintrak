"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAccounts } from "@/hooks/useAccounts";
import AccountsHeader from "@/components/accounts/AccountsHeader";
import NetWorthChart from "@/components/accounts/NetWorthChart";
import AccountsByType from "@/components/accounts/AccountsByType";
import AssetsLiabilities from "@/components/accounts/AssetsLiabilities";
import AccountFormDialog from "@/components/accounts/AccountFormDialog";
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
import { Loader2 } from "lucide-react";
import type { Account } from "@/types";

export default function AccountsView() {
  const { deleteAccount, isDeleting, countAccountTransactions } = useAccounts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [txnCount, setTxnCount] = useState<number | null>(null);

  function handleAddAccount() {
    setEditingAccount(null);
    setDialogOpen(true);
  }

  function handleEditAccount(account: Account) {
    setEditingAccount(account);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setEditingAccount(null);
  }

  async function handleDeleteAccount(account: Account) {
    setDeletingAccount(account);
    setTxnCount(null);
    try {
      const count = await countAccountTransactions(account.id);
      setTxnCount(count);
    } catch {
      setTxnCount(0);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingAccount) return;

    try {
      await deleteAccount(deletingAccount.id);
      toast.success("Account deleted");
      setDeletingAccount(null);
      setTxnCount(null);
    } catch {
      toast.error("Failed to delete account", {
        description: "Please try again.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <AccountsHeader onAddAccount={handleAddAccount} />

      {/* Divider */}
      <div className="h-px bg-fintrak-border" />

      <NetWorthChart />

      {/* Fixed-height row — left scrolls visibly, right stays put */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-420px)] lg:overflow-hidden">
        <div className="lg:col-span-2 lg:h-full lg:overflow-y-auto lg:pr-2">
          <AccountsByType
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        </div>
        <div className="hidden lg:block lg:h-full lg:overflow-y-auto scrollbar-hide">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-fintrak-text-primary">
              Summary
            </h2>
            <AssetsLiabilities />
          </div>
        </div>
      </div>

      {/* Add / Edit dialog */}
      <AccountFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        account={editingAccount}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingAccount}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingAccount(null);
            setTxnCount(null);
          }
        }}
      >
        <AlertDialogContent className="bg-fintrak-card border-fintrak-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fintrak-text-primary">
              Delete this account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-fintrak-text-secondary">
              {txnCount === null ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Checking for linked transactions...
                </span>
              ) : txnCount === 0 ? (
                <>This account has no transactions. This cannot be undone.</>
              ) : (
                <>
                  This account has{" "}
                  <span className="font-semibold text-fintrak-expense">
                    {txnCount} transaction{txnCount === 1 ? "" : "s"}
                  </span>
                  . Deleting the account will permanently delete{" "}
                  {txnCount === 1 ? "it" : "them"} too. This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-fintrak-border text-fintrak-text-secondary cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting || txnCount === null}
              className="bg-fintrak-expense hover:bg-fintrak-expense/90 text-white cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
