"use client";

import { useRouter, useSearchParams } from "next/navigation";
import TransactionList from "./TransactionList";
import { ArrowLeftRight } from "lucide-react";
import type { TransactionType } from "@/types";

// The three segments — transfer is a placeholder for now
type Segment = TransactionType | "transfer";

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

  // Read active segment from URL, default to "expense"
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
                px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
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
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center border border-dashed border-fintrak-border rounded-lg">
          <div className="p-4 rounded-full bg-fintrak-bg border border-fintrak-border">
            <ArrowLeftRight size={28} className="text-fintrak-text-secondary" />
          </div>
          <div>
            <p className="text-fintrak-text-primary font-semibold text-lg">
              Transfers coming soon
            </p>
            <p className="text-fintrak-text-secondary text-sm mt-1 max-w-sm">
              Move money between your accounts and keep your balances accurate.
            </p>
          </div>
        </div>
      ) : (
        // key forces a fresh mount when switching between income/expense
        // so filters reset cleanly per segment
        <TransactionList key={activeSegment} type={activeSegment} />
      )}
    </div>
  );
}
