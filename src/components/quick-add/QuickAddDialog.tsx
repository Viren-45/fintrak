"use client";

import { useState } from "react";
import { useQuickAdd } from "./QuickAddProvider";
import { useSettings } from "@/hooks/useSettings";
import { useTransactions } from "@/hooks/useTransactions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { QuickAddType } from "@/types";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getEmptyForm(type: QuickAddType) {
  return {
    type,
    amount: "",
    category: "",
    date: getTodayDate(),
    note: "",
    error: "",
  };
}

export default function QuickAddDialog() {
  const { isOpen, defaultType, closeDialog } = useQuickAdd();
  const { settings, isLoading } = useSettings();
  const { addTransaction, isAdding } = useTransactions();

  const [form, setForm] = useState(() => getEmptyForm(defaultType));

  // Reset form when dialog opens with a new defaultType
  const [lastDefaultType, setLastDefaultType] = useState(defaultType);
  if (isOpen && defaultType !== lastDefaultType) {
    setLastDefaultType(defaultType);
    setForm(getEmptyForm(defaultType));
  }

  // Pull categories from Settings
  const categories =
    form.type === "expense"
      ? settings.expenseCategories
      : settings.incomeCategories;

  function handleTypeChange(newType: QuickAddType) {
    setForm((prev) => ({ ...prev, type: newType, category: "" }));
  }

  function handleClose() {
    closeDialog();
    setForm(getEmptyForm("expense"));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForm((prev) => ({ ...prev, error: "" }));

    if (
      !form.amount ||
      isNaN(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setForm((prev) => ({ ...prev, error: "Please enter a valid amount" }));
      return;
    }
    if (!form.category) {
      setForm((prev) => ({ ...prev, error: "Please select a category" }));
      return;
    }

    try {
      await addTransaction({
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        note: form.note || undefined,
      });
      toast.success(
        `${form.type === "expense" ? "Expense" : "Income"} added successfully`,
        {
          description: `${form.category} — $${Number(form.amount).toFixed(2)}`,
        },
      );
      handleClose();
    } catch {
      toast.error("Failed to save transaction", {
        description: "Please try again.",
      });
      setForm((prev) => ({
        ...prev,
        error: "Something went wrong. Please try again.",
      }));
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-fintrak-card border-fintrak-border">
        <DialogHeader>
          <DialogTitle className="text-fintrak-text-primary text-lg font-semibold">
            Add Transaction
          </DialogTitle>
        </DialogHeader>

        {/* Type toggle */}
        <div className="flex rounded-lg border border-fintrak-border p-1 gap-1">
          {(["expense", "income"] as QuickAddType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`
                flex-1 py-1.5 rounded-md text-sm font-medium capitalize
                transition-colors duration-150
                ${
                  form.type === t
                    ? t === "expense"
                      ? "bg-fintrak-expense text-white"
                      : "bg-fintrak-income text-white"
                    : "text-fintrak-text-secondary hover:text-fintrak-text-primary"
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {form.error && (
            <p className="text-sm text-fintrak-expense">{form.error}</p>
          )}

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fintrak-text-secondary text-sm">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="pl-7 border-fintrak-border focus-visible:ring-fintrak-accent"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Category
            </Label>
            {isLoading ? (
              <div className="flex items-center gap-2 text-fintrak-text-secondary text-sm py-2">
                <Loader2 size={14} className="animate-spin" />
                Loading categories...
              </div>
            ) : (
              <Select
                value={form.category}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, category: val }))
                }
              >
                <SelectTrigger className="border-fintrak-border focus:ring-fintrak-accent">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Date
            </Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="border-fintrak-border focus-visible:ring-fintrak-accent"
              required
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Note{" "}
              <span className="text-fintrak-text-secondary font-normal">
                (optional)
              </span>
            </Label>
            <Input
              type="text"
              placeholder="Add a note..."
              value={form.note}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, note: e.target.value }))
              }
              className="border-fintrak-border focus-visible:ring-fintrak-accent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-fintrak-border text-fintrak-text-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAdding}
              className="flex-1 bg-fintrak-accent hover:bg-fintrak-accent/90 text-white"
            >
              {isAdding ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
