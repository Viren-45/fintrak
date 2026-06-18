// src/lib/voice/buildVoiceContext.ts

import type { Account } from "@/types";
import { Type, type FunctionDeclaration, type Tool } from "@google/genai";

/**
 * Builds the system prompt for the Gemini Live voice session.
 * All financial context is injected here server-side — never sent to the browser.
 *
 * To add new capabilities in future, add instructions here and a new tool
 * in getVoiceTools(). The session hook handles any new function calls automatically
 * as long as you register them in the tool handler map.
 */

interface VoiceContextInput {
  accounts: Account[];
  expenseCategories: string[];
  incomeCategories: string[];
}

function getAccountLabel(account: Account): string {
  const typeLabel = {
    chequing: "Chequing",
    savings: "Savings",
    credit_card: "Credit Card",
    cash: "Cash",
    investment: "Investment",
  }[account.type];

  return account.nickname ?? typeLabel;
}

export function buildVoiceSystemPrompt(input: VoiceContextInput): string {
  const { accounts, expenseCategories, incomeCategories } = input;

  const accountList =
    accounts.length > 0
      ? accounts
          .map((a) => `- "${getAccountLabel(a)}" (id: ${a.id})`)
          .join("\n")
      : "No accounts set up yet.";

  const today = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
You are a voice assistant built into Fintrak, a personal finance tracker.
Your only job right now is to help the user log financial transactions by voice.
Today's date is ${today}.

## The user's accounts
${accountList}

## Expense categories
${expenseCategories.join(", ")}

## Income categories
${incomeCategories.join(", ")}

## How to behave
- Keep every response short — maximum 2 sentences. No lists, no explanations.
- Speak naturally and conversationally, like a helpful colleague.
- Always confirm the full transaction details before calling save_transaction.
- If the user's spoken amount is unclear or missing, ask for it directly.
- If the account is unclear, list their accounts and ask which one they used.
- If no accounts exist, tell them to go to the Accounts page to add one first.
- If a category doesn't match any in the list, suggest the closest match and ask if they want to add a new one. If yes, call add_category first, then save_transaction.
- For transfers, confirm both the from account and to account before saving.
- Never invent account IDs. Only use IDs from the accounts list above.
- If the date is not mentioned, use today's date (${today}).
- Once the user confirms, call save_transaction immediately without further commentary.
- After saving, say one short confirmation sentence and stop.
`.trim();
}

/**
 * Returns the function tool definitions for the voice session.
 * These tell Gemini what actions it can take.
 *
 * To add a new capability: add a new entry here and handle it in useVoiceSession.ts.
 */
export function getVoiceTools(): Tool[] {
  const saveTransaction: FunctionDeclaration = {
    name: "save_transaction",
    description:
      "Save a confirmed transaction to the database. Only call this after the user has explicitly confirmed the details.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        transactionType: {
          type: Type.STRING,
          enum: ["expense", "income", "transfer"],
          description: "The type of transaction.",
        },
        amount: {
          type: Type.NUMBER,
          description: "The transaction amount as a positive number.",
        },
        category: {
          type: Type.STRING,
          description:
            "The category name. Required for expense and income. Omit for transfers.",
        },
        accountId: {
          type: Type.STRING,
          description:
            "The account ID from the user's account list. Required for expense and income. Omit for transfers.",
        },
        fromAccountId: {
          type: Type.STRING,
          description: "The source account ID. Required for transfers only.",
        },
        toAccountId: {
          type: Type.STRING,
          description:
            "The destination account ID. Required for transfers only.",
        },
        date: {
          type: Type.STRING,
          description: "The transaction date in YYYY-MM-DD format.",
        },
        note: {
          type: Type.STRING,
          description: "An optional note about the transaction.",
        },
      },
      required: ["transactionType", "amount", "date"],
    },
  };

  const addCategory: FunctionDeclaration = {
    name: "add_category",
    description:
      "Add a new category to the user's settings. Only call this after the user has confirmed they want to add it.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        categoryName: {
          type: Type.STRING,
          description: "The name of the new category to add.",
        },
        categoryType: {
          type: Type.STRING,
          enum: ["expense", "income"],
          description: "Whether this is an expense or income category.",
        },
      },
      required: ["categoryName", "categoryType"],
    },
  };

  return [{ functionDeclarations: [saveTransaction, addCategory] }];
}
