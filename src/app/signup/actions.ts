"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent("Passwords do not match")}`);
  }

  // Validate password length
  if (password.length < 8) {
    redirect(
      `/signup?error=${encodeURIComponent("Password must be at least 8 characters")}`,
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // When email confirmations are enabled and the email already exists,
  // Supabase returns a fake/obfuscated user with no identities array
  // This is how we detect a duplicate email
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    redirect(
      `/signup?error=${encodeURIComponent(
        "An account with this email already exists. Please",
      )}`,
    );
  }

  // Create default settings row for the new user
  if (data.user) {
    await supabase.from("settings").insert({
      user_id: data.user.id,
      user_name: fullName,
      currency: "CAD",
      expense_categories: [
        "Groceries",
        "Dining",
        "Transport",
        "Entertainment",
        "Utilities",
        "Health",
        "Shopping",
        "Other",
      ],
      income_categories: [
        "Salary",
        "Freelance",
        "Side Income",
        "Gift",
        "Opening Balance",
        "Other",
      ],
    });
  }

  // If email confirmation is required, show a success message
  // If not required, redirect straight to dashboard
  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Account created! Please check your email to confirm your account before signing in.",
      )}`,
    );
  }

  redirect("/dashboard");
}
