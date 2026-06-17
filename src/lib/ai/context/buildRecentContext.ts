// src/lib/ai/context/buildRecentContext.ts

import type { Transaction } from "@/types";
import { isTransfer } from "@/types";

/**
 * Builds the recent transactions section of the AI context.
 * Sends last 30 raw transactions so Claude can reference specific entries.
 * Transfers are included but rendered differently — no category, shows from/to accounts instead.
 */
export function buildRecentContext(transactions: Transaction[]): string {
  const recent = transactions.slice(0, 30);

  if (recent.length === 0) {
    return `
=== RECENT TRANSACTIONS (Last 30) ===
No transactions recorded yet.
`.trim();
  }

  const lines = recent.map((t) => {
    const note = t.note ? ` | Note: ${t.note}` : "";

    if (isTransfer(t)) {
      return `${t.date} | TRANSFER | $${t.amount.toFixed(2)} | From: ${t.fromAccountId} → To: ${t.toAccountId}${note}`;
    }

    const prefix = t.type === "expense" ? "-" : "+";
    return `${t.date} | ${t.type.toUpperCase()} | ${t.category} | ${prefix}$${t.amount.toFixed(2)}${note}`;
  });

  return `
=== RECENT TRANSACTIONS (Last 30) ===
${lines.join("\n")}
`.trim();
}
