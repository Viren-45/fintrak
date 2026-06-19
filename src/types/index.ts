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

// ─── Recurring Charge ──────────────────────────────────────────────────────────

export type RecurringFrequency = "weekly" | "biweekly" | "monthly" | "yearly";
export type RecurringStatus = "active" | "paused";

export type RecurringCharge = {
  id: string;
  userId: string;
  accountId: string;
  name: string;
  amount: number;
  category: string;
  type: "expense" | "income";
  frequency: RecurringFrequency;
  nextDueDate: string; // ISO date string e.g. "2026-07-05"
  endDate: string | null;
  status: RecurringStatus;
  createdAt: string;
};

// Used when creating a new recurring charge — no id, userId, or createdAt yet
export type AddRecurringChargeInput = {
  accountId: string;
  name: string;
  amount: number;
  category: string;
  type: "expense" | "income";
  frequency: RecurringFrequency;
  nextDueDate: string;
  endDate: string | null;
};

// ─── Notifications ──────────────────────────────────────────────────────────

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};
