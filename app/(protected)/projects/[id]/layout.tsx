"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/authContext";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {ModeToggle} from "@/components/mode-toggle";
import Link from "next/link";
import {ProjectSidebar} from "@/components/project-sidebar";

/**
 * Layout for all authenticated routes
 * Redirects user to /onboarding or /dashboard
 * depending on onboarding completion.
 */
export default function ProtectedLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const status = useOnboardingCheck(user?.id);

    useEffect(() => {
        if (!user?.id || status === "pending") return;

        // if (status === "incomplete" && !pathname.startsWith("/onboarding")) {
        //     router.replace("/onboarding");
        // }
        //
        // if (status === "complete" && pathname.startsWith("/onboarding")) {
        //     router.replace("/dashboard");
        // }
    }, [status, user?.id, pathname]);

    if (status === "pending") {
        return (
            <div className="flex min-h-screen items-center justify-center text-gray-500">
                Loading...
            </div>
        );
    }

    return <SidebarProvider>
        <ProjectSidebar />
        <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
}