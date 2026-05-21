"use client"

import * as React from "react"
import {
  Compass,
  History,
  Sparkles,
  User2,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: User2,
    },
    {
      title: "Goals",
      url: "/goals",
      icon: Compass,
    },
    {
      title: "History",
      url: "/history",
      icon: History,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Sparkles,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      style={{
        background: "var(--sidebar-bg-c)",
        borderRight: "1px solid var(--border-c)",
      }}
    >
      <SidebarHeader
        className="px-4 py-4"
        style={{ background: "var(--sidebar-bg-c)" }}
      >
        <div className="flex items-center justify-between min-h-8">
          {!isCollapsed && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-1"
              style={{ color: "var(--text-subtle)" }}
            >
              Menu
            </span>
          )}
          <SidebarTrigger
            className={cn(
              "transition-colors",
              isCollapsed && "mx-auto"
            )}
            style={{ color: "var(--text-muted)" }}
          />
        </div>
      </SidebarHeader>

      <SidebarContent
        className="px-2 pt-2 scrollbar-none"
        style={{ background: "var(--sidebar-bg-c)" }}
      >
        <NavMain items={data.navMain} />

        {!isCollapsed && (
          <div
            className="mt-8 px-4 py-5 rounded-[2rem] mx-1"
            style={{
              background: "var(--upgrade-bg)",
              border: "1px solid var(--upgrade-border)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="size-5 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent-color)" }}
              >
                <Plus
                  className="size-3"
                  style={{ color: "var(--accent-text)" }}
                  strokeWidth={4}
                />
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: "var(--upgrade-text)" }}
              >
                Upgrade to Plus
              </span>
            </div>
            <p
              className="text-[10px] leading-relaxed mb-4 font-medium italic"
              style={{ color: "var(--text-muted)" }}
            >
              Empower your workflow with Aura Intelligence.
            </p>
            <button
              className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
              style={{
                background: "var(--upgrade-btn-bg)",
                color: "var(--upgrade-text)",
              }}
            >
              Upgrade
            </button>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter
        className="p-2 border-none"
        style={{ background: "var(--sidebar-bg-c)" }}
      >
        {/* Footer items */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
