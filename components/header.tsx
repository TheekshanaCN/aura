// components/header.tsx
"use client"

import { GalleryVerticalEnd, Bell, Briefcase, Flame, Gem } from "lucide-react"
import { NavUser } from "@/components/nav-user"
import { CurrentGoalBadge } from "@/components/current-goal-badge"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex h-16 w-full items-center justify-between px-4 shadow-sm"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "var(--app-bg)", // match main background
        borderBottom: "1px solid var(--border-c)", // optional: subtle separation
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex aspect-square size-8 items-center justify-center rounded-lg"
          style={{
            background: "var(--logo-bg)",
            color: "var(--logo-text)",
          }}
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

      <div className="hidden md:flex items-center justify-center flex-1">
        <CurrentGoalBadge />
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
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl"
          style={{ background: "var(--btn-icon-bg)" }}
        >
          <div className="flex items-center gap-1.5">
            <Flame className="size-4 fill-orange-500 text-orange-500" />
            <span
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              91
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gem className="size-4 fill-yellow-500 text-yellow-500" />
            <span
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              1K
            </span>
          </div>
        </div>

        <NavUser user={data.user} />
      </div>
    </header>
  )
}