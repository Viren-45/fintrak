// src/components/recurring/RecurringFormDialog.tsx

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecurringCharges } from "@/hooks/useRecurringCharges";
import { useSettings } from "@/hooks/useSettings";
import { useAccounts } from "@/hooks/useAccounts";
import type { RecurringCharge, AddRecurringChargeInput } from "@/types";

const EMPTY_FORM: AddRecurringChargeInput = {
  accountId: "",
  name: "",
  amount: 0,
  category: "",
  type: "expense",
  frequency: "monthly",
  nextDueDate: new Date().toISOString().split("T")[0],
  endDate: null,
};

// Today's date string — used as min for date inputs to block past dates
const TODAY = new Date().toISOString().split("T")[0];

// ─── Inner form — keyed so it remounts fresh on every open/edit ────────────
function RecurringFormContent({
  editing,
  onOpenChange,
}: {
  editing?: RecurringCharge | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { addCharge, updateCharge, isAdding, isUpdating } =
    useRecurringCharges();
  const { settings } = useSettings();
  const { accounts } = useAccounts();

  const [form, setForm] = useState<AddRecurringChargeInput>(
    editing
      ? {
          accountId: editing.accountId,
          name: editing.name,
          amount: editing.amount,
          category: editing.category,
          type: editing.type,
          frequency: editing.frequency,
          nextDueDate: editing.nextDueDate,
          endDate: editing.endDate,
        }
      : EMPTY_FORM,
  );
  const [error, setError] = useState<string | null>(null);

  const categories =
    form.type === "expense"
      ? settings.expenseCategories
      : settings.incomeCategories;

  const busy = isAdding || isUpdating;

  async function handleSubmit() {
    setError(null);

    if (!form.name.trim()) return setError("Name is required.");
    if (!form.amount || form.amount <= 0)
      return setError("Enter a valid amount.");
    if (!form.category) return setError("Select a category.");
    if (!form.accountId) return setError("Select an account.");
    if (!form.nextDueDate) return setError("Set a next due date.");
    if (form.endDate && form.endDate <= form.nextDueDate)
      return setError("End date must be after the next due date.");

    try {
      if (editing) {
        await updateCharge({ id: editing.id, input: form });
      } else {
        await addCharge(form);
      }
      onOpenChange(false);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle style={{ color: "#0F172A" }}>
          {editing ? "Edit recurring charge" : "Add recurring charge"}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4 pt-1">
        {/* Name */}
        <div className="space-y-1.5">
          <Label style={{ color: "#0F172A" }}>Name</Label>
          <Input
            placeholder="e.g. Netflix, Rent, Gym"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Type toggle */}
        <div className="space-y-1.5">
          <Label style={{ color: "#0F172A" }}>Type</Label>
          <div
            className="flex rounded-lg p-1 gap-1"
            style={{ backgroundColor: "#F1F5F9" }}
          >
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, type: t, category: "" }))
                }
                className="flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-all duration-150"
                style={
                  form.type === t
                    ? {
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }
                    : { color: "#64748B" }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label style={{ color: "#0F172A" }}>Amount (CAD)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                amount: parseFloat(e.target.value) || 0,
              }))
            }
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label style={{ color: "#0F172A" }}>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account */}
        <div className="space-y-1.5">
          <Label style={{ color: "#0F172A" }}>Account</Label>
          <Select
            value={form.accountId}
            onValueChange={(v) => setForm((f) => ({ ...f, accountId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nickname ?? a.bankId ?? a.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Frequency */}
        <div className="space-y-1.5">
          <Label style={{ color: "#0F172A" }}>Frequency</Label>
          <Select
            value={form.frequency}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                frequency: v as AddRecurringChargeInput["frequency"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Every 2 weeks</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Next due date — no past dates */}
        <div className="space-y-1.5">
          <Label style={{ color: "#0F172A" }}>Next due date</Label>
          <Input
            type="date"
            min={TODAY}
            value={form.nextDueDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, nextDueDate: e.target.value }))
            }
          />
        </div>

        {/* End date — must be after next due date */}
        <div className="space-y-1.5">
          <Label style={{ color: "#0F172A" }}>
            End date{" "}
            <span style={{ color: "#94A3B8", fontWeight: 400 }}>
              (optional)
            </span>
          </Label>
          <Input
            type="date"
            min={form.nextDueDate || TODAY}
            value={form.endDate ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, endDate: e.target.value || null }))
            }
          />
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            Leave blank if this charge never ends.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm" style={{ color: "#EF4444" }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50 mt-1"
          style={{ backgroundColor: "#3B82F6" }}
          onMouseEnter={(e) =>
            !busy && (e.currentTarget.style.backgroundColor = "#2563EB")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#3B82F6")
          }
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          {editing ? "Save changes" : "Add charge"}
        </button>
      </div>
    </>
  );
}

// ─── Outer shell — keys inner content to force remount on each open/edit ──
export default function RecurringFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: RecurringCharge | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <RecurringFormContent
          key={editing?.id ?? "new"}
          editing={editing}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
