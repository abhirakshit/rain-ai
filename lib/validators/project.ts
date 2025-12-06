import { z } from "zod";

export const NewProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    domain: z
        .string()
        .min(1, "Domain is required")
        .refine(
            (val) =>
                /[a-z0-9.-]+\.[a-z]{2,}/i.test(val.replace(/^https?:\/\//, "").replace(/^www\./, "")),
            {
                message: "Invalid domain (e.g. example.com)",
            }
        ),
});