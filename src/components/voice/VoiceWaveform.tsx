// src/components/voice/VoiceWaveform.tsx

"use client";

import type { VoiceSpeaker } from "@/hooks/useVoiceSession";

interface VoiceWaveformProps {
  audioLevel: number; // 0–1
  speaker: VoiceSpeaker;
  isActive: boolean;
}

const BAR_PROFILES = [0.5, 0.75, 1.0, 0.75, 0.5];

export default function VoiceWaveform({
  audioLevel,
  speaker,
  isActive,
}: VoiceWaveformProps) {
  const isGemini = speaker === "gemini";

  // User speaking → blue bars, Gemini speaking → slate bars
  const barColor = isGemini ? "#94A3B8" : "#3B82F6";

  return (
    <div className="flex items-center justify-center gap-1.5 h-10">
      {BAR_PROFILES.map((profile, i) => {
        const minHeight = 4;
        const maxHeight = 36;
        const driven = isActive
          ? minHeight + (maxHeight - minHeight) * profile * audioLevel
          : minHeight;

        return (
          <div
            key={i}
            className="w-1 rounded-full"
            style={{
              height: `${driven}px`,
              backgroundColor: barColor,
              opacity: isActive ? 1 : 0.25,
              transitionProperty: "height, opacity",
              transitionDuration: isActive ? `${80 + i * 20}ms` : "200ms",
              transitionTimingFunction: "ease-out",
            }}
          />
        );
      })}
    </div>
  );
}
