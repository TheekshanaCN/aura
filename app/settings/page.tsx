"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { GalleryVerticalEnd, Bell, Briefcase, Plus, Flame, Gem, Upload, Moon, Sun, Palette } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { api } from "@/lib/api"

const themes = [
  { id: "night", name: "Midnight Glass", icon: Moon, color: "#0a84ff" },
  { id: "morning", name: "Light Glass", icon: Sun, color: "#0071e3" },
  { id: "evening", name: "Purple Glass", icon: Palette, color: "#ff9500" },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [wallpaper, setWallpaper] = useState<string | null>(null)
  const [previewWallpaper, setPreviewWallpaper] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    // Load wallpaper from localStorage
    const savedWallpaper = localStorage.getItem("aura-wallpaper")
    if (savedWallpaper) {
      setWallpaper(savedWallpaper)
    }

    // Load user and settings from API
    const loadData = async () => {
      try {
        const [userData, settingsData] = await Promise.all([
          api.user.getProfile(),
          api.settings.getSettings(),
        ])
        setUser(userData)
        setSettings(settingsData)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [])

  const data = {
    user: user || {
      name: "Theekshana",
      email: "theekshana@aura.ai",
      avatar: "/avatars/shadcn.jpg",
    },
  }

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPreviewWallpaper(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const applyWallpaper = () => {
    if (previewWallpaper) {
      setWallpaper(previewWallpaper)
      localStorage.setItem("aura-wallpaper", previewWallpaper)
      setPreviewWallpaper(null)
    }
  }

  const removeWallpaper = () => {
    setWallpaper(null)
    localStorage.removeItem("aura-wallpaper")
  }

  if (!mounted) return null

  return (
    <SidebarProvider>
      <div
        className="flex flex-col w-full min-h-screen"
        style={{ background: "var(--app-bg)", color: "var(--text-primary)" }}
      >
        {/* Global Sticky Header */}
        <header
          className="sticky top-0 z-50 flex h-16 w-full items-center justify-between px-4 glass"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex aspect-square size-8 items-center justify-center rounded-lg"
              style={{ background: "var(--logo-bg)", color: "var(--logo-text)" }}
            >
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              aura
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden items-center gap-2 md:flex">
              {[Briefcase, Bell].map((Icon, i) => (
                <button
                  key={i}
                  className="flex size-9 items-center justify-center rounded-xl transition-colors"
                  style={{
                    background: "var(--btn-icon-bg)",
                    color: "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--btn-icon-hover)"
                    e.currentTarget.style.color = "var(--text-primary)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--btn-icon-bg)"
                    e.currentTarget.style.color = "var(--text-muted)"
                  }}
                >
                  <Icon className="size-5" />
                </button>
              ))}
            </div>

            <div
              className="glass flex items-center gap-3 px-3 py-1.5 rounded-xl"
              style={{
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <Flame className="size-4 fill-orange-500 text-orange-500" />
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>91</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gem className="size-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>1K</span>
              </div>
            </div>
            <NavUser user={data.user} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset style={{ background: "var(--app-bg)" }}>
            <div className="flex flex-1 flex-col gap-8 p-6 lg:p-10 overflow-auto">
              {/* Page Header */}
              <div className="mb-6">
                <h1
                  className="text-4xl font-bold tracking-tight mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Settings
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                  Customize your Aura experience with themes and backgrounds
                </p>
              </div>

              {/* Theme Settings */}
              <div className="glass-card p-6 rounded-2xl max-w-2xl">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  🎨 Theme Selection
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className="glass-card p-4 rounded-xl transition-all duration-300 text-left group glass-hover"
                      style={{
                        opacity: theme === t.id ? 1 : 0.7,
                        borderColor: theme === t.id ? t.color : "var(--border-glass)",
                        borderWidth: "2px",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="flex items-center justify-center size-10 rounded-lg"
                          style={{ background: t.color }}
                        >
                          <t.icon className="size-5 text-white" />
                        </div>
                        <div>
                          <h3
                            className="font-semibold text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {t.name}
                          </h3>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {theme === t.id ? "Active" : "Select"}
                          </p>
                        </div>
                      </div>
                      {theme === t.id && (
                        <div
                          className="text-xs font-semibold mt-2"
                          style={{ color: t.color }}
                        >
                          ✓ Currently active
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallpaper Settings */}
              <div className="glass-card p-6 rounded-2xl max-w-2xl">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  🖼️ Background Wallpaper
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Upload a custom wallpaper to personalize your dashboard background. Images are displayed with a glass effect overlay.
                </p>

                {/* Current Wallpaper Preview */}
                {wallpaper && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                      Current Wallpaper
                    </p>
                    <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-glass)" }}>
                      <img
                        src={wallpaper}
                        alt="Current wallpaper"
                        className="w-full h-40 object-cover"
                      />
                      <Button
                        onClick={removeWallpaper}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                {/* Upload Section */}
                <div className="space-y-4">
                  <label className="block">
                    <div
                      className="glass glass-hover border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                      style={{
                        borderColor: "var(--border-glass)",
                        background: "var(--surface-card)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <Upload className="size-8 mx-auto mb-3" style={{ color: "var(--accent-color)" }} />
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        Drop your wallpaper here or click to upload
                      </p>
                      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                        PNG, JPG, WebP • Max 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleWallpaperUpload}
                        className="hidden"
                      />
                    </div>
                  </label>

                  {/* Preview */}
                  {previewWallpaper && (
                    <div>
                      <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                        Preview
                      </p>
                      <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-glass)" }}>
                        <img
                          src={previewWallpaper}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button
                          onClick={applyWallpaper}
                          className="flex-1"
                          style={{
                            background: "var(--accent-color)",
                            color: "var(--accent-text)",
                          }}
                        >
                          Apply Wallpaper
                        </Button>
                        <Button
                          onClick={() => setPreviewWallpaper(null)}
                          className="flex-1"
                          style={{
                            background: "var(--surface-hover)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-glass)",
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Glass Effect Info */}
              <div className="glass-card p-6 rounded-2xl max-w-2xl">
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  ✨ Premium Glass Effects
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  <li>✓ Frosted glass morphism cards with backdrop blur</li>
                  <li>✓ Custom wallpaper support with overlay</li>
                  <li>✓ Smooth theme transitions</li>
                  <li>✓ Advanced shadow and depth effects</li>
                  <li>✓ Premium color palettes for each theme</li>
                </ul>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
