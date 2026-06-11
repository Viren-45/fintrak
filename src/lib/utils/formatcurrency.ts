/**
 * Formats a number as currency string
 * e.g. 4250 → "$4,250.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = "CAD",
): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
