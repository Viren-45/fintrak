"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

async function fetchWeeklyDigest(): Promise<string> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content:
            "Generate a brief weekly financial digest for me. Cover: total spent this week, biggest expense category, any budget warnings, and goal progress. Keep it to 4-5 bullet points. Be specific with numbers.",
        },
      ],
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? "Failed to generate digest");
  }

  if (!response.body) throw new Error("No response body");

  // Read the stream and accumulate the full text
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

    for (const line of lines) {
      const data = line.replace("data: ", "").trim();
      if (data === "[DONE]") break;

      try {
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.token) fullText += parsed.token;
      } catch {
        // Skip malformed chunks
      }
    }
  }

  return fullText;
}

export default function WeeklyDigest() {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    data: digest,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["weekly-digest"],
    queryFn: fetchWeeklyDigest,
    // Cache for 1 hour — never refetches unless explicitly invalidated
    staleTime: 1000 * 60 * 60,
    // Keep cached data even when component unmounts
    gcTime: 1000 * 60 * 60,
  });

  return (
    <Card className="border-fintrak-border shadow-sm bg-gradient-to-r from-fintrak-sidebar to-fintrak-sidebar/90">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-fintrak-accent" />
            <span className="text-sm font-semibold text-white">
              Weekly Digest
            </span>
          </div>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-fintrak-sidebar-text hover:text-white transition-colors"
            aria-label={isExpanded ? "Collapse digest" : "Expand digest"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="mt-3">
            {isLoading ? (
              <div className="flex items-center gap-2 text-fintrak-sidebar-text text-sm">
                <Loader2 size={14} className="animate-spin" />
                Generating your weekly summary...
              </div>
            ) : error ? (
              <p className="text-sm text-fintrak-expense">
                {error instanceof Error
                  ? error.message
                  : "Failed to load digest"}
              </p>
            ) : digest ? (
              <div className="text-sm text-fintrak-sidebar-text leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-white">
                        {children}
                      </strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-1 mb-2">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex gap-2 text-sm">{children}</li>
                    ),
                  }}
                >
                  {digest}
                </ReactMarkdown>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
