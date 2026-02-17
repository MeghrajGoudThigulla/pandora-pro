export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, context } = await req.json();
  const { emotion, age, isHesitating, vocalEnergy } = context || {};

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return new Response("GOOGLE_GENERATIVE_AI_API_KEY not set", { status: 500 });
  }

  const systemPrompt = `You are Pandora Pro, a sophisticated, emotionally-aware AI Therapist and Companion.
Your goal is to provide empathetic, context-aware support using CBT-based techniques and active listening.

CURRENT USER CONTEXT:
- Dominant Emotion: ${emotion || "Uncertain"}
- Estimated Age: ${age || "Unknown"}
- Vocal Energy Level: ${vocalEnergy || 0} (0-100 scale)
- Cognitive State: ${isHesitating ? "User is hesitating or silent. Be proactive and supportive." : "User is engaged."}

INSTRUCTIONS:
1. Acknowledge the user's emotional state subtly in your tone.
2. If the user is hesitating, use an "Ice-breaker" approach—offer a gentle prompt or a supportive observation.
3. Use "Emotional Dissonance" as a frame if you detect stress or conflicting signals.
4. Maintain a professional yet warm "Morphic" persona—calm, oceanic, and steady.
5. Always remind the user that while you are an advanced companion, you are not a licensed medical professional for serious crises.
6. Keep responses concise (2-4 sentences) unless the user asks for elaboration.`;

  // Build the Gemini-compatible message format
  const geminiContents = [];

  // Add system instruction as the first "user" turn (Gemini uses systemInstruction field)
  for (const msg of messages) {
    geminiContents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: geminiContents,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API error:", errorBody);
    return new Response(`Gemini error: ${errorBody}`, { status: response.status });
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here for you. Could you tell me more about how you're feeling?";

  // Return as a simple JSON response that the frontend can consume
  return new Response(JSON.stringify({ role: "assistant", content: text }), {
    headers: { "Content-Type": "application/json" },
  });
}
