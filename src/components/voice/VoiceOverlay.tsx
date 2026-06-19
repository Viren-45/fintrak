// src/components/voice/VoiceOverlay.tsx

"use client";

import { useEffect, useRef } from "react";
import { X, AudioLines, Loader2 } from "lucide-react";
import VoiceWaveform from "./VoiceWaveform";
import type {
  VoiceSessionState,
  VoiceSessionStatus,
} from "@/hooks/useVoiceSession";

interface VoiceOverlayProps {
  state: VoiceSessionState;
  onStop: () => void;
}

function getStatusLabel(status: VoiceSessionStatus): string {
  switch (status) {
    case "connecting":
      return "Connecting...";
    case "listening":
      return "Listening...";
    case "thinking":
      return "Thinking...";
    case "speaking":
      return "Speaking...";
    case "saving":
      return "Saving...";
    case "error":
      return "Something went wrong";
    default:
      return "";
  }
}

export default function VoiceOverlay({ state, onStop }: VoiceOverlayProps) {
  const {
    status,
    activeSpeaker,
    userTranscript,
    geminiTranscript,
    audioLevel,
    error,
  } = state;

  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [userTranscript, geminiTranscript]);

  const isActive = status !== "connecting" && status !== "idle";
  const showSpinner = status === "connecting" || status === "saving";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
      <div
        className="pointer-events-auto mb-32 mr-0 w-80 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 pt-4 pb-3 border-b"
          style={{ borderColor: "#E2E8F0" }}
        >
          {/* Blue pill — "Fintrak Voice" label */}
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ backgroundColor: "#3B82F6" }}
          >
            {showSpinner ? (
              <Loader2 size={13} className="animate-spin text-white" />
            ) : (
              <AudioLines size={13} className="text-white" />
            )}
            <span className="text-xs font-semibold text-white tracking-wide">
              Fintrak Voice
            </span>
          </div>

          {/* Red close button */}
          <button
            onClick={onStop}
            aria-label="Stop voice session"
            className="p-1.5 rounded-full transition-colors duration-150 cursor-pointer"
            style={{ color: "#EF4444" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF2F2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Waveform */}
        <div className="flex flex-col items-center justify-center px-4 py-5 gap-2">
          <VoiceWaveform
            audioLevel={audioLevel}
            speaker={activeSpeaker}
            isActive={isActive && !showSpinner}
          />
          <p
            className="text-xs font-medium tracking-widest uppercase mt-1"
            style={{ color: "#94A3B8" }}
          >
            {getStatusLabel(status)}
          </p>
        </div>

        {/* Transcript area */}
        {(userTranscript || geminiTranscript) && (
          <div
            ref={transcriptRef}
            className="px-4 pb-4 max-h-36 overflow-y-auto space-y-2 border-t pt-3"
            style={{ borderColor: "#E2E8F0" }}
          >
            {/* User bubble — right aligned, blue */}
            {userTranscript && (
              <div className="flex justify-end">
                <p
                  className="text-xs rounded-xl rounded-br-sm px-3 py-1.5 max-w-[90%]"
                  style={{
                    backgroundColor: "#EFF6FF",
                    color: "#1D4ED8",
                  }}
                >
                  {userTranscript}
                </p>
              </div>
            )}

            {/* Gemini bubble — left aligned, gray */}
            {geminiTranscript && (
              <div className="flex justify-start">
                <p
                  className="text-xs rounded-xl rounded-bl-sm px-3 py-1.5 max-w-[90%]"
                  style={{
                    backgroundColor: "#F1F5F9",
                    color: "#0F172A",
                  }}
                >
                  {geminiTranscript}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-4 pb-4">
            <p
              className="text-xs rounded-lg px-3 py-2"
              style={{
                color: "#EF4444",
                backgroundColor: "#FEF2F2",
              }}
            >
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
