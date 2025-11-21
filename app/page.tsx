'use client'
import Image from "next/image";
import { NavbarHome } from "@/components/navbar-home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { HomeIcon, Bot, BarChart3, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
    const router = useRouter();
    const [domain, setDomain] = useState("");

    const handleCheck = () => {
        if (domain.trim()) {
            router.push(`/check?domain=${encodeURIComponent(domain.trim())}`);
        }
    };

    return (
        <>
            <nav className="w-full flex justify-center border-b border-border h-16 bg-background">
                <div className="w-full max-w-6xl flex justify-between items-center text-sm">
                    <NavbarHome />
                </div>
            </nav>

            <main className="min-h-[calc(100vh-4rem)] w-full bg-background text-foreground px-6 py-10 flex flex-col items-center">
                <section className="w-full bg-background px-6 py-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
                        {/* Hero Text */}
                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                                Will ChatGPT & Gemini Recommend Your Local Business?
                            </h1>
                            <p className="text-muted-foreground text-lg mb-8">
                                Find out if your home service business shows up when customers ask AI tools:
                                <em> “Who’s the best plumber near me?”</em>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Input
                                    type="text"
                                    placeholder="yourwebsite.com"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full sm:w-72"
                                />
                                <Button size="lg" onClick={handleCheck}>
                                    🔍 Check My Business
                                </Button>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="flex-1">
                            <div className="w-full max-w-md mx-auto border rounded-lg overflow-hidden shadow-md">
                                <Image
                                    src="/data-analysis.gif"
                                    alt="AI Visibility Report Preview"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-4 max-w-6xl w-full">
                    <h2 className="text-4xl font-bold text-center mb-6">How It Works</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-muted-foreground">
                        <div className="flex flex-col items-center text-center gap-3">
                            <HomeIcon className="w-8 h-8 text-primary" />
                            <h3 className="text-base font-semibold text-foreground">Add Your Website</h3>
                            <p className="text-sm">Enter your local business site and list your services.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <Bot className="w-8 h-8 text-primary" />
                            <h3 className="text-base font-semibold text-foreground">We Ask the AI</h3>
                            <p className="text-sm">We query ChatGPT, Gemini, and Claude using real customer questions.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <BarChart3 className="w-8 h-8 text-primary" />
                            <h3 className="text-base font-semibold text-foreground">See Where You Stand</h3>
                            <p className="text-sm">View your visibility score and what AI engines are saying about you.</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <Wrench className="w-8 h-8 text-primary" />
                            <h3 className="text-base font-semibold text-foreground">Fix & Track</h3>
                            <p className="text-sm">Get action steps to improve and save your reports for future checks.</p>
                        </div>
                    </div>
                </section>

                <footer className="mt-24 text-sm text-muted-foreground flex flex-col sm:flex-row gap-6 items-center justify-center border-t border-border pt-8 w-full max-w-5xl">
                    <Link href="/privacy" className="hover:underline">Privacy</Link>
                    <Link href="/terms" className="hover:underline">Terms</Link>
                    <Link href="https://x.com/s_ai_nergy" target="_blank" className="hover:underline">Follow us on X</Link>
                </footer>
            </main>
        </>
    );
}