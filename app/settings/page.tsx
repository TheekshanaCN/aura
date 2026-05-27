"use client"

import { useState, useEffect } from "react"
import {
  Upload, Moon, Sun, Palette, User, Globe, Shield,
  BellRing, CheckCircle2, Trash2, Save, X, Loader2,
} from "lucide-react"
import { useTheme } from "next-themes"
import { loadSettings, saveSettings, AppSettings } from "@/lib/settings-store"
import { clearHistory } from "@/lib/history"
import { saveWallpaper, loadWallpaper, deleteWallpaper } from "@/lib/wallpaper-store"

const themes = [
  { id: "night",   name: "Midnight Glass", Icon: Moon,    color: "#6366f1", desc: "Dark indigo theme" },
  { id: "morning", name: "Light Glass",    Icon: Sun,     color: "#0071e3", desc: "Clean light theme" },
  { id: "evening", name: "Purple Glass",   Icon: Palette, color: "#a855f7", desc: "Deep purple vibes" },
]

const LANGUAGES = [
  { code: "en", label: "English" }, { code: "si", label: "Sinhala" },
  { code: "fr", label: "French"  }, { code: "de", label: "German"  },
  { code: "es", label: "Spanish" }, { code: "ja", label: "Japanese"},
]

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl p-6 flex flex-col gap-5"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border-glass)" }}>
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)" }}>
          <Icon className="size-4" style={{ color: "var(--accent-color)" }} />
        </div>
        <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 flex-shrink-0"
      style={{ background: checked ? "var(--accent-color)" : "var(--border-c)" }}>
      <span className="inline-block size-4 rounded-full bg-white transition-transform duration-200"
        style={{ transform: checked ? "translateX(24px)" : "translateX(4px)" }} />
    </button>
  )
}

