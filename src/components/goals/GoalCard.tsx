"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import { formatCurrency } from "@/lib/utils/formatcurrency";
import {
  calcGoalProgress,
  calcDaysRemaining,
  calcProjectedCompletion,
} from "@/lib/utils/calculations";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trophy, Trash2 } from "lucide-react";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
  const {
    updateSavedAmount,
    updateGoalStatus,
    deleteGoal,
    isUpdatingSaved,
    isUpdatingStatus,
    isDeleting,
  } = useGoals();

  const [addAmount, setAddAmount] = useState("");
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [addError, setAddError] = useState("");

  const progress = calcGoalProgress(goal.savedAmount, goal.targetAmount);
  const daysRemaining = calcDaysRemaining(goal.deadline);
  const projectedCompletion = calcProjectedCompletion(
    goal.savedAmount,
    goal.targetAmount,
    goal.createdAt,
  );

  async function handleAddMoney() {
    setAddError("");
    const amount = Number(addAmount);

    if (!addAmount || isNaN(amount) || amount <= 0) {
      setAddError("Please enter a valid amount");
      return;
    }

    const newSaved = goal.savedAmount + amount;

    try {
      await updateSavedAmount({
        id: goal.id,
        savedAmount: newSaved,
      });

      // Auto complete if target reached
      if (newSaved >= goal.targetAmount && goal.status === "active") {
        setShowCompleteDialog(true);
      }

      setAddAmount("");
      setShowAddMoney(false);
    } catch {
      setAddError("Something went wrong. Please try again.");
    }
  }

  async function handleMarkComplete() {
    try {
      await updateGoalStatus({ id: goal.id, status: "completed" });
      setShowCompleteDialog(false);
    } catch {
      // error handled by hook
    }
  }

  async function handleDelete() {
    try {
      await deleteGoal(goal.id);
      setShowDeleteDialog(false);
    } catch {
      // error handled by hook
    }
  }

  const isCompleted = goal.status === "completed";

  return (
    <>
      <Card className="border-fintrak-border shadow-sm">
        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-fintrak-text-primary truncate">
                  {goal.name}
                </h3>
                {isCompleted && (
                  <Trophy size={16} className="text-fintrak-warning shrink-0" />
                )}
              </div>
              {goal.description && (
                <p className="text-xs text-fintrak-text-secondary mt-0.5 truncate">
                  {goal.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-1.5 rounded-md text-fintrak-text-secondary hover:text-fintrak-expense hover:bg-red-50 transition-colors shrink-0"
              aria-label="Delete goal"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-fintrak-text-primary">
                {formatCurrency(goal.savedAmount)}
              </span>
              <span className="text-xs text-fintrak-text-secondary">
                of {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-fintrak-border">
              <div
                className={`h-full rounded-full transition-all ${
                  progress >= 100
                    ? "bg-fintrak-accent"
                    : progress >= 70
                      ? "bg-fintrak-income"
                      : "bg-fintrak-accent"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-xs font-medium ${
                  progress >= 100
                    ? "text-fintrak-accent"
                    : "text-fintrak-text-secondary"
                }`}
              >
                {progress}% complete
              </span>
              {!isCompleted && (
                <span className="text-xs text-fintrak-text-secondary">
                  {formatCurrency(
                    Math.max(goal.targetAmount - goal.savedAmount, 0),
                  )}{" "}
                  remaining
                </span>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {daysRemaining !== null && !isCompleted && (
              <p className="text-xs text-fintrak-text-secondary">
                <span
                  className={daysRemaining < 0 ? "text-fintrak-expense" : ""}
                >
                  {daysRemaining < 0
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : `${daysRemaining} days left`}
                </span>
              </p>
            )}
            {projectedCompletion && !isCompleted && (
              <p className="text-xs text-fintrak-text-secondary">
                Projected: {projectedCompletion}
              </p>
            )}
            {isCompleted && (
              <p className="text-xs text-fintrak-income font-medium">
                ✓ Goal achieved
              </p>
            )}
          </div>

          {/* Add money section */}
          {!isCompleted && (
            <div>
              {showAddMoney ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fintrak-text-secondary text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={addAmount}
                        onChange={(e) => {
                          setAddAmount(e.target.value);
                          setAddError("");
                        }}
                        className="pl-7 border-fintrak-border focus-visible:ring-fintrak-accent h-9 text-sm"
                        autoFocus
                      />
                    </div>
                    <Button
                      onClick={handleAddMoney}
                      disabled={isUpdatingSaved}
                      className="bg-fintrak-accent hover:bg-fintrak-accent/90 text-white h-9 text-sm"
                    >
                      {isUpdatingSaved ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Add"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddMoney(false);
                        setAddAmount("");
                        setAddError("");
                      }}
                      className="border-fintrak-border text-fintrak-text-secondary h-9 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                  {addError && (
                    <p className="text-xs text-fintrak-expense">{addError}</p>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAddMoney(true)}
                  className="w-full border-fintrak-border text-fintrak-text-primary hover:bg-fintrak-bg h-9 text-sm"
                >
                  <Plus size={14} className="mr-1.5" />
                  Add Money
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-complete dialog */}
      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent className="bg-fintrak-card border-fintrak-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fintrak-text-primary">
              🎉 Goal reached!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-fintrak-text-secondary">
              You&apos;ve hit your target for &quot;{goal.name}&quot;. Mark it
              as complete and move it to your achieved goals?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-fintrak-border text-fintrak-text-secondary">
              Not yet
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkComplete}
              disabled={isUpdatingStatus}
              className="bg-fintrak-accent hover:bg-fintrak-accent/90 text-white"
            >
              {isUpdatingStatus ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                "Mark Complete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-fintrak-card border-fintrak-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fintrak-text-primary">
              Delete this goal?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-fintrak-text-secondary">
              &quot;{goal.name}&quot; will be permanently deleted. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-fintrak-border text-fintrak-text-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-fintrak-expense hover:bg-fintrak-expense/90 text-white"
            >
              {isDeleting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
