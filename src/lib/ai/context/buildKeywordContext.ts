import type { Transaction } from "@/types";

/**
 * Builds keyword summary from transaction notes in the last 90 days.
 * Lets Claude answer questions like "how much did I spend at Walmart?"
 */
export function buildKeywordContext(transactions: Transaction[]): string {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoff = ninetyDaysAgo.toISOString().split("T")[0];

  // Only expenses with notes in the last 90 days
  const relevant = transactions.filter(
    (t) => t.type === "expense" && t.note && t.date >= cutoff,
  );

  if (relevant.length === 0) {
    return `
=== KEYWORD SUMMARY (Last 90 Days) ===
No notes recorded in the last 90 days.
`.trim();
  }

  // Group by keyword (note) and sum amounts
  const keywordMap: Record<string, { count: number; total: number }> = {};

  for (const t of relevant) {
    const keyword = t.note!.trim().toLowerCase();
    if (!keywordMap[keyword]) {
      keywordMap[keyword] = { count: 0, total: 0 };
    }
    keywordMap[keyword].count += 1;
    keywordMap[keyword].total += t.amount;
  }

  const lines = Object.entries(keywordMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(
      ([keyword, { count, total }]) =>
        `- "${keyword}": ${count} transaction${count > 1 ? "s" : ""} totaling $${total.toFixed(2)}`,
    );

  return `
=== KEYWORD SUMMARY (Last 90 Days) ===
${lines.join("\n")}
`.trim();
}
