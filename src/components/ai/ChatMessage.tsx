import ReactMarkdown from "react-markdown";
import type { ChatMessage as ChatMessageType } from "@/hooks/useChat";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center shrink-0
          ${isUser ? "bg-fintrak-accent" : "bg-fintrak-sidebar"}
        `}
      >
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
          ${
            isUser
              ? "bg-fintrak-accent text-white rounded-tr-sm"
              : "bg-white border border-fintrak-border text-fintrak-text-primary rounded-tl-sm"
          }
        `}
      >
        {isUser ? (
          // User messages are plain text — no Markdown needed
          <span>{message.content}</span>
        ) : (
          // AI messages render Markdown properly
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 mb-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 mb-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-sm">{children}</li>,
              h3: ({ children }) => (
                <h3 className="font-semibold text-sm mt-3 mb-1">{children}</h3>
              ),
              code: ({ children }) => (
                <code className="bg-fintrak-bg px-1 py-0.5 rounded text-xs">
                  {children}
                </code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
