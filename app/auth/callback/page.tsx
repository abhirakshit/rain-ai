"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {createSSRClient} from "@/lib/supabase/client";

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/dashboard";

    useEffect(() => {
        const supabase = createSSRClient()

        // Restore session from cookie
        supabase.auth.getSession().then(({data}) => {
            if (data.session) {
                router.replace(next);
            } else {
                router.replace("/sign-in"); // or show an error
            }
        });
    }, [next]);

    return <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
            <p>Signing In ...</p>
        </div>
    </div>
}