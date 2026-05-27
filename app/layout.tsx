import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WallpaperProvider } from "@/components/wallpaper-provider";
import { GoalsReminderProvider } from "@/components/goals-reminder-provider";
import { LayoutShell } from "@/components/layout-shell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aura",
  description: "Your personal AI-powered dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <WallpaperProvider />
          <LayoutShell>{children}</LayoutShell>
          {/* <AskAura /> */}
          <GoalsReminderProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
