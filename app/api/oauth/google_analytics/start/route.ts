import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const rawState = searchParams.get("state");

    if (!rawState) {
        return NextResponse.json({ error: "Missing state param" }, { status: 400 });
    }

    let parsedState;
    try {
        parsedState = JSON.parse(rawState);
        console.log("PSS", parsedState);
    } catch (e) {
        return NextResponse.json({ error: "Invalid state param format" }, { status: 400 });
    }

    const { projectId } = parsedState;

    if (!projectId) {
        return NextResponse.json({ error: "Missing projectId in state" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/google_analytics/callback`
    );

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/analytics.readonly"],
        state: rawState, // send original stringified state forward
    });

    return NextResponse.json({ url });
}