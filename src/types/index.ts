// ─── Transaction ───────────────────────────────────────────────────────────────
export type TransactionType = "expense" | "income";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO date string e.g. "2025-01-15"
  note?: string;
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

// ─── Quick Add Dialog ──────────────────────────────────────────────────────────
// Used to control the floating + button dialog state
export type QuickAddType = "expense" | "income";
