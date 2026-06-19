// src/components/recurring/RecurringView.tsx

"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRecurringCharges } from "@/hooks/useRecurringCharges";
import RecurringSummaryStrip from "./RecurringSummaryStrip";
import RecurringChargeCard from "./RecurringChargeCard";
import RecurringFormDialog from "./RecurringFormDialog";
import EmptyRecurring from "./EmptyRecurring";
import type { RecurringCharge } from "@/types";

export default function RecurringView() {
  const { charges, activeCharges, pausedCharges, isLoading, error } =
    useRecurringCharges();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringCharge | null>(null);

  function handleEdit(charge: RecurringCharge) {
    setEditing(charge);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "#94A3B8" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{ backgroundColor: "#FEF2F2", color: "#EF4444" }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page heading ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#0F172A" }}
          >
            Recurring Charges
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
            Subscriptions and bills posted automatically on schedule.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 cursor-pointer"
          style={{ backgroundColor: "#3B82F6" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563EB")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#3B82F6")
          }
        >
          <Plus size={16} strokeWidth={2.5} />
          Add charge
        </button>
      </div>

      {/* ── Summary strip ── */}
      {charges.length > 0 && <RecurringSummaryStrip charges={charges} />}

      {/* ── Empty state ── */}
      {charges.length === 0 && <EmptyRecurring onAdd={handleAdd} />}

      {/* ── Active charges ── */}
      {activeCharges.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#22C55E" }}
            />
            <h2
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#64748B" }}
            >
              Active — {activeCharges.length}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeCharges.map((charge) => (
              <RecurringChargeCard
                key={charge.id}
                charge={charge}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Paused charges ── */}
      {pausedCharges.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#F59E0B" }}
            />
            <h2
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#64748B" }}
            >
              Paused — {pausedCharges.length}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pausedCharges.map((charge) => (
              <RecurringChargeCard
                key={charge.id}
                charge={charge}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Form dialog ── */}
      <RecurringFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
      />
    </div>
  );
}
