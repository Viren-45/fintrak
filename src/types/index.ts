// ─── Transaction ───────────────────────────────────────────────────────────────
export type TransactionType = "expense" | "income";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO date string e.g. "2025-01-15"
  note?: string;
  accountId: string;
  createdAt: string; // ISO datetime string
};

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

// ─── Account ─────────────────────────────────────────────────────────────────
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
  lastFour?: string; // undefined for cash / investment, optional otherwise
  openingBalance: number; // signed: negative for credit card debt
  creditLimit?: number; // undefined unless credit card with a limit
  createdAt: string;
};

// ─── Quick Add Dialog ──────────────────────────────────────────────────────────
// Used to control the floating + button dialog state
export type QuickAddType = "expense" | "income";
