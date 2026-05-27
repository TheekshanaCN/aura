// components/app-sidebar.tsx (unchanged except removing border-none)
"use client";

import * as React from "react";
import { Compass, History, Sparkles, User2 } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Home", url: "/", icon: User2 },
    { title: "Goals", url: "/goals", icon: Compass },
    { title: "History", url: "/history", icon: History },
    { title: "Settings", url: "/settings", icon: Sparkles },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <div className="flex items-center justify-between min-h-8" />
      </SidebarHeader>
      <SidebarContent
        className="px-2 pt-2 scrollbar-none"
        style={{ background: "var(--sidebar-bg-c)" }}
      >
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter
        className="p-2"
        style={{ background: "var(--sidebar-bg-c)" }}
      />
      <SidebarRail />
    </Sidebar>
  );
}
