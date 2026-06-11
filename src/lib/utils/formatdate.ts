/**
 * Formats an ISO date string for display
 * e.g. "2026-06-11" → "Jun 11, 2026"
 */
export function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats an ISO date string to short form
 * e.g. "2026-06-11" → "Jun 11"
 */
export function formatDateShort(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}
