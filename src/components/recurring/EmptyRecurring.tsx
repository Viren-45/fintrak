// src/components/recurring/EmptyRecurring.tsx
"use client";

import { RefreshCcw, Plus } from "lucide-react";

interface Props {
  onAdd: () => void;
}

export default function EmptyRecurring({ onAdd }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 rounded-2xl"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: "#EFF6FF" }}
      >
        <RefreshCcw size={28} style={{ color: "#3B82F6" }} strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold mb-1" style={{ color: "#0F172A" }}>
        No recurring charges yet
      </p>
      <p
        className="text-sm mb-6 text-center max-w-xs"
        style={{ color: "#94A3B8" }}
      >
        Add subscriptions, bills, or any charge that repeats on a schedule.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150"
        style={{ backgroundColor: "#3B82F6" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#2563EB")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#3B82F6")
        }
      >
        <Plus size={16} strokeWidth={2} />
        Add your first charge
      </button>
    </div>
  );
}
