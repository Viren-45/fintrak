// src/components/voice/VoiceOverlay.tsx

"use client";

import { useEffect, useRef } from "react";
import { X, Mic, Loader2 } from "lucide-react";
import VoiceWaveform from "./VoiceWaveform";
import type {
  VoiceSessionState,
  VoiceSessionStatus,
} from "@/hooks/useVoiceSession";

interface VoiceOverlayProps {
  state: VoiceSessionState;
  onStop: () => void;
}

// Human-readable status labels
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

  // Auto-scroll transcript to bottom as new text arrives
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [userTranscript, geminiTranscript]);

  const isActive = status !== "connecting" && status !== "idle";
  const showSpinner = status === "connecting" || status === "saving";

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
      {/* Panel — floats above the buttons */}
      <div
        className="pointer-events-auto mb-32 mr-0 w-80 rounded-2xl bg-fintrak-sidebar border border-white/10 shadow-2xl overflow-hidden"
        style={{ backdropFilter: "blur(12px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {showSpinner ? (
              <Loader2 size={16} className="animate-spin text-fintrak-accent" />
            ) : (
              <Mic size={16} className="text-fintrak-accent" />
            )}
            <span className="text-sm font-semibold text-white">
              Fintrak Voice
            </span>
          </div>
          <button
            onClick={onStop}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Stop voice session"
          >
            <X size={16} className="text-white/70" />
          </button>
        </div>

        {/* Waveform */}
        <div className="flex flex-col items-center justify-center px-4 py-4 gap-2">
          <VoiceWaveform
            audioLevel={audioLevel}
            speaker={activeSpeaker}
            isActive={isActive && !showSpinner}
          />
          <p className="text-xs text-white/50 tracking-wide uppercase">
            {getStatusLabel(status)}
          </p>
        </div>

        {/* Transcript area */}
        {(userTranscript || geminiTranscript) && (
          <div
            ref={transcriptRef}
            className="px-4 pb-4 max-h-36 overflow-y-auto space-y-2"
          >
            {userTranscript && (
              <div className="flex justify-end">
                <p className="text-xs bg-fintrak-accent/20 text-fintrak-accent rounded-xl rounded-br-sm px-3 py-1.5 max-w-[90%]">
                  {userTranscript}
                </p>
              </div>
            )}
            {geminiTranscript && (
              <div className="flex justify-start">
                <p className="text-xs bg-white/10 text-white/90 rounded-xl rounded-bl-sm px-3 py-1.5 max-w-[90%]">
                  {geminiTranscript}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-4 pb-4">
            <p className="text-xs text-fintrak-expense bg-fintrak-expense/10 rounded-lg px-3 py-2">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
