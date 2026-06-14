import type { Settings } from "@/types";

/**
 * Builds the profile section of the AI context.
 * Tells Claude who the user is and what currency to use.
 */
export function buildProfileContext(
  settings: Settings,
  userName: string,
): string {
  const name = userName.trim() || "the user";

  return `
=== PROFILE ===
Name: ${name}
Currency: ${settings.currency}
`.trim();
}
