/**
 * Canadian bank registry for the account creation dropdown.
 *
 * Each bank has a stable `id` (stored in the database — never changes),
 * a `name` (shown in the dropdown), and a `domain` (used to fetch the logo).
 *
 * To add a bank: add an entry here. To change how logos are fetched:
 * update getBankLogoUrl() only — nothing else in the app needs to change.
 */

export type Bank = {
  id: string;
  name: string;
  domain: string | null; // null for "Other" — no logo available
};

export const BANKS: Bank[] = [
  { id: "rbc", name: "RBC Royal Bank", domain: "rbc.com" },
  { id: "td", name: "TD Canada Trust", domain: "td.com" },
  { id: "scotiabank", name: "Scotiabank", domain: "scotiabank.com" },
  { id: "bmo", name: "BMO Bank of Montreal", domain: "bmo.ca" },
  { id: "cibc", name: "CIBC", domain: "cibc.com" },
  { id: "nbc", name: "National Bank of Canada", domain: "nbc.ca" },
  { id: "tangerine", name: "Tangerine", domain: "tangerine.ca" },
  { id: "simplii", name: "Simplii Financial", domain: "simplii.com" },
  { id: "eq", name: "EQ Bank", domain: "eqbank.ca" },
  { id: "hsbc", name: "HSBC Canada", domain: "hsbc.ca" },
  { id: "laurentian", name: "Laurentian Bank", domain: "laurentianbank.ca" },
  { id: "manulife", name: "Manulife Bank", domain: "manulifebank.ca" },
  { id: "desjardins", name: "Desjardins", domain: "desjardins.com" },
  { id: "pcfinancial", name: "PC Financial", domain: "pcfinancial.ca" },
  { id: "koho", name: "KOHO", domain: "koho.ca" },
  { id: "wealthsimple", name: "Wealthsimple", domain: "wealthsimple.com" },
  { id: "other", name: "Other", domain: null },
];

/**
 * Returns the logo URL for a given bank id, or null if unavailable.
 * Uses logo.dev (the documented successor to the discontinued Clearbit Logo API).
 */
export function getBankLogoUrl(bankId: string): string | null {
  const bank = BANKS.find((b) => b.id === bankId);
  if (!bank || !bank.domain) return null;

  const token = process.env.NEXT_PUBLIC_LOGODEV_TOKEN;
  return `https://img.logo.dev/${bank.domain}?token=${token}&size=64&format=png`;
}

/**
 * Looks up a bank by its stored id. Returns undefined if not found.
 */
export function getBankById(bankId: string): Bank | undefined {
  return BANKS.find((b) => b.id === bankId);
}
