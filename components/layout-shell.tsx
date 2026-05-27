// components/layout-shell.tsx
"use client"

import { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface LayoutShellProps {
  children: ReactNode
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <SidebarProvider>
      <div
        className="flex flex-col w-full min-h-screen"
        style={{
          background: "var(--app-bg)",
          color: "var(--text-primary)",
        }}
      >
        {/* Full-width header above everything */}
        <Header />

        {/* Sidebar + Main Content row */}
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset
            className="overflow-auto"
            style={{ background: "var(--app-bg)" }}
          >
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}