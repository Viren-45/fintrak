"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Goal, GoalStatus } from "@/types";

const supabase = createClient();

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function fetchGoals(): Promise<Goal[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    savedAmount: row.saved_amount,
    deadline: row.deadline ?? undefined,
    description: row.description ?? undefined,
    status: row.status as GoalStatus,
    createdAt: row.created_at,
  }));
}

// ─── Add ───────────────────────────────────────────────────────────────────

type AddGoalInput = Omit<Goal, "id" | "createdAt" | "status">;

async function addGoal(input: AddGoalInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name: input.name,
    target_amount: input.targetAmount,
    saved_amount: input.savedAmount,
    deadline: input.deadline ?? null,
    description: input.description ?? null,
    status: "active",
  });

  if (error) throw error;
}

// ─── Update saved amount ────────────────────────────────────────────────────

type UpdateSavedAmountInput = {
  id: string;
  savedAmount: number;
};

async function updateSavedAmount(input: UpdateSavedAmountInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("goals")
    .update({ saved_amount: input.savedAmount })
    .eq("id", input.id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ─── Update status ─────────────────────────────────────────────────────────

type UpdateGoalStatusInput = {
  id: string;
  status: GoalStatus;
};

async function updateGoalStatus(input: UpdateGoalStatusInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("goals")
    .update({ status: input.status })
    .eq("id", input.id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ─── Delete ────────────────────────────────────────────────────────────────

async function deleteGoal(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useGoals() {
  const queryClient = useQueryClient();

  const {
    data: goals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
  });

  const { mutateAsync: addGoalMutation, isPending: isAdding } = useMutation({
    mutationFn: addGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const { mutateAsync: updateSavedAmountMutation, isPending: isUpdatingSaved } =
    useMutation({
      mutationFn: updateSavedAmount,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
    });

  const { mutateAsync: updateGoalStatusMutation, isPending: isUpdatingStatus } =
    useMutation({
      mutationFn: updateGoalStatus,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
    });

  const { mutateAsync: deleteGoalMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteGoal,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
    });

  // Convenience filters
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    error: error?.message ?? null,
    isAdding,
    isUpdatingSaved,
    isUpdatingStatus,
    isDeleting,
    addGoal: addGoalMutation,
    updateSavedAmount: updateSavedAmountMutation,
    updateGoalStatus: updateGoalStatusMutation,
    deleteGoal: deleteGoalMutation,
  };
}
