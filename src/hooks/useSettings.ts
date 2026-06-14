"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/types";

const supabase = createClient();

type SettingsWithName = Settings & { userName: string };

// Minimal placeholder shown only while the query is loading
const EMPTY_SETTINGS: SettingsWithName = {
  userName: "",
  currency: "CAD",
  expenseCategories: [],
  incomeCategories: [],
};

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function fetchSettings(): Promise<SettingsWithName> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Name comes from auth metadata — works for email signup AND Google OAuth
  const userName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Every user gets a settings row created at signup —
  // a missing row here means something went wrong, not "new user"
  if (error) {
    throw new Error(
      "Could not load your settings. Please try refreshing the page.",
    );
  }

  return {
    userName,
    currency: data.currency,
    expenseCategories: data.expense_categories,
    incomeCategories: data.income_categories,
  };
}

// ─── Update settings (currency + categories) ───────────────────────────────

async function updateSettings(updated: Settings): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("settings").upsert(
    {
      user_id: user.id,
      currency: updated.currency,
      expense_categories: updated.expenseCategories,
      income_categories: updated.incomeCategories,
    },
    { onConflict: "user_id" },
  );

  if (error) throw error;
}

// ─── Update name (auth metadata) ───────────────────────────────────────────

async function updateUserName(name: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (error) throw error;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useSettings() {
  const queryClient = useQueryClient();

  const {
    data: settings = EMPTY_SETTINGS,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const { mutateAsync: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: updateSettings,
    onSuccess: (_, updated) => {
      queryClient.setQueryData(
        ["settings"],
        (old: SettingsWithName | undefined) => ({
          ...updated,
          userName: old?.userName ?? "",
        }),
      );
    },
  });

  const { mutateAsync: saveUserName, isPending: isSavingName } = useMutation({
    mutationFn: updateUserName,
    onSuccess: (_, name) => {
      queryClient.setQueryData(
        ["settings"],
        (old: SettingsWithName | undefined) =>
          old ? { ...old, userName: name } : old,
      );
    },
  });

  return {
    settings,
    isLoading,
    isSaving,
    isSavingName,
    error: error?.message ?? null,
    saveSettings,
    saveUserName,
  };
}
