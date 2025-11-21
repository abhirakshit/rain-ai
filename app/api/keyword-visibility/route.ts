import { NextResponse } from "next/server";

const MODELS = [
    { id: "openai/gpt-4o:online", name: "GPT-4o" },
    { id: "google/gemini-2.5-flash-lite:online", name: "Gemini Flash Lite" },
    { id: "x-ai/grok-4-fast:online", name: "Grok 4" },
    // { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
];

function buildLocationString(location: {
    city?: string;
    state?: string;
    country?: string;
}): string {
    const { city, state, country } = location || {};
    return [city, state, country].filter(Boolean).join(", ");
}

async function queryModel({ model, prompt }: { model: string; prompt: string }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_OPEN_ROUTER_CHAT_COMP_URL}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}

function extractMentionInfo(content: string, domain: string, businessName: string) {
    console.log("Message: ", businessName, content);
    const lower = content.toLowerCase();

    // Variants of business name (for flexible matching)
    const nameVariants = [
        businessName.toLowerCase(),
        businessName.replace(/\s+/g, "").toLowerCase(),
        businessName.replace(/\s+/g, "-").toLowerCase(),
        businessName.replace(/\s+/g, "_").toLowerCase(),
    ];

    // Normalize target domain
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase();

    // Regex for markdown-style URLs: [text](https://example.com/path)
    const urlRegex = /\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    const matches = [...content.matchAll(urlRegex)];

    let foundCount = 0;
    let firstMentionRank: number | null = null;

    // Step 1: Detect domain mentions inside URLs
    matches.forEach((match, index) => {
        const fullUrl = match[1];
        const urlDomain = fullUrl
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split("/")[0]
            .toLowerCase();

        if (urlDomain.includes(cleanDomain)) {
            foundCount++;
            if (firstMentionRank === null) firstMentionRank = index + 1;
        }
    });

    // Step 2: Detect business name mentions in text (not linked)
    nameVariants.forEach((variant) => {
        const occurrences = lower.split(variant).length - 1;
        if (occurrences > 0) {
            foundCount += occurrences;
            if (firstMentionRank === null) {
                const idx = lower.indexOf(variant);
                firstMentionRank = Math.floor(idx / 100) + 1;
            }
        }
    });

    // Step 3: Calculate visibility score
    let visibilityScore = 0;
    if (firstMentionRank !== null) {
        visibilityScore = 100 - (firstMentionRank - 1) * 15 + (foundCount - 1) * 5;
    } else if (foundCount > 0) {
        visibilityScore = 50;
    }

    visibilityScore = Math.max(0, Math.min(100, visibilityScore));

    // Confidence logic (based on first mention position)
    let confidence: "high" | "medium" | "low" = "low";
    if (firstMentionRank && firstMentionRank <= 2) confidence = "high";
    else if (firstMentionRank && firstMentionRank <= 5) confidence = "medium";

    return {
        found: foundCount > 0,
        foundCount,
        rankEstimate: firstMentionRank,
        confidence,
        visibilityScore,
    };
}

export async function POST(req: Request) {
    const { domain, businessName, location, keywords } = await req.json();
    const locationStr = buildLocationString(location);
    const results = [];

    for (const keyword of keywords) {
        // const prompt = `I live in ${locationStr} and I’m looking for ${keyword}. What businesses or websites would you recommend and why?`;
        console.info(`Searching for - A user in ${locationStr} is searching for "${keyword}`)
        const prompt = `
                    A user in ${locationStr} is searching for "${keyword}". 
                    
                    Please return ONLY a numbered list (5-8 items) businesses, each with:
                    - Business Name
                    - Website (if known)
                    - 1-line reason for recommendation
                    
                    Do not include extra commentary or disclaimers.
                    `;

        for (const model of MODELS) {
            const content = await queryModel({ model: model.id, prompt });
            const mentionInfo = extractMentionInfo(content, domain, businessName);

            results.push({
                keyword,
                model: model.name,
                ...mentionInfo,
                snippet: content.slice(0, 8000),
            });
        }
    }

    return NextResponse.json({
        domain,
        businessName,
        location,
        results,
    });
}