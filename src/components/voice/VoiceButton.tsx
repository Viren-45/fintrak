// src/components/voice/VoiceButton.tsx

"use client";

import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import VoiceOverlay from "./VoiceOverlay";

export default function VoiceButton() {
  const { state, startSession, stopSession } = useVoiceSession();
  const [overlayVisible, setOverlayVisible] = useState(false);

  const isActive = state.status !== "idle";

  async function handleTap() {
    if (isActive) {
      stopSession();
      setOverlayVisible(false);
    } else {
      setOverlayVisible(true);
      await startSession();
    }
  }

  function handleStop() {
    stopSession();
    setOverlayVisible(false);
  }

  return (
    <>
      <button
        onClick={handleTap}
        aria-label={isActive ? "Stop voice logging" : "Start voice logging"}
        className={`
          fixed bottom-24 right-6 z-40
          w-12 h-12 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${
            isActive
              ? "bg-fintrak-expense hover:bg-fintrak-expense/90 scale-110"
              : "bg-fintrak-sidebar hover:bg-fintrak-sidebar/90 border border-white/10"
          }
        `}
      >
        {isActive ? (
          <MicOff size={20} className="text-white" />
        ) : (
          <Mic size={20} className="text-white/80" />
        )}

        {/* Pulse ring when active */}
        {isActive && (
          <span className="absolute inset-0 rounded-full bg-fintrak-expense/40 animate-ping" />
        )}
      </button>

      {/* Overlay — only shown when session is active */}
      {overlayVisible && <VoiceOverlay state={state} onStop={handleStop} />}
    </>
  );
}
