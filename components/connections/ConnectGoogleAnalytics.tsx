"use client"

import { Button } from "@/components/ui/button"

export function ConnectGoogleAnalytics({ projectId, userId }: { projectId: string, userId: string }) {
    const handleConnect = async () => {
        const res = await fetch(`/api/oauth/google_analytics/start?projectId=${projectId}&userId=${userId}`);
        const { url } = await res.json();
        window.location.href = url;
    };

    return <Button onClick={handleConnect}>Connect Google Analytics</Button>
}