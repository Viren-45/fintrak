"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Pause,
  Play,
  Calendar,
  Loader2,
  CreditCard,
} from "lucide-react";
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
import { useRecurringCharges } from "@/hooks/useRecurringCharges";
import type { RecurringCharge } from "@/types";

interface Props {
  charge: RecurringCharge;
  onEdit: (charge: RecurringCharge) => void;
}

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  yearly: "Yearly",
};

const TYPE_COLORS = {
  expense: { text: "#EF4444", bg: "#FEF2F2" },
  income: { text: "#22C55E", bg: "#DCFCE7" },
};

export default function RecurringChargeCard({ charge, onEdit }: Props) {
  const { toggleStatus, deleteCharge, isToggling, isDeleting } =
    useRecurringCharges();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isActive = charge.status === "active";
  const busy = isToggling || isDeleting;

  const typeColor = TYPE_COLORS[charge.type];
  const borderColor = isActive ? "#3B82F6" : "#F59E0B";
  const statusBg = isActive ? "#DCFCE7" : "#FEF3C7";
  const statusText = isActive ? "#16A34A" : "#D97706";
  const statusLabel = isActive ? "Active" : "Paused";

  return (
    <>
      <div
        className="relative rounded-2xl p-5 transition-all duration-200 group"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderLeft: `4px solid ${borderColor}`,
          opacity: isActive ? 1 : 0.75,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 4px 16px rgba(0,0,0,0.06)";
          (e.currentTarget as HTMLDivElement).style.transform =
            "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#EFF6FF" }}
            >
              <CreditCard
                size={18}
                style={{ color: "#3B82F6" }}
                strokeWidth={1.8}
              />
            </div>

            {/* Name + category */}
            <div className="min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "#0F172A" }}
              >
                {charge.name}
              </p>
              <span
                className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5"
                style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
              >
                {charge.category}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: statusBg, color: statusText }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Amount */}
        <p
          className="text-3xl font-bold tracking-tight mb-3"
          style={{ color: "#0F172A" }}
        >
          ${charge.amount.toFixed(2)}
          <span
            className="text-sm font-normal ml-1"
            style={{ color: "#94A3B8" }}
          >
            / {FREQUENCY_LABELS[charge.frequency]?.toLowerCase()}
          </span>
        </p>

        {/* Next due */}
        <div className="flex items-center gap-1.5 mb-4">
          <Calendar size={13} style={{ color: "#94A3B8" }} strokeWidth={1.8} />
          <p className="text-xs" style={{ color: "#64748B" }}>
            Next due{" "}
            <span className="font-medium" style={{ color: "#0F172A" }}>
              {new Date(charge.nextDueDate).toLocaleDateString("en-CA", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #F1F5F9", marginBottom: "12px" }} />

        {/* Action row */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() =>
              toggleStatus({ id: charge.id, currentStatus: charge.status })
            }
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 disabled:opacity-50 cursor-pointer"
            style={{
              backgroundColor: isActive ? "#FEF3C7" : "#DCFCE7",
              color: isActive ? "#D97706" : "#16A34A",
            }}
          >
            {isToggling ? (
              <Loader2 size={12} className="animate-spin" />
            ) : isActive ? (
              <Pause size={12} strokeWidth={2} />
            ) : (
              <Play size={12} strokeWidth={2} />
            )}
            {isActive ? "Pause" : "Resume"}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(charge)}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E2E8F0";
              e.currentTarget.style.color = "#0F172A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F1F5F9";
              e.currentTarget.style.color = "#64748B";
            }}
          >
            <Pencil size={12} strokeWidth={2} />
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 disabled:opacity-50 ml-auto cursor-pointer"
            style={{ backgroundColor: "#FEF2F2", color: "#EF4444" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEE2E2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF2F2";
            }}
          >
            {isDeleting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} strokeWidth={2} />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete recurring charge?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{charge.name}</strong> will be permanently removed. Past
              transactions already posted will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCharge(charge.id)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
