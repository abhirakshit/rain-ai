"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {createJSClient} from "@/lib/supabase/client";

export default function ProjectDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        const fetchProject = async () => {
            const supabase = createJSClient();
            const { data } = await supabase
                .from("projects")
                .select("*")
                .eq("id", id)
                .single();
            setProject(data);
        };

        fetchProject();
    }, [id]);

    if (!project) return <p className="p-6 text-muted-foreground">Loading project...</p>;

    return (
        <main className="max-w-5xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
            <p className="text-muted-foreground mb-2">Domain: {project.domain}</p>
            <p className="text-sm text-muted-foreground">Created: {new Date(project.created_at).toLocaleString()}</p>
        </main>
    );
}