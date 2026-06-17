"use client";

import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import {
  groupAccountsByType,
  calculateAccountBalance,
} from "@/lib/utils/accountBalances";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import AccountRow, { TYPE_META } from "./AccountRow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Account } from "@/types";

interface AccountsByTypeProps {
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
}

export default function AccountsByType({
  onEditAccount,
  onDeleteAccount,
}: AccountsByTypeProps) {
  const { accounts, isLoading, error } = useAccounts();
  const { transactions } = useTransactions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2
          size={24}
          className="animate-spin text-fintrak-text-secondary"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-fintrak-expense/30 rounded-md px-4 py-3">
        <p className="text-sm text-fintrak-expense">{error}</p>
      </div>
    );
  }

  const groups = groupAccountsByType(accounts, transactions);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-fintrak-text-primary">
        Your Accounts
      </h2>

      {accounts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-fintrak-border rounded-lg">
          <p className="text-fintrak-text-secondary text-sm">
            No accounts yet. Add your first account to start tracking balances.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isDebtGroup = group.subtotal < 0;

            return (
              <Card
                key={group.type}
                className="border-fintrak-border shadow-sm overflow-hidden"
              >
                <Accordion type="multiple" defaultValue={[group.type]}>
                  <AccordionItem value={group.type} className="border-b-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline cursor-pointer">
                      <div className="flex items-center justify-between w-full pr-2">
                        <span className="text-sm font-medium text-fintrak-text-primary">
                          {TYPE_META[group.type].label}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            isDebtGroup
                              ? "text-fintrak-expense"
                              : "text-fintrak-text-primary"
                          }`}
                        >
                          {formatCurrency(Math.abs(group.subtotal))}
                          {isDebtGroup ? " owed" : ""}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <div className="divide-y divide-fintrak-border border-t border-fintrak-border">
                        {group.accounts.map((account) => (
                          <AccountRow
                            key={account.id}
                            account={account}
                            balance={calculateAccountBalance(
                              account,
                              transactions,
                            )}
                            onEdit={onEditAccount}
                            onDelete={onDeleteAccount}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
