"use client"

import { useState, useRef, useEffect } from "react"
import CardTabs from "@/components/feed/CardTabs"
import SearchBar from "@/components/SearchBar"
import { ChevronUp } from "lucide-react"

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
  )
}
