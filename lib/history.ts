// lib/history.ts — localStorage history log

export interface HistoryEntry {
  id: string
  action: string
  description: string
  timestamp: string
  category: "goal" | "chat" | "activity" | "system" | "checkin"
  meta?: Record<string, string | number>
}

const HISTORY_KEY = "aura_history"
const MAX_ENTRIES = 200

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch { return [] }
}

export function logHistory(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  if (typeof window === "undefined") return
  try {
    const existing = loadHistory()
    const newEntry: HistoryEntry = {
      ...entry,
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    }
    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("aura_history_updated"))
  } catch { }
}

export function clearHistory() {
  if (typeof window === "undefined") return
  localStorage.removeItem(HISTORY_KEY)
}

export function deleteHistoryEntry(id: string) {
  if (typeof window === "undefined") return
  try {
    const updated = loadHistory().filter((h) => h.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch { }
}
