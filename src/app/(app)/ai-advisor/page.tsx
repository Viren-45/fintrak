"use client";

import { useChat } from "@/hooks/useChat";
import ChatWindow from "@/components/ai/ChatWindow";
import ChatInput from "@/components/ai/ChatInput";
import WeeklyDigest from "@/components/ai/WeeklyDigest";

export default function AIAdvisorPage() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-fintrak-text-primary">
            AI Advisor
          </h1>
          <p className="text-sm text-fintrak-text-secondary mt-1">
            Ask anything about your finances
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="text-xs text-fintrak-text-secondary hover:text-fintrak-text-primary transition-colors"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Weekly digest */}
      <div className="shrink-0 mb-4">
        <WeeklyDigest />
      </div>

      {/* Chat container */}
      <div className="flex flex-col flex-1 bg-white border border-fintrak-border rounded-xl overflow-hidden min-h-0">
        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-fintrak-expense/20 shrink-0">
            <p className="text-xs text-fintrak-expense">{error}</p>
          </div>
        )}

        {/* Messages */}
        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* Input */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
