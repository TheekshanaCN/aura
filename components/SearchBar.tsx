"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Search, Mic, X, ChevronDown } from "lucide-react"

// ============================================
// Search Engine Config
// ============================================

type Engine = {
  id: string
  name: string
  url: string
  param: string
  favicon: string
  suggestUrl?: string
}

// Use Google's favicon proxy — never blocked, always works cross-origin
const favicon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

const ENGINES: Engine[] = [
  {
    id: "google",
    name: "Google",
    url: "https://www.google.com/search",
    param: "q",
    favicon: favicon("google.com"),
  },
  {
    id: "bing",
    name: "Bing",
    url: "https://www.bing.com/search",
    param: "q",
    favicon: favicon("bing.com"),
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/",
    param: "q",
    favicon: favicon("duckduckgo.com"),
  },
  {
    id: "brave",
    name: "Brave",
    url: "https://search.brave.com/search",
    param: "q",
    favicon: favicon("brave.com"),
  },
  {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com/results",
    param: "search_query",
    favicon: favicon("youtube.com"),
  },
  {
    id: "perplexity",
    name: "Perplexity",
    url: "https://www.perplexity.ai/search",
    param: "q",
    favicon: favicon("perplexity.ai"),
  },
]

// ============================================
// Engine Selector Dropdown
// ============================================

function EngineSelector({
  active,
  onChange,
}: {
  active: Engine
  onChange: (e: Engine) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 pl-4 pr-2 h-full rounded-l-full transition-all duration-150 cursor-pointer select-none"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <Image
          src={active.favicon}
          alt={active.name}
          width={16}
          height={16}
          className="rounded-sm object-contain"
        />
        <span className="text-xs font-medium hidden sm:block">{active.name}</span>
        <ChevronDown
          className="w-3 h-3 transition-transform duration-150"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 py-1.5 rounded-xl z-50 min-w-[160px] overflow-hidden"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-glass)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          }}
        >
          {ENGINES.map((engine) => (
            <button
              key={engine.id}
              type="button"
              onClick={() => { onChange(engine); setOpen(false) }}
              className="flex items-center gap-3 w-full px-3.5 py-2 text-sm text-left transition-colors duration-100 cursor-pointer"
              style={{
                color: active.id === engine.id ? "var(--text-primary)" : "var(--text-muted)",
                background: active.id === engine.id ? "var(--surface-glass)" : "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-glass)"
                ;(e.currentTarget as HTMLElement).style.color = "var(--text-primary)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background =
                  active.id === engine.id ? "var(--surface-glass)" : "transparent"
                ;(e.currentTarget as HTMLElement).style.color =
                  active.id === engine.id ? "var(--text-primary)" : "var(--text-muted)"
              }}
            >
              <Image
                src={engine.favicon}
                alt={engine.name}
                width={16}
                height={16}
                className="rounded-sm object-contain flex-shrink-0"
              />
              <span className="font-medium">{engine.name}</span>
              {active.id === engine.id && (
                <span className="ml-auto text-xs opacity-50">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Search Bar
// ============================================

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [engine, setEngine] = useState<Engine>(ENGINES[0])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch suggestions (Google only via cors proxy trick — falls back silently)
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setSuggestions([])
      return
    }
    try {
      // Use the DuckDuckGo autocomplete (CORS-friendly)
      const res = await fetch(
        `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`,
        { signal: AbortSignal.timeout(1500) }
      )
      const data = await res.json()
      // DuckDuckGo returns [query, [suggestions]]
      const list: string[] = Array.isArray(data)
        ? (data[1] as string[] | { phrase: string }[]).map((s) =>
            typeof s === "string" ? s : s.phrase
          )
        : []
      setSuggestions(list.slice(0, 8))
    } catch {
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchSuggestions])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      const selected = suggestions[selectedIndex]
      setQuery(selected)
      setShowSuggestions(false)
      setSelectedIndex(-1)
      submitSearch(selected)
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const submitSearch = (q: string) => {
    const url = new URL(engine.url)
    url.searchParams.set(engine.param, q)
    window.location.href = url.toString()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    submitSearch(query)
  }

  const handleMic = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.start()
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      inputRef.current?.focus()
    }
  }

  const clearQuery = () => {
    setQuery("")
    setSuggestions([])
    inputRef.current?.focus()
  }

  const hasSuggestions = showSuggestions && suggestions.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form ref={formRef} onSubmit={handleSubmit}>
        <div
          className="flex items-center h-14 rounded-full overflow-visible transition-all duration-200"
          style={{
            background: "var(--surface-glass)",
            border: `1px solid ${isFocused ? "var(--accent-color)" : "var(--border-glass)"}`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: isFocused
              ? "0 4px 24px rgba(0,0,0,0.15)"
              : "0 2px 8px rgba(0,0,0,0.08)",
            // Flatten bottom corners when suggestions open
            borderRadius: hasSuggestions ? "1.5rem 1.5rem 0 0" : "9999px",
          }}
        >
          {/* Engine selector */}
          <EngineSelector active={engine} onChange={setEngine} />

          {/* Divider */}
          <div
            className="w-px h-5 flex-shrink-0"
            style={{ background: "var(--border-glass)" }}
          />

          {/* Search icon */}
          <Search
            className="ml-3 flex-shrink-0 size-4"
            style={{ color: "var(--text-subtle)" }}
          />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            name={engine.param}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => {
              setIsFocused(true)
              if (query) setShowSuggestions(true)
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${engine.name}...`}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent outline-none text-base px-3"
            style={{ color: "var(--text-primary)" }}
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="flex-shrink-0 p-1.5 rounded-full transition-colors duration-150 cursor-pointer mr-1"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <X className="size-4" />
            </button>
          )}

          {/* Mic button */}
          <button
            type="button"
            onClick={handleMic}
            className="flex-shrink-0 p-1.5 rounded-full transition-colors duration-150 cursor-pointer mr-1"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            title="Search by voice"
          >
            <Mic className="size-4" />
          </button>

          {/* Search button */}
          <button
            type="submit"
            className="flex-shrink-0 flex items-center justify-center mr-1.5 px-5 h-10 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer"
            style={{
              background: "var(--accent-color)",
              color: "var(--accent-text)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {hasSuggestions && (
        <div
          className="absolute left-0 right-0 z-50 overflow-hidden"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--accent-color)",
            borderTop: "none",
            borderRadius: "0 0 1.25rem 1.25rem",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
          }}
        >
          <div className="py-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setQuery(s)
                  setShowSuggestions(false)
                  setSelectedIndex(-1)
                  submitSearch(s)
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className="flex items-center gap-3 w-full px-5 py-2.5 text-sm text-left transition-colors duration-75 cursor-pointer"
                style={{
                  background: selectedIndex === i ? "var(--surface-glass)" : "transparent",
                  color: selectedIndex === i ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                <Search className="size-3.5 flex-shrink-0 opacity-40" />
                <span className="truncate">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}