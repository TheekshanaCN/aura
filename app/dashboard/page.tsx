"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import CardTabs from "@/components/feed/CardTabs"
import { Flame, GalleryVerticalEnd, Search, Bell, Plus, Briefcase, Gem } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

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
    <SidebarProvider>
      <div
        className="flex flex-col w-full min-h-screen"
        style={{ background: "var(--app-bg)", color: "var(--text-primary)" }}
      >
        {/* Global Sticky Header */}
        <header
          className="sticky top-0 z-50 flex h-16 w-full items-center justify-between px-4"
          style={{
            background: "var(--app-bg)",
            borderBottom: "1px solid var(--border-c)",
          }}
        >
          {/* Logo Section */}
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

          {/* Action Icons */}
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
              <button
                className="flex size-9 items-center justify-center rounded-xl transition-colors"
                style={{ background: "var(--btn-icon-bg)", color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--btn-icon-hover)"
                  e.currentTarget.style.color = "var(--text-primary)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--btn-icon-bg)"
                  e.currentTarget.style.color = "var(--text-muted)"
                }}
              >
                <div
                  className="p-0.5 rounded-md"
                  style={{ border: "1px solid var(--text-muted)" }}
                >
                  <Plus className="size-3" />
                </div>
              </button>
            </div>

            <div
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-c)",
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
              <div className="flex items-center gap-1.5">
                <div
                  className="size-4 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent-secondary)" }}
                >
                  <Plus className="size-3 text-white" />
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>440</span>
              </div>
            </div>
            <NavUser user={data.user} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset style={{ background: "var(--app-bg)" }}>
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
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
