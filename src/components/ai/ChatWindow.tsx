"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType } from "@/hooks/useChat";
import ChatMessage from "./ChatMessage";
import { Bot } from "lucide-react";

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
          <div className="w-14 h-14 rounded-full bg-fintrak-sidebar flex items-center justify-center">
            <Bot size={28} className="text-white" />
          </div>
          <div>
            <p className="text-fintrak-text-primary font-semibold text-lg">
              AI Financial Advisor
            </p>
            <p className="text-fintrak-text-secondary text-sm mt-1 max-w-sm">
              Ask me anything about your finances. I have access to all your
              transactions, goals, and spending patterns.
            </p>
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {[
              "How am I doing this month?",
              "Where am I overspending?",
              "How long until I hit my goal?",
              "What's my biggest expense category?",
            ].map((suggestion) => (
              <span
                key={suggestion}
                className="px-3 py-1.5 rounded-full text-xs border border-fintrak-border text-fintrak-text-secondary bg-white"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => {
        // For an empty assistant message that is still streaming,
        // render the dots inside the bubble instead of empty content
        const isStreamingPlaceholder =
          message.role === "assistant" && message.content === "" && isLoading;

        if (isStreamingPlaceholder) {
          return (
            <div key={message.id} className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full bg-fintrak-sidebar flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border border-fintrak-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-fintrak-text-secondary animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-fintrak-text-secondary animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-fintrak-text-secondary animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          );
        }

        return <ChatMessage key={message.id} message={message} />;
      })}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
