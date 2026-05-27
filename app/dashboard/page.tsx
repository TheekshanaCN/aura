"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import CardTabs from "@/components/feed/CardTabs"
import { Search } from "lucide-react"

const shortcuts = [
  {
    name: "GitHub",
    url: "https://github.com",
    icon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
  },
  {
    name: "YouTube",
    url: "https://youtube.com",
    icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
  },
  {
    name: "ChatGPT",
    url: "https://chat.openai.com",
    icon: "https://www.google.com/s2/favicons?domain=openai.com&sz=64",
  },
  {
    name: "Product Hunt",
    url: "https://producthunt.com",
    icon: "https://www.google.com/s2/favicons?domain=producthunt.com&sz=64",
  },
]

export default function Page() {
  return (
    <div className="flex flex-1 flex-col items-center gap-16 p-6 lg:p-10 overflow-auto">

              {/* ===== HERO SECTION ===== */}
              <div className="flex flex-col items-center justify-center gap-8 mt-20 text-center">

                <h1
                  className="text-4xl md:text-6xl font-extrabold tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  Good Evening,{" "}
                  <span style={{ color: "var(--accent-color)" }}>Theekshana</span>
                </h1>

                {/* ===== SHORTCUTS ===== */}
                <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
                  {shortcuts.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 group"
                      style={{
                        background: "var(--shortcut-bg)",
                        border: "1px solid var(--border-c)",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget
                        el.style.background = "var(--shortcut-hover-bg)"
                        el.style.borderColor = "var(--shortcut-hover-border)"
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget
                        el.style.background = "var(--shortcut-bg)"
                        el.style.borderColor = "var(--border-c)"
                      }}
                    >
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="size-5 rounded-sm"
                      />
                      <span
                        className="text-sm font-medium transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.name}
                      </span>
                    </a>
                  ))}
                </div>

                {/* Enhanced Search Bar */}
                <form
                  action="https://www.google.com/search"
                  method="GET"
                  className="relative w-full max-w-2xl"
                >
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-5"
                    style={{ color: "var(--text-subtle)" }}
                  />

                  <Input
                    name="q"
                    placeholder="Search the web..."
                    required
                    className="h-14 pl-12 pr-28 rounded-full focus:ring-0 transition-all"
                    style={{
                      background: "var(--search-bg)",
                      border: "1px solid var(--search-border)",
                      color: "var(--text-primary)",
                    }}
                  />

                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6 h-10 transition-colors"
                    style={{
                      background: "var(--accent-color)",
                      color: "var(--accent-text)",
                    }}
                  >
                    Search
                  </Button>
                </form>
              </div>

              {/* ===== CARD GRID ===== */}
              <CardTabs />

    </div>
  )
}
