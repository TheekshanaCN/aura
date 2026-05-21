"use client"

import { useEffect, useState } from "react"
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api, FeedCategory, FeedItem } from "@/lib/api"

// ============================================
// Category Config
// ============================================

type CategoryDef = {
  value: FeedCategory
  label: string
  icon: string
  special?: boolean     // highlights New Launch & Offers
  specialColor?: string
}

const CORE_CATEGORIES: CategoryDef[] = [
  { value: "all",        label: "All",         icon: "✦" },
  { value: "new_launch", label: "New Launch",  icon: "🚀", special: true, specialColor: "#7C3AED" },
  { value: "offers",     label: "Offers",      icon: "🎁", special: true, specialColor: "#059669" },
  { value: "ai",         label: "AI & Tech",   icon: "🤖" },
  { value: "productivity",label: "Productivity",icon: "⚡" },
]

const MORE_CATEGORIES: CategoryDef[] = [
  { value: "startups", label: "Startups",     icon: "🌱" },
  { value: "design",   label: "Design",       icon: "🎨" },
  { value: "indie",    label: "Indie",        icon: "💰" },
  { value: "learning", label: "Learning",     icon: "🎓" },
]

// ============================================
// Source Badge
// ============================================

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  twitter:     { label: "𝕏 Twitter",      color: "#1DA1F2" },
  hackernews:  { label: "⚡ Hacker News",  color: "#FF6600" },
  producthunt: { label: "🚀 Product Hunt", color: "#FF6B35" },
  reddit:      { label: "🔥 Reddit",       color: "#FF4500" },
  aura:        { label: "✨ Aura",          color: "var(--accent-color)" },
}

const getSourceBadge = (source?: string) =>
  SOURCE_BADGES[source || "aura"] || SOURCE_BADGES.aura

// ============================================
// Category Filter
// ============================================

