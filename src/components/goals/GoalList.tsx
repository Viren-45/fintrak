"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import GoalCard from "./GoalCard";
import GoalForm from "./GoalForm";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trophy } from "lucide-react";

export default function GoalList() {
  const { activeGoals, completedGoals, isLoading, error } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2
          size={24}
          className="animate-spin text-fintrak-text-secondary"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-fintrak-expense/30 rounded-md px-4 py-3">
        <p className="text-sm text-fintrak-expense">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-fintrak-text-secondary">
          {activeGoals.length} active{" "}
          {activeGoals.length === 1 ? "goal" : "goals"}
        </p>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-fintrak-accent hover:bg-fintrak-accent/90 text-white"
        >
          <Plus size={16} className="mr-1.5" />
          New Goal
        </Button>
      </div>

      {/* Active goals */}
      {activeGoals.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-fintrak-border rounded-lg">
          <p className="text-fintrak-text-secondary text-sm">
            No active goals. Create one to start tracking your savings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {/* Completed goals archive */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowArchive((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-medium text-fintrak-text-secondary hover:text-fintrak-text-primary transition-colors"
          >
            <Trophy size={16} className="text-fintrak-warning" />
            Achieved Goals ({completedGoals.length})
            <span className="text-xs">{showArchive ? "▲" : "▼"}</span>
          </button>

          {showArchive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create goal form dialog */}
      <GoalForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
