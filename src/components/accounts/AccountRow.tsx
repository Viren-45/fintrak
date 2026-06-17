"use client";

import { getBankById, getBankLogoUrl } from "@/lib/banks";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Account } from "@/types";
import { ACCOUNT_TYPE_META } from "@/lib/accountMeta";

function getAccountLabel(account: Account): string {
  if (account.nickname) return account.nickname;
  const typeLabel = ACCOUNT_TYPE_META[account.type].label;
  if (account.bankId) {
    const bank = getBankById(account.bankId);
    if (bank) return `${bank.name} — ${typeLabel}`;
  }
  return typeLabel;
}

function getAccountSubtext(account: Account): string {
  const parts: string[] = [];
  if (account.bankId) {
    const bank = getBankById(account.bankId);
    if (bank) parts.push(bank.name);
  } else {
    parts.push(ACCOUNT_TYPE_META[account.type].label);
  }
  if (account.lastFour) parts.push(`•••• ${account.lastFour}`);
  return parts.join(" ");
}

interface AccountRowProps {
  account: Account;
  balance: number;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export default function AccountRow({
  account,
  balance,
  onEdit,
  onDelete,
}: AccountRowProps) {
  const isDebt = balance < 0;
  const logoUrl = account.bankId ? getBankLogoUrl(account.bankId) : null;

  return (
    <div className="flex items-center justify-between w-full px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo or fallback icon */}
        <div className="w-10 h-10 rounded-lg bg-fintrak-bg border border-fintrak-border shrink-0 flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-fintrak-text-secondary">
              {ACCOUNT_TYPE_META[account.type].icon}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-fintrak-text-primary truncate">
            {getAccountLabel(account)}
          </p>
          <p className="text-xs text-fintrak-text-secondary truncate">
            {getAccountSubtext(account)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <span
            className={`text-sm font-semibold ${
              isDebt ? "text-fintrak-expense" : "text-fintrak-text-primary"
            }`}
          >
            {formatCurrency(Math.abs(balance))}
          </span>
          {isDebt && (
            <p className="text-xs text-fintrak-text-secondary">owed</p>
          )}
        </div>

        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-md text-fintrak-text-secondary hover:text-fintrak-text-primary hover:bg-fintrak-bg transition-colors cursor-pointer focus:outline-none"
              aria-label="Account options"
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => onEdit(account)}
              className="cursor-pointer"
            >
              <Pencil size={14} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(account)}
              className="cursor-pointer text-fintrak-expense focus:text-fintrak-expense"
            >
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
