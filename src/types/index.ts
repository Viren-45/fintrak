//  src/types/index.ts

// ─── Transaction ───────────────────────────────────────────────────────────────

export type TransactionType = "expense" | "income" | "transfer";

// Income or expense — has a category and one account
export type IncomeExpenseTransaction = {
  id: string;
  type: "expense" | "income";
  amount: number;
  category: string;
  date: string;
  note?: string;
  accountId: string;
  createdAt: string;
};

// Transfer — moves money between two accounts, no category
export type TransferTransaction = {
  id: string;
  type: "transfer";
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  date: string;
  note?: string;
  createdAt: string;
};

// The union — a Transaction is either an income/expense or a transfer
export type Transaction = IncomeExpenseTransaction | TransferTransaction;

// ─── Type guards ───────────────────────────────────────────────────────────────

/**
 * Narrows a Transaction to IncomeExpenseTransaction.
 * Use this before accessing category or accountId.
 */
export function isIncomeExpense(t: Transaction): t is IncomeExpenseTransaction {
  return t.type === "expense" || t.type === "income";
}

/**
 * Narrows a Transaction to TransferTransaction.
 * Use this before accessing fromAccountId or toAccountId.
 */
export function isTransfer(t: Transaction): t is TransferTransaction {
  return t.type === "transfer";
}

// ─── Goal ──────────────────────────────────────────────────────────────────────
export type GoalStatus = "active" | "completed";

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string; // ISO date string, optional
  description?: string;
  status: GoalStatus;
  createdAt: string;
};

// ─── Budget ────────────────────────────────────────────────────────────────────
export type Budget = {
  id: string;
  category: string;
  monthlyLimit: number;
  createdAt: string;
};

// ─── Settings ──────────────────────────────────────────────────────────────────
export type Settings = {
  currency: string; // e.g. "CAD"
  expenseCategories: string[];
  incomeCategories: string[];
};

// ─── Quick Add ─────────────────────────────────────────────────────────────────
// Used to control the floating + button dialog state
export type QuickAddType = "expense" | "income" | "transfer";

// ─── Account ───────────────────────────────────────────────────────────────────
export type AccountType =
  | "chequing"
  | "savings"
  | "credit_card"
  | "cash"
  | "investment";

export type Account = {
  id: string;
  type: AccountType;
  bankId?: string; // undefined for cash / investment
  nickname?: string; // undefined = fall back to bank + type label
  lastFour?: string; // undefined for cash / investment
  openingBalance: number; // signed: negative for credit card debt
  creditLimit?: number; // undefined unless credit card with a limit set
  createdAt: string;
};
