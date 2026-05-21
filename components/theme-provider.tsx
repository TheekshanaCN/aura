"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "night" | "morning" | "evening"

interface ThemeContextValue {
    theme: Theme
    setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "night",
    setTheme: () => { },
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("night")

    // Hydrate from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("aura-theme") as Theme | null
        if (stored && ["night", "morning", "evening"].includes(stored)) {
            setThemeState(stored)
            document.documentElement.setAttribute("data-theme", stored)
        } else {
            document.documentElement.setAttribute("data-theme", "night")
        }
    }, [])

    const setTheme = (t: Theme) => {
        setThemeState(t)
        localStorage.setItem("aura-theme", t)
        document.documentElement.setAttribute("data-theme", t)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}
