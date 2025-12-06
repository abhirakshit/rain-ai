"use client";
import { create } from "zustand";
import {createJSClient} from "@/lib/supabase/client";

interface UserSettings {
    user_id: string;
    full_name: string;
    language: string;
    timezone: string;
}

interface UserDataState {
    settings: UserSettings | null;
    onboardingComplete: boolean;
    loading: boolean;
    fetchUserData: (userId: string) => Promise<void>;
    updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
    setOnboardingComplete: (value: boolean) => void;
}

export const useUserData = create<UserDataState>((set, get) => ({
    settings: null,
    schedules: [],
    onboardingComplete: false,
    loading: false,

    fetchUserData: async (userId) => {
        const supabase = createJSClient();
        set({ loading: true });

        const { data: settings } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", userId)
            .single();


        const onboardingComplete = !!(settings);

        set({
            settings,
            onboardingComplete,
            loading: false,
        });
    },

    updateSettings: async (updates) => {
        const supabase = createJSClient();
        const settings = get().settings;
        if (!settings) return;

        const updated = { ...settings, ...updates };
        await supabase.from("user_settings").upsert(updated);
        set({ settings: updated });
    },

    setOnboardingComplete: (value) => set({ onboardingComplete: value }),
}));