"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-fintrak-border px-4 py-3 bg-white">
      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your finances..."
          disabled={isLoading}
          rows={1}
          className="
            flex-1 resize-none rounded-xl border border-fintrak-border
            px-4 py-2.5 text-sm text-fintrak-text-primary
            placeholder:text-fintrak-text-secondary
            focus:outline-none focus:ring-2 focus:ring-fintrak-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            max-h-32 overflow-y-auto
            bg-fintrak-bg
          "
          style={{ minHeight: "42px" }}
          onInput={(e) => {
            // Auto grow textarea up to max-h-32
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="
            bg-fintrak-accent hover:bg-fintrak-accent/90
            text-white rounded-xl h-10 w-10 p-0 shrink-0
            disabled:opacity-50
          "
          aria-label="Send message"
        >
          <SendHorizonal size={16} />
        </Button>
      </div>
      <p className="text-xs text-fintrak-text-secondary mt-1.5 text-center">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
