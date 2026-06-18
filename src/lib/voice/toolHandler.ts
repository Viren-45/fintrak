// src/lib/voice/toolHandler.ts

/**
 * Handles function calls from Gemini Live.
 * When Gemini decides to call save_transaction or add_category,
 * this module executes the actual logic and returns the result.
 *
 * To add new voice capabilities in future: add a new handler here
 * and register the function declaration in buildVoiceContext.ts.
 */

import type { Settings } from "@/types";
import type { AddTransactionInput } from "@/hooks/useTransactions";

// ─── Types matching what Gemini sends ────────────────────────────────────────

export interface FunctionCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolCall {
  functionCalls: FunctionCall[];
}

interface SaveTransactionArgs {
  transactionType: "expense" | "income" | "transfer";
  amount: number;
  category?: string;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  date: string;
  note?: string;
}

interface AddCategoryArgs {
  categoryName: string;
  categoryType: "expense" | "income";
}

export interface ToolHandlerDeps {
  addTransaction: (input: AddTransactionInput) => Promise<void>;
  settings: Settings;
  saveSettings: (updated: Settings) => Promise<void>;
  onSaving: () => void;
  onSaved: () => void;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function handleToolCall(
  toolCall: ToolCall,
  deps: ToolHandlerDeps,
): Promise<Record<string, unknown>[]> {
  const { addTransaction, settings, saveSettings, onSaving, onSaved } = deps;
  const functionResponses: Record<string, unknown>[] = [];

  for (const fc of toolCall.functionCalls) {
    let responseData: Record<string, unknown>;

    try {
      if (fc.name === "save_transaction") {
        onSaving();
        const args = fc.args as unknown as SaveTransactionArgs;

        if (args.transactionType === "transfer") {
          await addTransaction({
            type: "transfer",
            amount: args.amount,
            fromAccountId: args.fromAccountId!,
            toAccountId: args.toAccountId!,
            date: args.date,
            note: args.note || undefined,
          });
        } else {
          await addTransaction({
            type: args.transactionType,
            amount: args.amount,
            category: args.category!,
            accountId: args.accountId!,
            date: args.date,
            note: args.note || undefined,
          });
        }

        onSaved();
        responseData = { success: true };
      } else if (fc.name === "add_category") {
        const args = fc.args as unknown as AddCategoryArgs;

        if (args.categoryType === "expense") {
          await saveSettings({
            currency: settings.currency,
            expenseCategories: [
              ...settings.expenseCategories,
              args.categoryName,
            ],
            incomeCategories: settings.incomeCategories,
          });
        } else {
          await saveSettings({
            currency: settings.currency,
            expenseCategories: settings.expenseCategories,
            incomeCategories: [...settings.incomeCategories, args.categoryName],
          });
        }

        responseData = { success: true, categoryAdded: args.categoryName };
      } else {
        // Unknown function — Gemini might call something we haven't implemented yet
        console.warn(`Unknown voice function called: ${fc.name}`);
        responseData = { error: `Unknown function: ${fc.name}` };
      }
    } catch (err) {
      console.error(`Tool call ${fc.name} failed:`, err);
      responseData = {
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }

    functionResponses.push({
      name: fc.name,
      id: fc.id,
      response: { result: responseData },
    });
  }

  return functionResponses;
}
