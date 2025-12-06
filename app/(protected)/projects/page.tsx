"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {createJSClient} from "@/lib/supabase/client";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            const supabase = createJSClient();
            const { data, error } = await supabase
                .from("projects")
                .select("id, name, domain, created_at")
                .order("created_at", { ascending: false });
            if (!error) setProjects(data);
        };
        fetchProjects();
    }, []);

    return (
        <main className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Projects</h1>
                <Link href="/app/(protected)/projects/new/new">
                    <Button>Add New Project</Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((p) => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="border rounded-lg p-4 hover:shadow">
                        <h2 className="text-lg font-semibold mb-1">{p.name}</h2>
                        <p className="text-muted-foreground text-sm">{p.domain}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(p.created_at).toLocaleDateString()}
                        </p>
                    </Link>
                ))}
                {projects.length === 0 && <p className="text-muted-foreground">No projects yet.</p>}
            </div>
        </main>
    );
}