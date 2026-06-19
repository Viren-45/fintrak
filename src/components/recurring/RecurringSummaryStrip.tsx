// src/components/recurring/RecurringSummaryStrip.tsx

"use client";

import { RefreshCcw, Play, Pause } from "lucide-react";
import type { RecurringCharge } from "@/types";

interface Props {
  charges: RecurringCharge[];
}

function StatChip({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div
      className="flex items-center gap-4 px-6 py-5 rounded-2xl flex-1"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} style={{ color: iconColor }} strokeWidth={1.8} />
      </div>
      <div>
        <p
          className="text-2xl font-bold tracking-tight"
          style={{ color: "#0F172A" }}
        >
          {value}
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color: "#94A3B8" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export default function RecurringSummaryStrip({ charges }: Props) {
  const activeCharges = charges.filter((c) => c.status === "active");
  const pausedCharges = charges.filter((c) => c.status === "paused");

  const monthlyTotal = activeCharges.reduce((sum, c) => {
    // Normalise all frequencies to a monthly equivalent
    const multipliers: Record<string, number> = {
      weekly: 4.33,
      biweekly: 2.17,
      monthly: 1,
      yearly: 1 / 12,
    };
    return sum + c.amount * (multipliers[c.frequency] ?? 1);
  }, 0);

  return (
    <div className="flex gap-4 flex-wrap">
      <StatChip
        icon={RefreshCcw}
        label="Monthly commitment"
        value={`$${monthlyTotal.toFixed(2)}`}
        iconColor="#3B82F6"
        iconBg="#EFF6FF"
      />
      <StatChip
        icon={Play}
        label="Active charges"
        value={String(activeCharges.length)}
        iconColor="#22C55E"
        iconBg="#DCFCE7"
      />
      <StatChip
        icon={Pause}
        label="Paused charges"
        value={String(pausedCharges.length)}
        iconColor="#F59E0B"
        iconBg="#FEF3C7"
      />
    </div>
  );
}
