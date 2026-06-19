// src/app/(app)/layout.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/sidebar/Sidebar";
import AppHeader from "@/components/layout/AppHeader";
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      }
      if (event === "TOKEN_REFRESHED") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <QuickAddProvider>
        <div
          className="flex min-h-screen"
          style={{ backgroundColor: "#F9FAFB" }}
        >
          <Sidebar />

          {/* Right column — header + page content stacked */}
          <div className="flex flex-col flex-1 min-w-0 lg:ml-60">
            <AppHeader />
            <main className="flex-1 lg:p-8 p-4 pt-16 lg:pt-8 min-w-0">
              {children}
            </main>
          </div>
        </div>
        <QuickAddButton />
        <VoiceButton />
        <QuickAddDialog />
        <Toaster position="top-right" />
      </QuickAddProvider>
    </QueryClientProvider>
  );
}
