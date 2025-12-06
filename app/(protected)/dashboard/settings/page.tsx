"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/authContext";
import { useUserData } from "@/lib/store/useUserData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function SettingsPage() {
    const { user } = useAuth();
    const {
        settings,
        fetchUserData,
        updateSettings,
        loading,
    } = useUserData();

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.id) fetchUserData(user.id);
    }, [user?.id]);

    async function handleSaveSettings() {
        if (!settings) return;
        setSaving(true);
        try {
            await updateSettings(settings);
            toast.success("Settings updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    if (loading || !settings) {
        return (
            <div className="flex min-h-screen items-center justify-center text-gray-500">
                Loading settings...
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8">
            <h1 className="text-3xl font-semibold mb-4">Your Settings</h1>

            {/* ==== User Settings ==== */}
            <div className="space-y-4 border p-5 rounded-md">
                <Input
                    placeholder="Full Name"
                    value={settings.full_name || ""}
                    onChange={(e) => updateSettings({ full_name: e.target.value })}
                />

                <div>
                    <label className="text-sm font-medium mb-1 block">Language</label>
                    <Select
                        value={settings.language || "en"}
                        onValueChange={(v) => updateSettings({ language: v })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm font-medium mb-1 block">Timezone</label>
                    <Input
                        value={settings.timezone || ""}
                        onChange={(e) => updateSettings({ timezone: e.target.value })}
                    />
                </div>

                <Button onClick={handleSaveSettings} disabled={saving} className="w-full mt-3">
                    {saving ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}