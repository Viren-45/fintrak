import {
  Landmark,
  PiggyBank,
  CreditCard,
  Wallet,
  TrendingUp,
} from "lucide-react"
import type { AccountType } from "@/types"

/**
 * Single source of truth for account-type display metadata —
 * the human label and icon for each account type.
 * Imported by account components, transaction rows, and the AI context builder.
 */
export const ACCOUNT_TYPE_META: Record<
  AccountType,
  { label: string; icon: React.ReactNode }
> = {
  chequing: { label: "Chequing", icon: <Landmark size={18} /> },
  savings: { label: "Savings", icon: <PiggyBank size={18} /> },
  credit_card: { label: "Credit Card", icon: <CreditCard size={18} /> },
  cash: { label: "Cash", icon: <Wallet size={18} /> },
  investment: { label: "Investment", icon: <TrendingUp size={18} /> },
}