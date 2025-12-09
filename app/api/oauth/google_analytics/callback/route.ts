import { google } from "googleapis";
import { createSSRClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const rawState = searchParams.get("state");

        if (!code || !rawState) {
            return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
        }

        // Parse state to get projectId and userId
        let parsedState: { projectId: string; userId: string };
        try {
            parsedState = JSON.parse(rawState);
        } catch (e) {
            console.error("Invalid state format:", rawState);
            return NextResponse.json({ error: "Invalid state format" }, { status: 400 });
        }

        const { projectId } = parsedState;
        if (!projectId) {
            return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
        }

        // Initialize OAuth client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID!,
            process.env.GOOGLE_CLIENT_SECRET!,
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/google_analytics/callback`
        );

        // Exchange code for tokens
        let tokens;
        try {
            const tokenResponse = await oauth2Client.getToken(code);
            tokens = tokenResponse.tokens;
        } catch (tokenError) {
            console.error("Failed to get token:", tokenError);
            return NextResponse.json({ error: "Failed to exchange code for token" }, { status: 500 });
        }

        oauth2Client.setCredentials(tokens);

        // Store in Supabase
        const supabase = createSSRClient();

        const { error: dbError } = await supabase.from("project_integrations").insert({
            project_id: projectId,
            provider: "google_analytics",
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            scope: tokens.scope,
        });

        if (dbError) {
            console.error("Failed to save tokens:", dbError);
            return NextResponse.json({ error: "Failed to store integration info" }, { status: 500 });
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/projects/${projectId}/settings/integrations`);
    } catch (err) {
        console.error("OAuth callback error:", err);
        return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
    }
}