// src/lib/ai/context/buildAccountsContext.ts

import type { Account, Transaction } from "@/types";
import { getBankById } from "@/lib/banks";
import { calculateAccountBalance } from "@/lib/utils/accountBalances";
import { ACCOUNT_TYPE_META } from "@/lib/accountMeta";

function getAccountName(account: Account): string {
  if (account.nickname) return account.nickname;
  if (account.bankId) {
    const bank = getBankById(account.bankId);
    if (bank) return `${bank.name} ${ACCOUNT_TYPE_META[account.type].label}`;
  }
  return ACCOUNT_TYPE_META[account.type].label;
}

/**
 * Builds the accounts section of the AI context — each account with its
 * type, bank, and current balance, plus total net worth. Credit card
 * balances are shown as amounts owed.
 */
export function buildAccountsContext(
  accounts: Account[],
  transactions: Transaction[],
): string {
  if (accounts.length === 0) {
    return `
=== ACCOUNTS ===
No accounts set up yet.
`.trim();
  }

  let netWorth = 0;

  const lines = accounts.map((account) => {
    const balance = calculateAccountBalance(account, transactions);
    netWorth += balance;

    const name = getAccountName(account);
    const typeLabel = ACCOUNT_TYPE_META[account.type].label;

    // Credit cards: a negative balance means money owed
    if (account.type === "credit_card") {
      const owed = balance < 0 ? Math.abs(balance) : 0;
      const creditInfo = account.creditLimit
        ? ` (limit $${account.creditLimit.toFixed(2)})`
        : "";
      return `- ${name} [${typeLabel}]: $${owed.toFixed(2)} owed${creditInfo}`;
    }

    return `- ${name} [${typeLabel}]: $${balance.toFixed(2)}`;
  });

  return `
=== ACCOUNTS ===
${lines.join("\n")}

Net Worth (all accounts combined): $${netWorth.toFixed(2)}
`.trim();
}
