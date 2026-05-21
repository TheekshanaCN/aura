// lib/settings-store.ts — localStorage settings

export interface AppSettings {
  theme: "night" | "morning" | "evening"
  notifications: boolean
  browserNotifications: boolean
  privateMode: boolean
  language: string
  timezone: string
  displayName: string
  email: string
  bio: string
}

const SETTINGS_KEY = "aura_settings"

const defaults: AppSettings = {
  theme: "night",
  notifications: true,
  browserNotifications: false,
  privateMode: false,
  language: "en",
  timezone: typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC",
  displayName: "Builder",
  email: "",
  bio: "",
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaults
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<AppSettings>) } : defaults
  } catch { return defaults }
}

export function saveSettings(settings: AppSettings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch { }
}
