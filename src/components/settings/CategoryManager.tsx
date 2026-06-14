"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCategoryManagement } from "@/hooks/useCategoryManagement";
import type { TransactionType } from "@/types";

interface CategoryManagerProps {
  title: string;
  type: TransactionType;
  categories: string[];
  onChange: (updated: string[]) => void;
  permanentItems?: string[];
}

export default function CategoryManager({
  title,
  type,
  categories,
  onChange,
  permanentItems = [],
}: CategoryManagerProps) {
  const { countTransactionsByCategory, reassignCategory, isReassigning } =
    useCategoryManagement();

  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  // Category awaiting delete confirmation — set only if it's in use
  const [pendingDelete, setPendingDelete] = useState<{
    category: string;
    count: number;
  } | null>(null);

  // Tracks which category chip is currently being checked
  const [checkingCategory, setCheckingCategory] = useState<string | null>(null);

  function handleAdd() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) {
      setError("Category already exists");
      return;
    }

    onChange([...categories, trimmed]);
    setNewCategory("");
    setError("");
  }

  async function handleDeleteClick(category: string) {
    setCheckingCategory(category);

    try {
      const count = await countTransactionsByCategory(type, category);

      if (count > 0) {
        setPendingDelete({ category, count });
      } else {
        onChange(categories.filter((c) => c !== category));
      }
    } catch {
      toast.error("Failed to check category usage", {
        description: "Please try again.",
      });
    } finally {
      setCheckingCategory(null);
    }
  }

  async function handleConfirmReassign() {
    if (!pendingDelete) return;

    const { category, count } = pendingDelete;
    const entryLabel = count === 1 ? "entry" : "entries";
    const typeLabel = type === "expense" ? "expense" : "income";

    try {
      await reassignCategory({
        type,
        fromCategory: category,
        toCategory: "Other",
      });

      onChange(categories.filter((c) => c !== category));

      toast.success("Category deleted", {
        description: `${count} ${typeLabel} ${entryLabel} moved to "Other".`,
      });

      setPendingDelete(null);
    } catch {
      toast.error("Failed to reassign transactions", {
        description: "Please try again.",
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-fintrak-text-primary">
        {title}
      </h3>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isPermanent = permanentItems.includes(cat);
          const isChecking = checkingCategory === cat;

          return (
            <span
              key={cat}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-fintrak-bg border border-fintrak-border text-fintrak-text-primary"
            >
              {cat}
              {!isPermanent && (
                <button
                  type="button"
                  onClick={() => handleDeleteClick(cat)}
                  disabled={isChecking}
                  className="text-fintrak-text-secondary hover:text-fintrak-expense transition-colors disabled:opacity-50"
                  aria-label={`Remove ${cat}`}
                >
                  {isChecking ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <X size={13} />
                  )}
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          placeholder="New category..."
          value={newCategory}
          onChange={(e) => {
            setNewCategory(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          className="border-fintrak-border focus-visible:ring-fintrak-accent"
        />
        <Button
          type="button"
          onClick={handleAdd}
          variant="outline"
          className="border-fintrak-border text-fintrak-text-primary hover:bg-fintrak-bg shrink-0"
        >
          <Plus size={16} />
          Add
        </Button>
      </div>

      {error && <p className="text-xs text-fintrak-expense">{error}</p>}

      {/* Reassign confirmation dialog */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="bg-fintrak-card border-fintrak-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fintrak-text-primary">
              &ldquo;{pendingDelete?.category}&rdquo; is in use
            </AlertDialogTitle>
            <AlertDialogDescription className="text-fintrak-text-secondary">
              {pendingDelete?.count} {type === "expense" ? "expense" : "income"}{" "}
              entr
              {pendingDelete?.count === 1 ? "y" : "ies"} use this category.
              Deleting it will move{" "}
              {pendingDelete?.count === 1 ? "that entry" : "those entries"} to
              &ldquo;Other&rdquo;. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-fintrak-border text-fintrak-text-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReassign}
              disabled={isReassigning}
              className="bg-fintrak-expense hover:bg-fintrak-expense/90 text-white"
            >
              {isReassigning ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Moving...
                </>
              ) : (
                "Delete & Move to Other"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
