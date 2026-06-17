"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Account, AccountType } from "@/types";

const supabase = createClient();

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function fetchAccounts(): Promise<Account[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    type: row.type as AccountType,
    bankId: row.bank_id ?? undefined,
    nickname: row.nickname ?? undefined,
    lastFour: row.last_four ?? undefined,
    openingBalance: row.opening_balance,
    creditLimit: row.credit_limit ?? undefined,
    createdAt: row.created_at,
  }));
}

async function countAccountTransactions(accountId: string): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { count, error } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("account_id", accountId);

  if (error) throw error;
  return count ?? 0;
}

// ─── Add ───────────────────────────────────────────────────────────────────

type AddAccountInput = Omit<Account, "id" | "createdAt">;

async function addAccount(input: AddAccountInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    type: input.type,
    bank_id: input.bankId ?? null,
    nickname: input.nickname ?? null,
    last_four: input.lastFour ?? null,
    opening_balance: input.openingBalance,
    credit_limit: input.creditLimit ?? null,
  });

  if (error) throw error;
}

// ─── Update ────────────────────────────────────────────────────────────────

type UpdateAccountInput = Omit<Account, "createdAt">;

async function updateAccount(input: UpdateAccountInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("accounts")
    .update({
      type: input.type,
      bank_id: input.bankId ?? null,
      nickname: input.nickname ?? null,
      last_four: input.lastFour ?? null,
      opening_balance: input.openingBalance,
      credit_limit: input.creditLimit ?? null,
    })
    .eq("id", input.id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ─── Delete ────────────────────────────────────────────────────────────────

async function deleteAccount(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAccounts() {
  const queryClient = useQueryClient();

  const {
    data: accounts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const { mutateAsync: addAccountMutation, isPending: isAdding } = useMutation({
    mutationFn: addAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });

  const { mutateAsync: updateAccountMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: updateAccount,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
    });

  const { mutateAsync: deleteAccountMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteAccount,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
    });

  return {
    accounts,
    isLoading,
    error: error?.message ?? null,
    isAdding,
    isUpdating,
    isDeleting,
    addAccount: addAccountMutation,
    updateAccount: updateAccountMutation,
    deleteAccount: deleteAccountMutation,
    countAccountTransactions,
  };
}
