// src/hooks/useVoiceSession.ts

"use client";

import { useState, useRef, useCallback } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import {
  startAudioCapture,
  type AudioCaptureHandles,
} from "@/lib/voice/audioCapture";
import { AudioPlayback } from "@/lib/voice/audioPlayback";
import { handleToolCall, type ToolCall } from "@/lib/voice/toolHandler";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VoiceSessionStatus =
  | "idle" // Not started
  | "connecting" // Fetching token + opening WebSocket
  | "listening" // Connected, mic active, waiting for user to speak
  | "thinking" // Gemini is processing
  | "speaking" // Gemini is speaking back
  | "saving" // Saving a transaction to Supabase
  | "error"; // Something went wrong

export type VoiceSpeaker = "user" | "gemini" | null;

export interface VoiceSessionState {
  status: VoiceSessionStatus;
  activeSpeaker: VoiceSpeaker;
  userTranscript: string; // Live transcript of what the user said
  geminiTranscript: string; // Live transcript of what Gemini is saying
  audioLevel: number; // 0–1, drives the waveform animation
  error: string | null;
}

// ─── Raw WebSocket message types ──────────────────────────────────────────────

interface ServerMessage {
  serverContent?: {
    modelTurn?: {
      parts?: Array<{
        inlineData?: { data: string; mimeType: string };
        text?: string;
      }>;
    };
    inputTranscription?: { text: string };
    outputTranscription?: { text: string };
    turnComplete?: boolean;
  };
  toolCall?: ToolCall;
  setupComplete?: unknown;
}

// ─── Gemini Live WebSocket endpoint (ephemeral token path) ────────────────────

