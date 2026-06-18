// src/app/api/voice/token/route.ts

import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import {
  buildVoiceSystemPrompt,
  getVoiceTools,
} from "@/lib/voice/buildVoiceContext";

/**
 * POST /api/voice/token
 *
 * Generates a short-lived Gemini Live ephemeral token for the authenticated user.
 * The system prompt and tools are locked into the token server-side — the browser
 * never sees the API key or the user's financial context directly.
 *
 * To support new voice capabilities in future: update buildVoiceContext.ts only.
 * This route does not need to change.
 */
export async function POST() {
  try {
    // ── 1. Verify the user is authenticated ───────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Fetch the user's accounts and settings ─────────────────────────
    const [accountsResult, settingsResult] = await Promise.all([
      supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("settings")
        .select("expense_categories, income_categories")
        .eq("user_id", user.id)
        .single(),
    ]);

    if (accountsResult.error) {
      console.error("Failed to fetch accounts:", accountsResult.error);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 },
      );
    }

    if (settingsResult.error) {
      console.error("Failed to fetch settings:", settingsResult.error);
      return NextResponse.json(
        { error: "Failed to fetch user settings" },
        { status: 500 },
      );
    }

    // ── 3. Map DB rows to our Account type ────────────────────────────────
    const accounts = (accountsResult.data ?? []).map((row) => ({
      id: row.id,
      type: row.type,
      bankId: row.bank_id ?? undefined,
      nickname: row.nickname ?? undefined,
      lastFour: row.last_four ?? undefined,
      openingBalance: row.opening_balance,
      creditLimit: row.credit_limit ?? undefined,
      createdAt: row.created_at,
    }));

    const expenseCategories: string[] =
      settingsResult.data?.expense_categories ?? [];
    const incomeCategories: string[] =
      settingsResult.data?.income_categories ?? [];

    // ── 4. Build system prompt with user's financial context ──────────────
    const systemPrompt = buildVoiceSystemPrompt({
      accounts,
      expenseCategories,
      incomeCategories,
    });

    // ── 5. Generate ephemeral token locked to model + prompt + tools ──────
    const genai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: { apiVersion: "v1alpha" },
    });

    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(
      Date.now() + 2 * 60 * 1000,
    ).toISOString();

    const token = await genai.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model: "gemini-3.1-flash-live-preview",
          config: {
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            responseModalities: [Modality.AUDIO],
            tools: getVoiceTools(),
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Aoede", // Natural, clear female voice
                },
              },
            },
          },
        },
        httpOptions: { apiVersion: "v1alpha" },
      },
    });

    // ── 6. Return only the token name — never the API key ─────────────────
    return NextResponse.json({ token: token.name });
  } catch (error) {
    console.error("Voice token generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate voice token" },
      { status: 500 },
    );
  }
}
