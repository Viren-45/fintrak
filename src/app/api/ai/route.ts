import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildContext } from "@/lib/ai/buildcontext";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const context = await buildContext();

    // Create a streaming response
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: context,
      messages,
    });

    // Return a ReadableStream that sends tokens as they arrive
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        stream.on("text", (text) => {
          // Send each token as a server-sent event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ token: text })}\n\n`),
          );
        });

        stream.on("finalMessage", () => {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        });

        stream.on("error", (error) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message })}\n\n`,
            ),
          );
          controller.close();
        });
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI route error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get AI response. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