const GEMINI_WS_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceSession() {
  const { addTransaction } = useTransactions();
  const { settings, saveSettings } = useSettings();

  const wsRef = useRef<WebSocket | null>(null);
  const captureRef = useRef<AudioCaptureHandles | null>(null);
  const playbackRef = useRef<AudioPlayback | null>(null);

  const [state, setState] = useState<VoiceSessionState>({
    status: "idle",
    activeSpeaker: null,
    userTranscript: "",
    geminiTranscript: "",
    audioLevel: 0,
    error: null,
  });

  // ── Send audio chunk to Gemini ─────────────────────────────────────────────
  const sendAudioChunk = useCallback((base64: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        realtimeInput: {
          audio: { data: base64, mimeType: "audio/pcm;rate=16000" },
        },
      }),
    );
  }, []);

  // ── Send tool response back to Gemini after executing a function ───────────
  const sendToolResponse = useCallback(
    (functionResponses: Record<string, unknown>[]) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(
        JSON.stringify({ toolResponse: { functionResponses } }),
      );
    },
    [],
  );

  // ── Handle incoming WebSocket messages ────────────────────────────────────
  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      let msg: ServerMessage;
      try {
        // Gemini Live sends responses as Blob — handle both Blob and string
        const text =
          event.data instanceof Blob
            ? await event.data.text()
            : (event.data as string);
        msg = JSON.parse(text);
      } catch {
        return;
      }

      // Session ready — start listening
      if (msg.setupComplete !== undefined) {
        setState((prev) => ({
          ...prev,
          status: "listening",
          activeSpeaker: null,
        }));
        return;
      }

      // Gemini wants to call a function
      if (msg.toolCall) {
        setState((prev) => ({ ...prev, status: "saving" }));
        const responses = await handleToolCall(msg.toolCall, {
          addTransaction,
          settings,
          saveSettings,
          onSaving: () => setState((prev) => ({ ...prev, status: "saving" })),
          onSaved: () => setState((prev) => ({ ...prev, status: "speaking" })),
        });
        sendToolResponse(responses);
        return;
      }

      if (msg.serverContent) {
        const sc = msg.serverContent;

        // Audio chunks from Gemini — queue for playback
        if (sc.modelTurn?.parts) {
          for (const part of sc.modelTurn.parts) {
            if (part.inlineData?.mimeType?.startsWith("audio/")) {
              setState((prev) => ({
                ...prev,
                status: "speaking",
                activeSpeaker: "gemini",
              }));
              playbackRef.current?.enqueue(part.inlineData.data);
            }
          }
        }

        // Live transcript of what the user said
        if (sc.inputTranscription?.text) {
          setState((prev) => ({
            ...prev,
            userTranscript: sc.inputTranscription!.text,
            activeSpeaker: "user",
            status: "listening",
          }));
        }

        // Live transcript of what Gemini is saying
        if (sc.outputTranscription?.text) {
          setState((prev) => ({
            ...prev,
            geminiTranscript: sc.outputTranscription!.text,
          }));
        }

        // Gemini finished its turn — back to listening
        if (sc.turnComplete) {
          setState((prev) => ({
            ...prev,
            status: "listening",
            activeSpeaker: null,
            geminiTranscript: "",
          }));
        }
      }
    },
    [addTransaction, settings, saveSettings, sendToolResponse],
  );

  // ── Stop session ───────────────────────────────────────────────────────────
  const stopSession = () => {
    // Stop mic and audio processing
    captureRef.current?.stop();
    captureRef.current = null;

    // Stop playback
    playbackRef.current?.stop();
    playbackRef.current = null;

    // Close WebSocket cleanly
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent triggering state update
      wsRef.current.close();
      wsRef.current = null;
    }

    setState({
      status: "idle",
      activeSpeaker: null,
      userTranscript: "",
      geminiTranscript: "",
      audioLevel: 0,
      error: null,
    });
  };

  // ── Start session ──────────────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    setState({
      status: "connecting",
      activeSpeaker: null,
      userTranscript: "",
      geminiTranscript: "",
      audioLevel: 0,
      error: null,
    });

    try {
      // 1. Get ephemeral token from our secure API route
      const tokenRes = await fetch("/api/voice/token", { method: "POST" });
      if (!tokenRes.ok) throw new Error("Failed to get voice token");
      const { token } = (await tokenRes.json()) as { token: string };

      // 2. Set up playback before opening the socket
      playbackRef.current = new AudioPlayback({
        onPlaybackStart: () =>
          setState((prev) => ({
            ...prev,
            status: "speaking",
            activeSpeaker: "gemini",
          })),
        onPlaybackEnd: () =>
          setState((prev) => {
            if (prev.status === "speaking") {
              return {
                ...prev,
                status: "listening",
                activeSpeaker: null,
                audioLevel: 0,
              };
            }
            return prev;
          }),
      });

      // 3. Open WebSocket directly to Gemini using ephemeral token
      const ws = new WebSocket(`${GEMINI_WS_URL}?access_token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send session config — model is locked in the token,
        // but we still declare modalities and enable transcription here
        ws.send(
          JSON.stringify({
            setup: {},
          }),
        );
      };

      ws.onmessage = handleMessage;

      ws.onerror = () => {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Connection failed. Please try again.",
        }));
        stopSession();
      };

      ws.onclose = () => {
        setState((prev) => {
          if (prev.status !== "idle") {
            return { ...prev, status: "idle", activeSpeaker: null };
          }
          return prev;
        });
      };

      // 4. Start mic capture — sends audio chunks and drives waveform
      const capture = await startAudioCapture(sendAudioChunk, (level) =>
        setState((prev) => {
          // Only update audio level for user when Gemini isn't speaking
          if (prev.activeSpeaker !== "gemini") {
            return { ...prev, audioLevel: level, activeSpeaker: "user" };
          }
          return prev;
        }),
      );
      captureRef.current = capture;
    } catch (err) {
      console.error("Voice session failed to start:", err);
      const message =
        err instanceof Error ? err.message : "Could not start voice session";
      setState((prev) => ({ ...prev, status: "error", error: message }));
      toast.error("Voice session failed", { description: message });
      stopSession();
    }
  }, [handleMessage, sendAudioChunk]);

  return { state, startSession, stopSession };
}
