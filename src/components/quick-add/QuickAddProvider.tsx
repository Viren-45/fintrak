"use client";

import { createContext, useContext, useState } from "react";
import type { QuickAddType } from "@/types";

type QuickAddContextType = {
  isOpen: boolean;
  defaultType: QuickAddType;
  openDialog: (type?: QuickAddType) => void;
  closeDialog: () => void;
};

const QuickAddContext = createContext<QuickAddContextType | null>(null);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<QuickAddType>("expense");

  function openDialog(type: QuickAddType = "expense") {
    setDefaultType(type);
    setIsOpen(true);
  }

  function closeDialog() {
    setIsOpen(false);
  }

  return (
    <QuickAddContext.Provider
      value={{ isOpen, defaultType, openDialog, closeDialog }}
    >
      {children}
    </QuickAddContext.Provider>
  );
}

// Custom hook — components use this to open/close the dialog
export function useQuickAdd() {
  const context = useContext(QuickAddContext);
  if (!context) {
    throw new Error("useQuickAdd must be used within a QuickAddProvider");
  }
  return context;
}
