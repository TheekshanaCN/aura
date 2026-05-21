"use client"

import { useEffect, useState } from "react"
import { loadWallpaper } from "@/lib/wallpaper-store"

export function WallpaperProvider() {
  const [wallpaper, setWallpaper] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  async function sync() {
    try { setWallpaper(await loadWallpaper()) } catch { setWallpaper(null) }
  }

  useEffect(() => {
    setMounted(true)
    sync()
    const onCustom = () => sync()
    window.addEventListener("aura_wallpaper_updated", onCustom)
    return () => window.removeEventListener("aura_wallpaper_updated", onCustom)
  }, [])

  return (
    <>
      <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",
        background:"linear-gradient(135deg,#0f1419 0%,#1a0d2a 50%,#0f1419 100%)",
        zIndex:-3,pointerEvents:"none" }} />

      {mounted && wallpaper && (
        <img src={wallpaper} alt="" style={{
          position:"fixed",top:0,left:0,width:"100%",height:"100%",
          objectFit:"cover",zIndex:-2,opacity:0.5,pointerEvents:"none",
          filter:"brightness(0.6) blur(3px) saturate(0.8)",
        }} />
      )}

      <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",
        background: mounted && wallpaper
          ? "linear-gradient(135deg,rgba(15,20,25,0.75) 0%,rgba(26,13,42,0.65) 100%)"
          : "linear-gradient(135deg,rgba(15,20,25,0.3) 0%,rgba(26,13,42,0.2) 100%)",
        zIndex:-1,pointerEvents:"none" }} />
    </>
  )
}
