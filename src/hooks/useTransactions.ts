"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types";

const supabase = createClient();

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function fetchTransactions(
  type?: "expense" | "income",
): Promise<Transaction[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    date: row.date,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  }));
}

// ─── Add ───────────────────────────────────────────────────────────────────

type AddTransactionInput = Omit<Transaction, "id" | "createdAt">;

async function addTransaction(input: AddTransactionInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: input.type,
    amount: input.amount,
    category: input.category,
    date: input.date,
    note: input.note ?? null,
  });

  if (error) throw error;
}

// ─── Update ────────────────────────────────────────────────────────────────

type UpdateTransactionInput = Omit<Transaction, "createdAt">;

async function updateTransaction(input: UpdateTransactionInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("transactions")
    .update({
      type: input.type,
      amount: input.amount,
      category: input.category,
      date: input.date,
      note: input.note ?? null,
    })
    .eq("id", input.id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ─── Delete ────────────────────────────────────────────────────────────────

async function deleteTransaction(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useTransactions(type?: "expense" | "income") {
  const queryClient = useQueryClient();

  const queryKey = type ? ["transactions", type] : ["transactions"];

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchTransactions(type),
  });

  const { mutateAsync: addTransactionMutation, isPending: isAdding } =
    useMutation({
      mutationFn: addTransaction,
      onSuccess: () => {
        // Invalidate all transaction queries so every tab refreshes
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      },
    });

  const { mutateAsync: updateTransactionMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: updateTransaction,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      },
    });

  const { mutateAsync: deleteTransactionMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteTransaction,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      },
    });

  return {
    transactions,
    isLoading,
    error: error?.message ?? null,
    isAdding,
    isUpdating,
    isDeleting,
    addTransaction: addTransactionMutation,
    updateTransaction: updateTransactionMutation,
    deleteTransaction: deleteTransactionMutation,
  };
}
