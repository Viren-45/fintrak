"use client";

import { useState, useCallback } from "react";

export type MessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
};

type AnthropicMessage = {
  role: MessageRole;
  content: string;
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isLoading) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: userInput.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Create a placeholder assistant message that we'll stream into
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      try {
        const history: AnthropicMessage[] = [...messages, userMessage].map(
          (m) => ({ role: m.role, content: m.content }),
        );

        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to get response");
        }

        if (!response.body) throw new Error("No response body");

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk
            .split("\n")
            .filter((line) => line.startsWith("data: "));

          for (const line of lines) {
            const data = line.replace("data: ", "").trim();

            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);

              if (parsed.error) throw new Error(parsed.error);

              if (parsed.token) {
                // Append each token to the assistant message as it arrives
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + parsed.token }
                      : m,
                  ),
                );
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
        // Remove both user and empty assistant messages on error
        setMessages((prev) =>
          prev.filter((m) => m.id !== userMessage.id && m.id !== assistantId),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading],
  );

  function clearMessages() {
    setMessages([]);
    setError(null);
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
