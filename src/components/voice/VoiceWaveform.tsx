// src/components/voice/VoiceWaveform.tsx

"use client";

import type { VoiceSpeaker } from "@/hooks/useVoiceSession";

interface VoiceWaveformProps {
  audioLevel: number; // 0–1
  speaker: VoiceSpeaker;
  isActive: boolean;
}

// Number of bars in the waveform
const BAR_COUNT = 5;

// Each bar has a base height and a multiplier so they form a natural arch shape
const BAR_PROFILES = [0.5, 0.75, 1.0, 0.75, 0.5];

export default function VoiceWaveform({
  audioLevel,
  speaker,
  isActive,
}: VoiceWaveformProps) {
  const isGemini = speaker === "gemini";

  // Bar color — green for user, white/accent for Gemini
  const barColor = isGemini ? "bg-white" : "bg-fintrak-accent";

  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {BAR_PROFILES.map((profile, i) => {
        // Height = base profile * audio level, clamped between min and max
        const minHeight = 4;
        const maxHeight = 36;
        const driven = isActive
          ? minHeight + (maxHeight - minHeight) * profile * audioLevel
          : minHeight;

        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all ${barColor}`}
            style={{
              height: `${driven}px`,
              // Stagger the animation slightly per bar for a natural wave feel
              transitionDuration: isActive ? `${80 + i * 20}ms` : "200ms",
              transitionTimingFunction: "ease-out",
              opacity: isActive ? 1 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}
