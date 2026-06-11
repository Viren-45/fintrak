import type { Transaction } from "@/types";

/**
 * Builds the recent transactions section of the AI context.
 * Sends last 30 raw transactions so Claude can reference specific entries.
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
    const prefix = t.type === "expense" ? "-" : "+";
    const note = t.note ? ` | Note: ${t.note}` : "";
    return `${t.date} | ${t.type.toUpperCase()} | ${t.category} | ${prefix}$${t.amount.toFixed(2)}${note}`;
  });

  return `
=== RECENT TRANSACTIONS (Last 30) ===
${lines.join("\n")}
`.trim();
}
