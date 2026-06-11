"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
}

function getEmptyForm() {
  return {
    name: "",
    targetAmount: "",
    savedAmount: "",
    deadline: "",
    description: "",
    error: "",
  };
}

export default function GoalForm({ open, onClose }: GoalFormProps) {
  const { addGoal, isAdding } = useGoals();
  const [form, setForm] = useState(getEmptyForm);

  function handleClose() {
    setForm(getEmptyForm());
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForm((prev) => ({ ...prev, error: "" }));

    if (!form.name.trim()) {
      setForm((prev) => ({ ...prev, error: "Please enter a goal name" }));
      return;
    }
    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      setForm((prev) => ({
        ...prev,
        error: "Please enter a valid target amount",
      }));
      return;
    }
    if (form.savedAmount && Number(form.savedAmount) < 0) {
      setForm((prev) => ({
        ...prev,
        error: "Saved amount cannot be negative",
      }));
      return;
    }
    if (
      form.savedAmount &&
      Number(form.savedAmount) > Number(form.targetAmount)
    ) {
      setForm((prev) => ({
        ...prev,
        error: "Saved amount cannot exceed target amount",
      }));
      return;
    }

    try {
      await addGoal({
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        savedAmount: Number(form.savedAmount) || 0,
        deadline: form.deadline || undefined,
        description: form.description.trim() || undefined,
      });
      handleClose();
    } catch {
      setForm((prev) => ({
        ...prev,
        error: "Something went wrong. Please try again.",
      }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-fintrak-card border-fintrak-border">
        <DialogHeader>
          <DialogTitle className="text-fintrak-text-primary text-lg font-semibold">
            Create New Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {form.error && (
            <p className="text-sm text-fintrak-expense">{form.error}</p>
          )}

          {/* Goal name */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Goal name
            </Label>
            <Input
              placeholder="e.g. Vacation Fund"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="border-fintrak-border focus-visible:ring-fintrak-accent"
            />
          </div>

          {/* Target amount */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Target amount
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
                value={form.targetAmount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, targetAmount: e.target.value }))
                }
                className="pl-7 border-fintrak-border focus-visible:ring-fintrak-accent"
              />
            </div>
          </div>

          {/* Already saved */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Already saved{" "}
              <span className="text-fintrak-text-secondary font-normal">
                (optional)
              </span>
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
                value={form.savedAmount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, savedAmount: e.target.value }))
                }
                className="pl-7 border-fintrak-border focus-visible:ring-fintrak-accent"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Deadline{" "}
              <span className="text-fintrak-text-secondary font-normal">
                (optional)
              </span>
            </Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, deadline: e.target.value }))
              }
              className="border-fintrak-border focus-visible:ring-fintrak-accent"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Description{" "}
              <span className="text-fintrak-text-secondary font-normal">
                (optional)
              </span>
            </Label>
            <Input
              placeholder="What is this goal for?"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
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
                  Creating...
                </>
              ) : (
                "Create Goal"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
