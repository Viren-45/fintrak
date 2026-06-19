"use client";

import { Plus } from "lucide-react";
import { useQuickAdd } from "./QuickAddProvider";

export default function QuickAddButton() {
  const { openDialog } = useQuickAdd();

  return (
    <button
      onClick={() => openDialog("expense")}
      aria-label="Add transaction"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      className="
        fixed bottom-6 right-6 z-40
        w-12 h-12 rounded-full
        bg-fintrak-accent hover:bg-fintrak-accent/90
        text-white shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-150 active:scale-95
        cursor-pointer
      "
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}
