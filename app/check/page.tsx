"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { NavbarHome } from "@/components/navbar-home";
import { Loader2 } from "lucide-react";

const MODEL_LOGOS: Record<string, string> = {
    "GPT-4o": "/logos/chatGPT-logo.png",
    "Gemini Flash Lite": "/logos/Google-Gemini-Logo.png",
    "Grok 4": "/logos/Grok-Logo.png",
};

export default function CheckPage() {
    const searchParams = useSearchParams();
    const defaultDomain = searchParams.get("domain") || "";

    const [domain, setDomain] = useState(defaultDomain);
    const [status, setStatus] = useState<string | null>(null);
    const [results, setResults] = useState<any[] | null>(null);
    const [term, setTerm] = useState<string>("");
    const [location, setLocation] = useState<any>(null);

    const handleCheck = async () => {
        if (!domain.trim()) return;
        setStatus("Getting Website Info...");
        setResults(null);

        try {
            const metaRes = await fetch("/api/extract-business-metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: domain.trim() }),
            });
            const metaData = await metaRes.json();
            if (!metaData?.primaryKeyword || !metaData?.location || !metaData?.businessName)
                throw new Error("Metadata extraction failed");

            setTerm(metaData.primaryKeyword);
            setLocation(metaData.location);
            setStatus("Fetching LLM Data...");

            const visibilityRes = await fetch("/api/keyword-visibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    domain,
                    businessName: metaData.businessName,
                    location: metaData.location,
                    keywords: [metaData.primaryKeyword],
                }),
            });

            const visibilityData = await visibilityRes.json();
            setResults(visibilityData.results);
            setStatus(null);
        } catch (err) {
            console.error(err);
            setStatus(null);
            alert("Something went wrong. Please try again later.");
        }
    };

    useEffect(() => {
        if (defaultDomain) {
            handleCheck();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleCheck();
    };

    return (
        <>
            <nav className="w-full flex justify-center border-b border-border h-16 bg-background">
                <div className="w-full max-w-6xl flex justify-between items-center text-sm">
                    <NavbarHome />
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-16">
                <h1 className="text-3xl font-bold mb-6">Check Your AI Visibility</h1>

                <div className="space-y-4 mb-8">
                    <Input
                        placeholder="yourwebsite.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <Button onClick={handleCheck} disabled={!!status}>
                        {status ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {status}
                            </div>
                        ) : (
                            "Run AI Visibility Check"
                        )}
                    </Button>
                </div>

                {results && term && location && (
                    <div className="mt-10 space-y-8">
                        <div className="text-center">
                            <p className="text-muted-foreground text-sm">
                                We asked top AI engines: <strong>&#34;{term}&#34;</strong> near <strong>{location.city}, {location.state}</strong>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((r, i) => (
                                <div key={i} className="border rounded-xl p-4 shadow-sm bg-white dark:bg-zinc-900">
                                    <div className="flex items-center gap-3 mb-4">
                                        {MODEL_LOGOS[r.model] && (
                                            <div className="w-max h-20 flex items-center justify-center">
                                                <Image
                                                    src={MODEL_LOGOS[r.model]}
                                                    alt={r.model}
                                                    width={100}
                                                    height={100}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm text-foreground mb-2">
                                        Score: <strong>{r.visibilityScore || 0}</strong> / 100<br />
                                        Found: {r.found ? "✅ Yes" : "❌ No"}<br />
                                        Rank Est: {r.rankEstimate || "-"}<br />
                                        Confidence: {r.confidence}
                                    </div>
                                    <div className="text-xs text-foreground mt-2 whitespace-pre-wrap max-h-48 overflow-y-auto border-t pt-2">
                                        {r.snippet}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}