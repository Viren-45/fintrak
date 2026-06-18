// src/app/(app)/layout.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/sidebar/Sidebar";
import { QuickAddProvider } from "@/components/quick-add/QuickAddProvider";
import QuickAddButton from "@/components/quick-add/QuickAddButton";
import QuickAddDialog from "@/components/quick-add/QuickAddDialog";
import VoiceButton from "@/components/voice/VoiceButton";
import { Toaster } from "@/components/ui/sonner";

const supabase = createClient();

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    // Listen for auth state changes
    // When app resumes from background, this triggers a session check
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      }
      if (event === "TOKEN_REFRESHED") {
        // Session refreshed successfully — stay on current page
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <QuickAddProvider>
        <div className="flex min-h-screen bg-fintrak-bg">
          <Sidebar />
          <main className="flex-1 lg:p-8 p-4 pt-16 lg:pt-8 min-w-0">
            {children}
          </main>
        </div>
        <QuickAddButton />
        <VoiceButton />
        <QuickAddDialog />
        <Toaster position="top-right" />
      </QuickAddProvider>
    </QueryClientProvider>
  );
}
