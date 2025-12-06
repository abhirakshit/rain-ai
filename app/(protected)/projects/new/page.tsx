"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewProjectSchema } from "@/lib/validators/project";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {useAuth} from "@/hooks/authContext";
import {normalizeDomain} from "@/lib/utils/string";
import {toast} from "sonner";
import {useState} from "react";
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
import {createJSClient} from "@/lib/supabase/client";

type FormData = z.infer<typeof NewProjectSchema>;

export default function NewProjectPage() {
    const { user } = useAuth();
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(NewProjectSchema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        const supabase = createJSClient();

        const cleanedDomain = normalizeDomain(data.domain);

        const { error, data: inserted } = await supabase.from("projects").insert({
            ...data,
            domain: cleanedDomain,
            user_id: user?.id,
        }).select().single();

        console.log("inserted", inserted);
        if (error) {
            console.error(error);
            toast.error("Failed to create project");
            return;
        }

        toast.success("Project created successfully!");
        router.push(`/projects/${inserted.id}`);
    };

    return (
        <main className="max-w-xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
            <div className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input placeholder="Project Name" {...register("name")} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

                    <Input placeholder="example.com" {...register("domain")} />
                    {errors.domain && <p className="text-red-500 text-sm">{errors.domain.message}</p>}

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating...
                            </span>
                        ) : (
                            "Create Project"
                        )}
                    </Button>
                </form>
            </div>
        </main>
    );
}