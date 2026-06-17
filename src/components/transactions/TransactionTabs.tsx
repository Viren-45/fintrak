// src/components/transactions/TransactionTabs.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import TransactionList from "./TransactionList";
import TransferList from "./TransferList";
import type { TransactionType } from "@/types";

type Segment = TransactionType;

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: "expense", label: "Expenses" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfers" },
];

function isValidSegment(value: string | null): value is Segment {
  return value === "expense" || value === "income" || value === "transfer";
}

export default function TransactionTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const typeParam = searchParams.get("type");
  const activeSegment: Segment = isValidSegment(typeParam)
    ? typeParam
    : "expense";

  function handleSegmentChange(segment: Segment) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", segment);
    router.push(`/transactions?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Segmented toggle */}
      <div className="inline-flex rounded-lg border border-fintrak-border p-1 bg-fintrak-card">
        {SEGMENTS.map((segment) => {
          const isActive = activeSegment === segment.value;
          return (
            <button
              key={segment.value}
              onClick={() => handleSegmentChange(segment.value)}
              className={`
                px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer
                ${
                  isActive
                    ? "bg-fintrak-accent text-white"
                    : "text-fintrak-text-secondary hover:text-fintrak-text-primary"
                }
              `}
            >
              {segment.label}
            </button>
          );
        })}
      </div>

      {/* Active segment content */}
      {activeSegment === "transfer" ? (
        <TransferList />
      ) : (
        <TransactionList key={activeSegment} type={activeSegment} />
      )}
    </div>
  );
}