function compressImage(dataUrl: string, maxWidth = 1400, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement("canvas")
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", quality))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(loadSettings())
  const [wallpaper, setWallpaper] = useState<string | null>(null)
  const [previewWallpaper, setPreviewWallpaper] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [dataCleared, setDataCleared] = useState(false)

  useEffect(() => {
    setMounted(true)
    const s = loadSettings()
    setSettings(s)
    if (s.theme) setTheme(s.theme)
    loadWallpaper().then(setWallpaper).catch(() => {})
  }, [])

  function patch<K extends keyof AppSettings>(key: K, val: AppSettings[K]) {
    const updated = { ...settings, [key]: val }
    setSettings(updated)
    if (key === "theme") setTheme(val as string)
    saveSettings(updated)
  }

  function handleSaveProfile() {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleWallpaperUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPreviewWallpaper(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  async function applyWallpaper() {
    if (!previewWallpaper) return
    setUploading(true)
    try {
      const compressed = await compressImage(previewWallpaper)
      await saveWallpaper(compressed)
      setWallpaper(compressed)
      setPreviewWallpaper(null)
      window.dispatchEvent(new CustomEvent("aura_wallpaper_updated"))
    } catch (err) {
      console.error("Wallpaper save failed:", err)
      alert("Could not save wallpaper. Try a smaller or lower-resolution image.")
    } finally {
      setUploading(false)
    }
  }

  async function removeWallpaper() {
    await deleteWallpaper()
    setWallpaper(null)
    setPreviewWallpaper(null)
    window.dispatchEvent(new CustomEvent("aura_wallpaper_updated"))
  }

  function handleClearData() {
    if (clearConfirm) {
      localStorage.removeItem("aura_goals")
      localStorage.removeItem("aura_goals_triggered")
      clearHistory()
      setDataCleared(true)
      setClearConfirm(false)
      setTimeout(() => setDataCleared(false), 3000)
    } else {
      setClearConfirm(true)
      setTimeout(() => setClearConfirm(false), 3000)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 overflow-auto min-h-full max-w-2xl">

              <div>
                <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>Settings</h1>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Customize your Aura experience</p>
              </div>

              {/* Profile */}
              <SectionCard title="Profile" icon={User}>
                <div className="flex flex-col gap-3">
                  {([
                    { label: "Display Name", key: "displayName" as const, placeholder: "Your name", type: "text" },
                    { label: "Email",        key: "email"       as const, placeholder: "you@example.com", type: "email" },
                    { label: "Bio",          key: "bio"         as const, placeholder: "Tell Aura about yourself…", type: "text" },
                  ]).map(({ label, key, placeholder, type }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{label}</label>
                      <input type={type} value={String(settings[key] ?? "")} onChange={e => patch(key, e.target.value)}
                        placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--surface)", border: "1px solid var(--border-c)", color: "var(--text-primary)" }} />
                    </div>
                  ))}
                  <button onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold mt-1 w-fit transition-all"
                    style={{ background: saved ? "rgba(34,197,94,0.15)" : "var(--accent-color)", color: saved ? "#22c55e" : "var(--accent-text)" }}>
                    {saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
                    {saved ? "Saved!" : "Save Profile"}
                  </button>
                </div>
              </SectionCard>

              {/* Theme */}
              <SectionCard title="Theme" icon={Palette}>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map(t => {
                    const isActive = theme === t.id
                    return (
                      <button key={t.id} onClick={() => patch("theme", t.id as AppSettings["theme"])}
                        className="flex flex-col items-start gap-2 p-4 rounded-2xl transition-all text-left"
                        style={{ background: isActive ? `${t.color}12` : "var(--surface)", border: `2px solid ${isActive ? t.color : "var(--border-c)"}` }}>
                        <div className="size-8 rounded-xl flex items-center justify-center" style={{ background: t.color }}>
                          <t.Icon className="size-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold" style={{ color: isActive ? t.color : "var(--text-primary)" }}>{t.name}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: t.color }}>
                            <CheckCircle2 className="size-3" />Active
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </SectionCard>

              {/* Wallpaper */}
              <SectionCard title="Wallpaper" icon={Upload}>
                {wallpaper && !previewWallpaper && (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={wallpaper} alt="Current wallpaper" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                      <button onClick={removeWallpaper}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: "rgba(239,68,68,0.9)", color: "white" }}>
                        <X className="size-3.5" />Remove
                      </button>
                    </div>
                  </div>
                )}
                <label className="block cursor-pointer">
                  <div className="flex flex-col items-center gap-2 py-8 px-4 rounded-2xl border-2 border-dashed transition-all"
                    style={{ borderColor: "var(--border-c)", background: "var(--surface)" }}>
                    <Upload className="size-6" style={{ color: "var(--accent-color)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {wallpaper ? "Upload new wallpaper" : "Drop wallpaper or click to upload"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>PNG, JPG, WebP · Auto-compressed, no quota errors</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
                </label>
                {previewWallpaper && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Preview</p>
                    <div className="rounded-2xl overflow-hidden">
                      <img src={previewWallpaper} alt="Preview" className="w-full h-32 object-cover" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={applyWallpaper} disabled={uploading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                        style={{ background: "var(--accent-color)", color: "var(--accent-text)", opacity: uploading ? 0.7 : 1 }}>
                        {uploading ? <><Loader2 className="size-4 animate-spin" />Saving…</> : "Apply Wallpaper"}
                      </button>
                      <button onClick={() => setPreviewWallpaper(null)} disabled={uploading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Notifications */}
              <SectionCard title="Notifications" icon={BellRing}>
                <div className="flex flex-col gap-4">
                  {([
                    { key: "notifications"        as const, label: "In-app notifications",  desc: "Show check-in popups inside the app" },
                    { key: "browserNotifications" as const, label: "Browser notifications", desc: "Push alerts even when on other pages" },
                  ]).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl"
                      style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
                      </div>
                      <Toggle checked={Boolean(settings[key])} onChange={v => patch(key, v)} />
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Language */}
              <SectionCard title="Language & Region" icon={Globe}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Language</label>
                    <select value={settings.language} onChange={e => patch("language", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
                      style={{ background: "var(--surface)", border: "1px solid var(--border-c)", color: "var(--text-primary)" }}>
                      {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Timezone</label>
                    <input value={settings.timezone} onChange={e => patch("timezone", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--surface)", border: "1px solid var(--border-c)", color: "var(--text-primary)" }} />
                  </div>
                </div>
              </SectionCard>

              {/* Privacy */}
              <SectionCard title="Privacy & Data" icon={Shield}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl"
                    style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Private mode</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Blur goal details when screen sharing</p>
                    </div>
                    <Toggle checked={settings.privateMode} onChange={v => patch("privateMode", v)} />
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "#ef4444" }}>Danger Zone</p>
                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Permanently clear all goals and history. Cannot be undone.</p>
                    {dataCleared ? (
                      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#22c55e" }}>
                        <CheckCircle2 className="size-4" />All data cleared
                      </div>
                    ) : (
                      <button onClick={handleClearData}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: clearConfirm ? "#ef4444" : "rgba(239,68,68,0.1)", color: clearConfirm ? "white" : "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                        <Trash2 className="size-3.5" />
                        {clearConfirm ? "Click again to confirm" : "Clear all goals & history"}
                      </button>
                    )}
                  </div>
                </div>
              </SectionCard>

    </div>
  )
}
