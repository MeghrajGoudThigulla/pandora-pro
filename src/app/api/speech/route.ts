export const runtime = "edge";

export async function POST(req: Request) {
    const { text } = await req.json();

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
        return new Response("HUGGINGFACE_API_KEY not set", { status: 500 });
    }

    if (!text || typeof text !== "string") {
        return new Response("Missing 'text' field", { status: 400 });
    }

    // Use Facebook's MMS-TTS model — fast, free, and decent quality
    const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/mms-tts-eng",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("HuggingFace TTS error:", errorBody);
        return new Response(`TTS failed: ${errorBody}`, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
        headers: {
            "Content-Type": "audio/flac",
            "Cache-Control": "no-cache",
        },
    });
}
