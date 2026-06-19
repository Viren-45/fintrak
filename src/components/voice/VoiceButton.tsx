// src/components/voice/VoiceButton.tsx

"use client";

import { useState } from "react";
import { AudioLines, Square } from "lucide-react";
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
        style={
          isActive
            ? { backgroundColor: "#2563EB" }
            : { backgroundColor: "#3B82F6" }
        }
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isActive
            ? "#1D4ED8"
            : "#2563EB";
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isActive
            ? "#2563EB"
            : "#3B82F6";
          e.currentTarget.style.transform = isActive
            ? "scale(1.1)"
            : "scale(1)";
        }}
        className="fixed bottom-22 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
      >
        {isActive ? (
          <Square size={18} className="text-white" fill="white" />
        ) : (
          <AudioLines size={24} className="text-white" />
        )}

        {/* Pulse ring when active */}
        {isActive && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: "#3B82F6", opacity: 0.4 }}
          />
        )}
      </button>

      {overlayVisible && <VoiceOverlay state={state} onStop={handleStop} />}
    </>
  );
}
