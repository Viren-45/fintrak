import { createClient } from "@/lib/supabase/server";
import { buildProfileContext } from "./context/buildProfileContext";
import { buildAccountsContext } from "./context/buildAccountsContext";
import { buildMonthlyContext } from "./context/buildMonthlyContext";
import { buildYearlyContext } from "./context/buildYearlyContext";
import { buildKeywordContext } from "./context/buildKeywordContext";
import { buildRecentContext } from "./context/buildRecentContext";
import { buildGoalsContext } from "./context/buildGoalsContext";
import type { Transaction, Goal, Settings, Account } from "@/types";

/**
 * Fetches all required data from Supabase and builds the full
 * AI context string sent to Claude before every message.
 */
export async function buildContext(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch all data in parallel for speed
  const [transactionsResult, goalsResult, settingsResult, accountsResult] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false }),

      supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase.from("settings").select("*").eq("user_id", user.id).single(),

      supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

  if (transactionsResult.error) throw transactionsResult.error;
  if (goalsResult.error) throw goalsResult.error;
  if (accountsResult.error) throw accountsResult.error;

  // Map raw Supabase rows to our TypeScript types
  const transactions: Transaction[] = (transactionsResult.data ?? []).map(
    (row) => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      category: row.category,
      date: row.date,
      note: row.note ?? undefined,
      accountId: row.account_id,
      createdAt: row.created_at,
    }),
  );

  const goals: Goal[] = (goalsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    savedAmount: row.saved_amount,
    deadline: row.deadline ?? undefined,
    description: row.description ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  }));

  const accounts: Account[] = (accountsResult.data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    bankId: row.bank_id ?? undefined,
    nickname: row.nickname ?? undefined,
    lastFour: row.last_four ?? undefined,
    openingBalance: row.opening_balance,
    creditLimit: row.credit_limit ?? undefined,
    createdAt: row.created_at,
  }));

  const settings: Settings = settingsResult.data
    ? {
        currency: settingsResult.data.currency,
        expenseCategories: settingsResult.data.expense_categories,
        incomeCategories: settingsResult.data.income_categories,
      }
    : {
        currency: "CAD",
        expenseCategories: [],
        incomeCategories: [],
      };

  const userName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  // Build each context section and join them
  const sections = [
    buildProfileContext(settings, userName),
    buildAccountsContext(accounts, transactions),
    buildMonthlyContext(transactions),
    buildYearlyContext(transactions),
    buildKeywordContext(transactions),
    buildRecentContext(transactions),
    buildGoalsContext(goals),
  ];

  return `You are a personal finance advisor assistant built into Fintrak, a personal expense tracking app. 
You have access to the user's complete financial data below. 
Use this data to give accurate, specific, and helpful financial advice.
Always reference real numbers from the data in your responses.
Be concise, friendly, and actionable. Address the user by name when appropriate.
Use Markdown formatting in your responses — bold for key numbers, bullet points for lists.
Avoid excessive headers. Keep responses focused and to the point.

${sections.join("\n\n")}`;
}
