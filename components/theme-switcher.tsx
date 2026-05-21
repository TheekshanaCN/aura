"use client"

import { useState } from "react"
import { useTheme, Theme } from "./theme-provider"

const themes: { id: Theme; label: string; emoji: string; colors: string[] }[] = [
    {
        id: "morning",
        label: "Light Glass",
        emoji: "☀️",
        colors: ["#fbfbfd", "#0071e3", "#ff9500"],
    },
    {
        id: "evening",
        label: "Purple Glass",
        emoji: "🌙",
        colors: ["#0d0620", "#ff9500", "#d946ef"],
    },
    {
        id: "night",
        label: "Midnight Glass",
        emoji: "✨",
        colors: ["#0f1419", "#0a84ff", "#30b0c0"],
    },
]

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const [open, setOpen] = useState(false)

    const current = themes.find((t) => t.id === theme) ?? themes[2]

    return (
        <div
            style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "10px",
            }}
        >
            {/* Theme cards panel */}
            {open && (
                <div
                    style={{
                        background: "var(--surface-glass)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "20px",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px var(--border-glass)",
                        minWidth: "200px",
                        animation: "themePanelIn 0.2s ease",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                    }}
                >
                    <p
                        style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "var(--text-muted)",
                            marginBottom: "4px",
                            paddingLeft: "4px",
                        }}
                    >
                        Choose Theme
                    </p>
                    {themes.map((t) => {
                        const isActive = t.id === theme
                        return (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id)
                                    setOpen(false)
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 14px",
                                    borderRadius: "12px",
                                    border: isActive
                                        ? "1.5px solid var(--accent-color)"
                                        : "1.5px solid transparent",
                                    background: isActive ? "var(--accent-glow)" : "var(--surface-hover)",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    width: "100%",
                                }}
                            >
                                {/* Color swatch strip */}
                                <div style={{ display: "flex", gap: "3px" }}>
                                    {t.colors.map((c, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: "10px",
                                                height: "20px",
                                                borderRadius: "4px",
                                                background: c,
                                                flexShrink: 0,
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ textAlign: "left", flex: 1 }}>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            color: isActive ? "var(--accent-color)" : "var(--text-primary)",
                                        }}
                                    >
                                        {t.emoji} {t.label}
                                    </div>
                                </div>
                                {isActive && (
                                    <div
                                        style={{
                                            width: "6px",
                                            height: "6px",
                                            borderRadius: "50%",
                                            background: "var(--accent-color)",
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Main toggle button */}
            <button
                onClick={() => setOpen((o) => !o)}
                title="Switch Theme"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "50px",
                    border: "1.5px solid var(--border-glass)",
                    background: "var(--surface-glass)",
                    cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px var(--border-glass)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-hover)"
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--accent-color)"
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface)"
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px var(--border-c)"
                }}
            >
                <span style={{ fontSize: "16px" }}>{current.emoji}</span>
                <span style={{ color: "var(--text-primary)" }}>{current.label}</span>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{
                        color: "var(--text-muted)",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                    }}
                >
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <style>{`
        @keyframes themePanelIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
        </div>
    )
}
