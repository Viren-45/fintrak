// src/hooks/useNotifications.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";

const supabase = createClient();

// ─── Helpers ──────────────────────────────────────────────────────────────

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    body: row.body as string,
    read: row.read as boolean,
    createdAt: row.created_at as string,
  };
}

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50); // cap at 50 — no one needs to scroll through hundreds

  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

// ─── Mark all as read ──────────────────────────────────────────────────────

async function markAllAsRead(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) throw error;
}

// ─── Mark single notification as read ─────────────────────────────────────

async function markOneAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) throw error;
}

// ─── Delete a single notification ─────────────────────────────────────────

async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").delete().eq("id", id);

  if (error) throw error;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useNotifications() {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    // Poll every 60 seconds so new notifications appear without a page refresh
    refetchInterval: 60_000,
  });

  const { mutateAsync: readAll, isPending: isMarkingRead } = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      // Optimistically mark all as read in the cache immediately
      queryClient.setQueryData(
        ["notifications"],
        (old: Notification[] | undefined) =>
          (old ?? []).map((n) => ({ ...n, read: true })),
      );
    },
  });

  const { mutateAsync: readOne } = useMutation({
    mutationFn: markOneAsRead,
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ["notifications"],
        (old: Notification[] | undefined) =>
          (old ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
  });

  const { mutateAsync: removeNotification } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ["notifications"],
        (old: Notification[] | undefined) =>
          (old ?? []).filter((n) => n.id !== id),
      );
    },
  });

  // Derived — unread count drives the badge on the bell icon
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    isMarkingRead,
    error: error?.message ?? null,
    readAll,
    readOne,
    removeNotification,
  };
}
