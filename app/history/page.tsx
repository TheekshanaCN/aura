"use client"

import { useState, useEffect, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  GalleryVerticalEnd, Bell, Briefcase, Flame, Gem, Clock,
  Trash2, Search, Target, MessageSquare, Zap, Settings2,
  CheckCircle2, Filter, RefreshCw, XCircle,
} from "lucide-react"
import { CurrentGoalBadge } from "@/components/current-goal-badge"
import { loadHistory, deleteHistoryEntry, clearHistory, HistoryEntry } from "@/lib/history"

const data = { user: { name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" } }

type Category = HistoryEntry["category"] | "all"

const categoryConfig: Record<HistoryEntry["category"], { label: string; color: string; Icon: React.ElementType }> = {
  goal:     { label: "Goal",     color: "#22c55e", Icon: Target },
  chat:     { label: "Chat",     color: "#3b82f6", Icon: MessageSquare },
  activity: { label: "Activity", color: "#f59e0b", Icon: Zap },
  system:   { label: "System",   color: "#8b5cf6", Icon: Settings2 },
  checkin:  { label: "Check-in", color: "#6366f1", Icon: CheckCircle2 },
}

function formatRelative(isoStr: string): string {
  const date = new Date(isoStr)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function groupByDate(items: HistoryEntry[]): { label: string; items: HistoryEntry[] }[] {
  const groups: Record<string, HistoryEntry[]> = {}
  const todayStr = new Date().toDateString()
  const yestStr  = new Date(Date.now() - 86_400_000).toDateString()
  for (const item of items) {
    const d = new Date(item.timestamp).toDateString()
    const label = d === todayStr ? "Today" : d === yestStr ? "Yesterday"
      : new Date(item.timestamp).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    if (!groups[label]) groups[label] = []
    groups[label].push(item)
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }))
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Category>("all")
  const [confirmClear, setConfirmClear] = useState(false)

  function reload() { setItems(loadHistory()) }

  useEffect(() => {
    reload()
    const onCustom = () => reload()
    const onStorage = (e: StorageEvent) => { if (e.key === "aura_history") reload() }
    window.addEventListener("aura_history_updated", onCustom)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("aura_history_updated", onCustom)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  function handleDelete(id: string) { deleteHistoryEntry(id); reload() }

  function handleClearAll() {
    if (confirmClear) { clearHistory(); reload(); setConfirmClear(false) }
    else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000) }
  }

  const filtered = useMemo(() => {
    let r = items
    if (filter !== "all") r = r.filter(i => i.category === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      r = r.filter(i => i.action.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
    }
    return r
  }, [items, filter, query])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    for (const cat of Object.keys(categoryConfig)) c[cat] = items.filter(i => i.category === cat).length
    return c
  }, [items])

  return (
    <SidebarProvider>
      <div className="flex flex-col w-full min-h-screen" style={{ background: "var(--app-bg)", color: "var(--text-primary)" }}>

        <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between px-4 glass"
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg"
              style={{ background: "var(--logo-bg)", color: "var(--logo-text)" }}>
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>aura</span>
          </div>
          <div className="hidden md:flex items-center justify-center flex-1"><CurrentGoalBadge /></div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden items-center gap-2 md:flex">
              {[Briefcase, Bell].map((Icon, i) => (
                <button key={i} className="flex size-9 items-center justify-center rounded-xl"
                  style={{ background: "var(--btn-icon-bg)", color: "var(--text-muted)" }}>
                  <Icon className="size-5" />
                </button>
              ))}
            </div>
            <div className="glass flex items-center gap-3 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5"><Flame className="size-4 fill-orange-500 text-orange-500" />
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>91</span></div>
              <div className="flex items-center gap-1.5"><Gem className="size-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>1K</span></div>
            </div>
            <NavUser user={data.user} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset style={{ background: "var(--app-bg)" }}>
            <div className="flex flex-col gap-6 p-6 lg:p-8 overflow-auto min-h-full">

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>History</h1>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{items.length} events logged</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={reload} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>
                    <RefreshCw className="size-3.5" />Refresh
                  </button>
                  {items.length > 0 && (
                    <button onClick={handleClearAll}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: confirmClear ? "rgba(239,68,68,0.12)" : "var(--surface)", color: confirmClear ? "#ef4444" : "var(--text-muted)", border: `1px solid ${confirmClear ? "rgba(239,68,68,0.3)" : "var(--border-c)"}` }}>
                      <Trash2 className="size-3.5" />{confirmClear ? "Confirm clear all" : "Clear all"}
                    </button>
                  )}
                </div>
              </div>

              <div className="relative max-w-xl">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: "var(--text-muted)" }} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search history…"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-c)", color: "var(--text-primary)" }} />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                    <XCircle className="size-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="size-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                {(["all", ...Object.keys(categoryConfig)] as Category[]).map(cat => {
                  const cfg = cat !== "all" ? categoryConfig[cat as HistoryEntry["category"]] : null
                  const active = filter === cat
                  return (
                    <button key={cat} onClick={() => setFilter(cat)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: active ? (cfg ? `${cfg.color}18` : "var(--accent-color)") : "var(--surface)",
                        color: active ? (cfg ? cfg.color : "var(--accent-text)") : "var(--text-muted)",
                        border: `1px solid ${active ? (cfg ? `${cfg.color}35` : "transparent") : "var(--border-c)"}`,
                      }}>
                      {cfg && <cfg.Icon className="size-3" />}
                      {cat === "all" ? "All" : cfg!.label}
                      <span className="opacity-60">({counts[cat] ?? 0})</span>
                    </button>
                  )
                })}
              </div>

              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="size-16 rounded-3xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                    <Clock className="size-8" style={{ color: "var(--accent-color)" }} />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No history yet</p>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      Create a goal, do a check-in, or change a status — it will appear here.
                    </p>
                  </div>
                </div>
              )}

              {items.length > 0 && filtered.length === 0 && (
                <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}

              <div className="flex flex-col gap-6 max-w-2xl">
                {groups.map(({ label, items: groupItems }) => (
                  <div key={label} className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </p>
                    <div className="flex flex-col gap-2">
                      {groupItems.map(item => {
                        const cfg = categoryConfig[item.category] ?? categoryConfig.system
                        return (
                          <div key={item.id}
                            className="flex items-start gap-3 p-4 rounded-2xl group transition-all"
                            style={{ background: "var(--surface-card)", border: "1px solid var(--border-glass)" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-color)" }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-glass)" }}>
                            <div className="size-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: `${cfg.color}15`, color: cfg.color }}>
                              <cfg.Icon className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.action}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
                              </div>
                              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[11px] whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                                {formatRelative(item.timestamp)}
                              </span>
                              <button onClick={() => handleDelete(item.id)}
                                className="size-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
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
