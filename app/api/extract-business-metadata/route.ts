import { NextResponse } from "next/server";

const MODEL_ID = "google/gemini-2.5-flash-lite:online";

export async function POST(req: Request) {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
        return NextResponse.json({ error: "Missing or invalid domain" }, { status: 400 });
    }

    const prompt = `
Analyze the website at ${domain}.
Based on publicly available data (e.g., homepage, metadata, reviews), return the following:

1. What city, state, and country does this business primarily serve?
2. What is the main service category or profession this business offers (e.g., plumber, HVAC, dentist)?

Do NOT format your answer as a code block. Just return raw JSON. Respond ONLY with the following JSON format:
{
  "businessName": "...",
  "location": {
    "city": "...",
    "state": "...",
    "country": "..."
  },
  "primaryKeyword": "..."
}

DO NOT include any extra explanation or commentary.`;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_OPEN_ROUTER_CHAT_COMP_URL}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            }),
        });

        const raw = await response.json();
        const message = raw.choices?.[0]?.message?.content || "";
        const clean = message
            .replace(/```json|```/g, "")
            .trim();

        let parsed;
        try {
            parsed = JSON.parse(clean);
        } catch (err) {
            console.error(err);
            console.error("Failed to parse model response:", message);
            return NextResponse.json({ error: "Invalid response format from model" }, { status: 500 });
        }

        return NextResponse.json({ domain, ...parsed });
    } catch (error) {
        console.error("Error extracting business metadata:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}