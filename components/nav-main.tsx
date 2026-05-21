"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import { usePathname } from "next/navigation"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
}) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarGroup className="px-0">
      <SidebarMenu className="gap-2">
        {items.map((item) => {
          const active = pathname === item.url
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                size="lg"
                isActive={active}
                className={cn(
                  "relative h-12 transition-all duration-300 ease-in-out px-4 py-3 mx-1 rounded-2xl group active:scale-[0.98]",
                  isCollapsed && "justify-center px-0 mx-auto w-12"
                )}
                style={{
                  background: active ? "var(--surface)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: active ? "0 2px 12px rgba(0,0,0,0.15)" : "none",
                }}
              >
                <a
                  href={item.url}
                  className="flex items-center gap-4"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget.parentElement as HTMLElement
                    if (!active) el.style.background = "var(--surface-hover)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget.parentElement as HTMLElement
                    if (!active) el.style.background = "transparent"
                  }}
                >
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "transition-all duration-300 shrink-0",
                        isCollapsed ? "size-7" : "size-6",
                        active ? "scale-110" : ""
                      )}
                      style={{ color: active ? "var(--accent-color)" : "var(--text-muted)" }}
                    />
                  )}
                  {!isCollapsed && (
                    <span
                      className="text-[15px] font-bold tracking-tight transition-all duration-300"
                      style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}
                    >
                      {item.title}
                    </span>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
