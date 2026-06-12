// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

// Used in Client Components and custom hooks
// Creates a singleton browser-side Supabase instance
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: "fintrak-auth",
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
      },
    },
  );
}
