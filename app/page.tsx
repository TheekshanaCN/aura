"use client"

import { useState, useRef, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import CardTabs from "@/components/feed/CardTabs"
import SearchBar from "@/components/SearchBar"
import { Flame, GalleryVerticalEnd, Bell, Plus, Briefcase, Gem, ChevronUp } from "lucide-react"
import { api } from "@/lib/api"

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
  const [isFullscreenFeed, setIsFullscreenFeed] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const feedSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const currentScrollY = contentRef.current.scrollTop
      const feedSection = feedSectionRef.current

      if (!feedSection) return

      const feedOffsetTop = feedSection.offsetTop
      const feedHeight = feedSection.offsetHeight

      // When scrolling down and feed is near viewport, show fullscreen
      if (currentScrollY > lastScrollY && currentScrollY > feedOffsetTop - 100) {
        setIsFullscreenFeed(true)
      }
      // When scrolling up, hide fullscreen
      else if (currentScrollY < lastScrollY && currentScrollY < feedOffsetTop - 200) {
        setIsFullscreenFeed(false)
      }

      setLastScrollY(currentScrollY)
    }

    const content = contentRef.current
    if (content) {
      content.addEventListener("scroll", handleScroll)
      return () => content.removeEventListener("scroll", handleScroll)
    }
  }, [lastScrollY])

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
            <div 
              ref={contentRef}
              className="flex flex-1 flex-col items-center gap-16 p-8 lg:p-16 overflow-auto w-full"
            >

              {/* ===== HERO SECTION ===== */}
              <div className="flex flex-col items-center justify-center gap-12 mt-12 text-center max-w-4xl w-full mx-auto">

                <h1
                  className="text-5xl md:text-7xl font-bold tracking-tight"
                  style={{ 
                    color: "var(--text-primary)",
                    letterSpacing: "-1px"
                  }}
                >
                  Welcome,{" "}
                  <span style={{ color: "var(--accent-color)" }}>Theekshana</span>
                </h1>

                {/* ===== SHORTCUTS (GLASS MORPHISM) ===== */}
                <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
                  {shortcuts.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass glass-hover flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 group"
                      style={{
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
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
                <SearchBar />
              </div>

              {/* ===== CARD GRID ===== */}
              {isFullscreenFeed && (
                <button
                  onClick={() => setIsFullscreenFeed(false)}
                  className="fixed top-6 right-6 z-40 flex items-center justify-center size-10 rounded-full glass hover:bg-opacity-80 transition-all"
                  style={{
                    background: "var(--surface-glass)",
                    border: "1px solid var(--border-glass)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                  title="Exit fullscreen"
                >
                  <ChevronUp className="size-5" style={{ color: "var(--text-primary)" }} />
                </button>
              )}
              <div
                ref={feedSectionRef}
                className={`transition-all duration-300 ease-in-out w-full mx-auto ${
                  isFullscreenFeed
                    ? "fixed inset-0 z-30 w-full h-full overflow-auto p-8 lg:p-16"
                    : "w-full"
                }`}
                style={{
                  background: isFullscreenFeed ? "var(--app-bg)" : "transparent",
                }}
              >
                <CardTabs />
              </div>

            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}