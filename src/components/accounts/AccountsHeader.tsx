"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AccountsHeaderProps {
  onAddAccount: () => void;
}

export default function AccountsHeader({ onAddAccount }: AccountsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-fintrak-text-primary">
          Accounts
        </h1>
        <p className="text-sm text-fintrak-text-secondary mt-1">
          Manage your accounts and track balances
        </p>
      </div>

      <Button
        onClick={onAddAccount}
        className="bg-fintrak-accent hover:bg-fintrak-accent/90 text-white"
      >
        <Plus size={16} className="mr-1.5" />
        Add Account
      </Button>
    </div>
  );
}
