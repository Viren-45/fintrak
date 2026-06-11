"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar/Sidebar";
import { QuickAddProvider } from "@/components/quick-add/QuickAddProvider";
import QuickAddButton from "@/components/quick-add/QuickAddButton";
import QuickAddDialog from "@/components/quick-add/QuickAddDialog";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // useState ensures QueryClient is created once per component lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
            retry: 1, // Retry failed requests once
          },
        },
      }),
  );

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
        <QuickAddDialog />
      </QuickAddProvider>
    </QueryClientProvider>
  );
}
