import { createClient } from "@supabase/supabase-js";

/**
 * Admin client using the service role key.
 * NEVER import this in client components — server-side only.
 * Bypasses Row Level Security entirely.
 * Used only for privileged operations like deleting a user account.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