function CategoryFilter({
  active,
  onChange,
}: {
  active: FeedCategory
  onChange: (c: FeedCategory) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const renderChip = (cat: CategoryDef) => {
    const isActive = active === cat.value
    const isSpecial = cat.special

    return (
      <button
        key={cat.value}
        onClick={() => onChange(cat.value)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer select-none"
        style={
          isActive && isSpecial
            ? {
                background: cat.specialColor,
                color: "#fff",
                border: `1px solid ${cat.specialColor}`,
                boxShadow: `0 0 12px ${cat.specialColor}55`,
              }
            : isActive
            ? {
                background: "var(--accent-color)",
                color: "#fff",
                border: "1px solid var(--accent-color)",
              }
            : isSpecial
            ? {
                background: `${cat.specialColor}18`,
                color: cat.specialColor,
                border: `1px solid ${cat.specialColor}45`,
              }
            : {
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--border-glass)",
              }
        }
        onMouseEnter={(e) => {
          if (!isActive) {
            const el = e.currentTarget
            el.style.borderColor = isSpecial
              ? cat.specialColor!
              : "var(--accent-color)"
            el.style.color = isSpecial ? cat.specialColor! : "var(--text-primary)"
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            const el = e.currentTarget
            el.style.borderColor = isSpecial ? `${cat.specialColor}45` : "var(--border-glass)"
            el.style.color = isSpecial ? cat.specialColor! : "var(--text-muted)"
          }
        }}
      >
        <span className="text-sm leading-none">{cat.icon}</span>
        <span>{cat.label}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      {CORE_CATEGORIES.map(renderChip)}

      {/* More categories (expanded) */}
      {expanded && MORE_CATEGORIES.map(renderChip)}

      {/* See All / Collapse toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer select-none"
        style={{
          background: "transparent",
          color: "var(--text-muted)",
          border: "1px dashed var(--border-glass)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)"
          e.currentTarget.style.borderColor = "var(--text-muted)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)"
          e.currentTarget.style.borderColor = "var(--border-glass)"
        }}
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Less</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            <span>More</span>
          </>
        )}
      </button>
    </div>
  )
}

// ============================================
// Card Item
// ============================================

function CardItem({
  title,
  image,
  author,
  source,
  likes,
  comments,
  actionUrl,
  category,
  onCardClick,
}: FeedItem & { onCardClick?: () => void }) {
  const badge = getSourceBadge(source)

  // Special badge overlay for New Launch and Offers cards
  const categoryOverlay =
    category === "new_launch"
      ? { label: "New Launch", color: "#7C3AED" }
      : category === "offers"
      ? { label: "Offer", color: "#059669" }
      : null

  return (
    <div
      onClick={onCardClick}
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-glass)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = "var(--accent-color)"
        el.style.transform = "translateY(-3px)"
        el.style.boxShadow = "0 16px 40px rgba(0,0,0,0.2)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = "var(--border-glass)"
        el.style.transform = "translateY(0)"
        el.style.boxShadow = "none"
      }}
    >
      {/* Image */}
      {image && (
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Category overlay pill on image */}
          {categoryOverlay && (
            <div
              className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                background: categoryOverlay.color,
                color: "#fff",
                letterSpacing: "0.02em",
              }}
            >
              {category === "new_launch" ? "🚀" : "🎁"} {categoryOverlay.label}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-2.5 p-4">
        {/* Source + External */}
        <div className="flex items-center justify-between">
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: `${badge.color}18`,
              color: badge.color,
              border: `1px solid ${badge.color}35`,
            }}
          >
            {badge.label}
          </span>
          {actionUrl && (
            <ExternalLink
              className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity duration-200"
              style={{ color: "var(--text-muted)" }}
            />
          )}
        </div>

        {/* Title */}
        <h3
          className="text-sm font-semibold leading-snug line-clamp-2"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>

        {/* Author */}
        {author && (
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {author}
          </p>
        )}

        {/* Stats */}
        {(likes !== undefined || comments !== undefined) && (
          <div
            className="flex gap-3 pt-2 border-t"
            style={{ borderColor: "var(--border-glass)" }}
          >
            {likes !== undefined && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                💙 {likes >= 1000 ? `${(likes / 1000).toFixed(1)}k` : likes}
              </span>
            )}
            {comments !== undefined && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                💬 {comments >= 1000 ? `${(comments / 1000).toFixed(1)}k` : comments}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Empty State
// ============================================

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="col-span-full flex flex-col items-center justify-center py-16 gap-3"
      style={{ color: "var(--text-muted)" }}
    >
      <span className="text-3xl opacity-40">✦</span>
      <p className="text-sm">No {label} items in this category</p>
    </div>
  )
}

// ============================================
// Loading Skeleton
// ============================================

function SkeletonCard() {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border-glass)" }}
    >
      <div className="aspect-video" style={{ background: "var(--border-glass)" }} />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-4 w-20 rounded-full" style={{ background: "var(--border-glass)" }} />
        <div className="h-3.5 w-full rounded" style={{ background: "var(--border-glass)" }} />
        <div className="h-3.5 w-3/4 rounded" style={{ background: "var(--border-glass)" }} />
        <div className="h-3 w-16 rounded mt-1" style={{ background: "var(--border-glass)" }} />
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export default function CardTabs() {
  const [forYouItems, setForYouItems]           = useState<FeedItem[]>([])
  const [goalFocusedItems, setGoalFocusedItems] = useState<FeedItem[]>([])
  const [activeCategory, setActiveCategory]     = useState<FeedCategory>("all")
  const [isLoading, setIsLoading]               = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [forYou, goalFocused] = await Promise.all([
          api.feed.getForYou(),
          api.feed.getGoalFocused(),
        ])
        setForYouItems(forYou)
        setGoalFocusedItems(goalFocused)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleCardClick = (url?: string) => {
    if (url) window.open(url, "_blank")
  }

  const filter = (items: FeedItem[]) =>
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category === activeCategory)

  const filteredForYou      = filter(forYouItems)
  const filteredGoalFocused = filter(goalFocusedItems)

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Tabs defaultValue="for-you" className="w-full">

        {/* ── Tab switcher ── */}
        <div className="flex items-center justify-center mb-6">
          <TabsList
            className="grid grid-cols-2 h-10 p-1 rounded-xl gap-1"
            style={{
              background: "var(--surface-glass)",
              border: "1px solid var(--border-glass)",
              width: "320px",
            }}
          >
            {[
              { value: "for-you",       label: "For You" },
              { value: "goal-focused",  label: "Goal Focused" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="h-full px-5 rounded-lg text-sm font-medium transition-all duration-150 data-[state=active]:shadow-none cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Category filter ── */}
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

        {/* ── Content ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <TabsContent value="for-you" className="mt-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredForYou.length > 0
                  ? filteredForYou.map((item) => (
                      <CardItem
                        key={item.id}
                        {...item}
                        onCardClick={() => handleCardClick(item.actionUrl)}
                      />
                    ))
                  : <EmptyState label="For You" />}
              </div>
            </TabsContent>

            <TabsContent value="goal-focused" className="mt-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredGoalFocused.length > 0
                  ? filteredGoalFocused.map((item) => (
                      <CardItem
                        key={item.id}
                        {...item}
                        onCardClick={() => handleCardClick(item.actionUrl)}
                      />
                    ))
                  : <EmptyState label="Goal Focused" />}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}