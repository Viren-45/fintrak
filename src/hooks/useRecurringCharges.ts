// src/hooks/useRecurringCharges.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RecurringCharge, AddRecurringChargeInput } from "@/types";

const supabase = createClient();

// ─── Helpers ──────────────────────────────────────────────────────────────

// Maps raw Supabase snake_case row to our camelCase type
function mapCharge(row: Record<string, unknown>): RecurringCharge {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    accountId: row.account_id as string,
    name: row.name as string,
    amount: Number(row.amount),
    category: row.category as string,
    type: row.type as "expense" | "income",
    frequency: row.frequency as RecurringCharge["frequency"],
    nextDueDate: row.next_due_date as string,
    endDate: (row.end_date as string | null) ?? null,
    status: row.status as RecurringCharge["status"],
    createdAt: row.created_at as string,
  };
}

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function fetchRecurringCharges(): Promise<RecurringCharge[]> {
  const { data, error } = await supabase
    .from("recurring_charges")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapCharge);
}

// ─── Add ───────────────────────────────────────────────────────────────────

async function addRecurringCharge(
  input: AddRecurringChargeInput,
): Promise<RecurringCharge> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("recurring_charges")
    .insert({
      user_id: user.id,
      account_id: input.accountId,
      name: input.name,
      amount: input.amount,
      category: input.category,
      type: input.type,
      frequency: input.frequency,
      next_due_date: input.nextDueDate,
      end_date: input.endDate ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapCharge(data);
}

// ─── Update ────────────────────────────────────────────────────────────────

async function updateRecurringCharge(
  id: string,
  input: Partial<AddRecurringChargeInput>,
): Promise<RecurringCharge> {
  const { data, error } = await supabase
    .from("recurring_charges")
    .update({
      ...(input.accountId && { account_id: input.accountId }),
      ...(input.name && { name: input.name }),
      ...(input.amount && { amount: input.amount }),
      ...(input.category && { category: input.category }),
      ...(input.type && { type: input.type }),
      ...(input.frequency && { frequency: input.frequency }),
      ...(input.nextDueDate && { next_due_date: input.nextDueDate }),
      ...("endDate" in input && { end_date: input.endDate ?? null }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapCharge(data);
}

// ─── Toggle pause/resume ───────────────────────────────────────────────────

async function toggleChargeStatus(
  id: string,
  currentStatus: RecurringCharge["status"],
): Promise<RecurringCharge> {
  const newStatus = currentStatus === "active" ? "paused" : "active";

  const { data, error } = await supabase
    .from("recurring_charges")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapCharge(data);
}

// ─── Delete ────────────────────────────────────────────────────────────────

async function deleteRecurringCharge(id: string): Promise<void> {
  const { error } = await supabase
    .from("recurring_charges")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useRecurringCharges() {
  const queryClient = useQueryClient();

  const {
    data: charges = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recurring-charges"],
    queryFn: fetchRecurringCharges,
  });

  const { mutateAsync: addCharge, isPending: isAdding } = useMutation({
    mutationFn: addRecurringCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-charges"] });
    },
  });

  const { mutateAsync: updateCharge, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<AddRecurringChargeInput>;
    }) => updateRecurringCharge(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-charges"] });
    },
  });

  const { mutateAsync: toggleStatus, isPending: isToggling } = useMutation({
    mutationFn: ({
      id,
      currentStatus,
    }: {
      id: string;
      currentStatus: RecurringCharge["status"];
    }) => toggleChargeStatus(id, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-charges"] });
    },
  });

  const { mutateAsync: deleteCharge, isPending: isDeleting } = useMutation({
    mutationFn: deleteRecurringCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-charges"] });
    },
  });

  // Derived — split active and paused for easy rendering
  const activeCharges = charges.filter((c) => c.status === "active");
  const pausedCharges = charges.filter((c) => c.status === "paused");

  return {
    charges,
    activeCharges,
    pausedCharges,
    isLoading,
    error: error?.message ?? null,
    isAdding,
    isUpdating,
    isToggling,
    isDeleting,
    addCharge,
    updateCharge,
    toggleStatus,
    deleteCharge,
  };
}
