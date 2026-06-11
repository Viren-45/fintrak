"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/types";

const supabase = createClient();

const DEFAULT_SETTINGS: Settings = {
  userName: "",
  currency: "CAD",
  expenseCategories: [
    "Groceries",
    "Dining",
    "Transport",
    "Entertainment",
    "Utilities",
    "Health",
    "Shopping",
    "Other",
  ],
  incomeCategories: [
    "Salary",
    "Freelance",
    "Side Income",
    "Gift",
    "Opening Balance",
    "Other",
  ],
};

async function fetchSettings(): Promise<Settings> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // PGRST116 = no row found — first time user, return defaults
  if (error && error.code !== "PGRST116") throw error;

  if (!data) return DEFAULT_SETTINGS;

  return {
    userName: data.user_name,
    currency: data.currency,
    expenseCategories: data.expense_categories,
    incomeCategories: data.income_categories,
  };
}

async function updateSettings(updated: Settings): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("settings").upsert(
    {
      user_id: user.id,
      user_name: updated.userName,
      currency: updated.currency,
      expense_categories: updated.expenseCategories,
      income_categories: updated.incomeCategories,
    },
    { onConflict: "user_id" },
  );

  if (error) throw error;
}

export function useSettings() {
  const queryClient = useQueryClient();

  const {
    data: settings = DEFAULT_SETTINGS,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const { mutateAsync: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: updateSettings,
    onSuccess: (_, updated) => {
      // Update the cache immediately — no refetch needed
      queryClient.setQueryData(["settings"], updated);
    },
  });

  return {
    settings,
    isLoading,
    isSaving,
    error: error?.message ?? null,
    saveSettings,
  };
}
