"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

type DeleteAccountResult = { error: string } | void;

export async function deleteAccount(): Promise<DeleteAccountResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Deleting the auth user cascades to all related tables
  // (transactions, goals, budgets, settings) via "on delete cascade"
  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: "Failed to delete account. Please try again." };
  }

  await supabase.auth.signOut();
  redirect("/login");
}
