// src/lib/utils/accountBalances.ts

import type { Account, AccountType, Transaction } from "@/types";
import { isTransfer, isIncomeExpense } from "@/types";

/**
 * Returns the current balance for an account.
 *
 * Income adds to the account, expenses subtract from it.
 * Transfers debit the from account and credit the to account.
 *
 * Works uniformly across account types thanks to signed balances —
 * e.g. an expense on a credit card pushes its (negative) balance
 * further negative, meaning more owed.
 */
export function calculateAccountBalance(
  account: Account,
  transactions: Transaction[],
): number {
  const transactionTotal = transactions.reduce((sum, t) => {
    if (isIncomeExpense(t) && t.accountId === account.id) {
      return t.type === "income" ? sum + t.amount : sum - t.amount;
    }

    if (isTransfer(t)) {
      if (t.fromAccountId === account.id) return sum - t.amount;
      if (t.toAccountId === account.id) return sum + t.amount;
    }

    return sum;
  }, 0);

  return account.openingBalance + transactionTotal;
}

export type AccountGroup = {
  type: AccountType;
  accounts: Account[];
  subtotal: number;
};

// Display order for account type groups
const TYPE_ORDER: AccountType[] = [
  "chequing",
  "savings",
  "credit_card",
  "cash",
  "investment",
];

/**
 * Groups accounts by type, with a subtotal per group.
 * Empty groups are omitted entirely.
 */
export function groupAccountsByType(
  accounts: Account[],
  transactions: Transaction[],
): AccountGroup[] {
  const groups: AccountGroup[] = [];

  for (const type of TYPE_ORDER) {
    const accountsOfType = accounts.filter((a) => a.type === type);
    if (accountsOfType.length === 0) continue;

    const subtotal = accountsOfType.reduce(
      (sum, a) => sum + calculateAccountBalance(a, transactions),
      0,
    );

    groups.push({ type, accounts: accountsOfType, subtotal });
  }

  return groups;
}
