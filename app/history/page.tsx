"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { GalleryVerticalEnd, Bell, Briefcase, Flame, Gem, Clock, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { api, HistoryItem } from "@/lib/api"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      try {
        const items = await api.history.getAll()
        setHistoryItems(items)
      } catch (error) {
        console.error("Error loading history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])
  const getTypeColor = (category: string) => {
    switch (category) {
      case "goal":
        return "#22c55e"
      case "chat":
        return "#3b82f6"
      case "activity":
        return "#f59e0b"
      case "system":
        return "#8b5cf6"
      default:
        return "var(--accent-color)"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

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
            <div className="flex flex-1 flex-col gap-6 p-6 lg:p-10 overflow-auto">
              {/* Page Header */}
              <div>
                <h1
                  className="text-4xl font-bold tracking-tight mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  History
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                  View all your recent activities and actions
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-5"
                  style={{ color: "var(--text-subtle)" }}
                />
                <Input
                  placeholder="Search history..."
                  className="h-12 pl-12 pr-4 rounded-xl focus:ring-0"
                  style={{
                    background: "var(--search-bg)",
                    border: "1px solid var(--search-border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* History List */}
              <div className="space-y-3 max-w-2xl">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card p-4 rounded-xl flex items-start justify-between gap-4 group"
                    style={{
                      background: "var(--surface-card)",
                      border: "1px solid var(--border-glass)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Type Icon */}
                      <div
                        className="flex items-center justify-center size-10 rounded-lg flex-shrink-0 mt-0.5"
                        style={{ background: `${getTypeColor(item.category)}20`, color: getTypeColor(item.category) }}
                      >
                        <Clock className="size-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.action}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: `${getTypeColor(item.category)}15`,
                              color: getTypeColor(item.category),
                            }}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p
                          className="text-xs line-clamp-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Time and Delete */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p
                        className="text-xs whitespace-nowrap"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatTime(item.timestamp)}
                      </p>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                        style={{
                          background: "var(--surface-hover)",
                          color: "var(--text-muted)",
                        }}
                        title="Remove from history"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
