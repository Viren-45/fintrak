"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TransactionType } from "@/types";

const supabase = createClient();

/**
 * Counts how many transactions of a given type use a specific category.
 * Used before deleting a category to warn the user if it's in use.
 */
export async function countTransactionsByCategory(
  type: TransactionType,
  category: string,
): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { count, error } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("type", type)
    .eq("category", category);

  if (error) throw error;
  return count ?? 0;
}

type ReassignInput = {
  type: TransactionType;
  fromCategory: string;
  toCategory: string;
};

async function reassignCategory({
  type,
  fromCategory,
  toCategory,
}: ReassignInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("transactions")
    .update({ category: toCategory })
    .eq("user_id", user.id)
    .eq("type", type)
    .eq("category", fromCategory);

  if (error) throw error;
}

/**
 * Provides category management operations used when deleting a category —
 * checking how many transactions use it and reassigning them if needed.
 */
export function useCategoryManagement() {
  const queryClient = useQueryClient();

  const { mutateAsync: reassignCategoryMutation, isPending: isReassigning } =
    useMutation({
      mutationFn: reassignCategory,
      onSuccess: () => {
        // Refresh all transaction lists and dashboard data
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      },
    });

  return {
    countTransactionsByCategory,
    reassignCategory: reassignCategoryMutation,
    isReassigning,
  };
}
