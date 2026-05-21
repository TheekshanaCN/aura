"use client"

import { useState, useEffect } from "react"
import { Clock, ChevronRight, PlayCircle } from "lucide-react"

interface GoalUI {
  id: number; title: string; startTime: string; endTime: string
  status: string; category: string; startChecked: boolean; endChecked: boolean
}

const STORAGE_KEY = "aura_goals"
const categoryColors: Record<string, string> = {
  Career:"#6366f1", Learning:"#22d3ee", Personal:"#f97316", Health:"#22c55e", Finance:"#eab308",
}

function toMin(hhmm: string) { const [h,m]=hhmm.split(":").map(Number); return h*60+m }
function nowMin() { const n=new Date(); return n.getHours()*60+n.getMinutes() }
function fmt(hhmm: string) {
  if(!hhmm) return ""; const [h,m]=hhmm.split(":").map(Number)
  return `${h%12||12}:${m.toString().padStart(2,"0")} ${h>=12?"PM":"AM"}`
}
function countdown(hhmm: string) {
  const [h,m]=hhmm.split(":").map(Number)
  const t=new Date(); t.setHours(h,m,0,0)
  const s=Math.max(0,Math.floor((t.getTime()-Date.now())/1000))
  const hh=Math.floor(s/3600), mm=Math.floor((s%3600)/60), ss=s%60
  if(hh>0) return `${hh}h ${mm.toString().padStart(2,"0")}m`
  return `${mm.toString().padStart(2,"0")}:${ss.toString().padStart(2,"0")}`
}

export function CurrentGoalBadge() {
  const [goals, setGoals] = useState<GoalUI[]>([])
  const [, setTick] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    function load() {
      try { const r=localStorage.getItem(STORAGE_KEY); setGoals(r?JSON.parse(r):[]) } catch { setGoals([]) }
    }
    load()
    const poll=setInterval(load,15_000)
    return ()=>clearInterval(poll)
  }, [])

  useEffect(()=>{ const t=setInterval(()=>setTick(p=>p+1),1000); return ()=>clearInterval(t) },[])

  const now=nowMin()
  const active=goals.find(g=>{
    if(g.status==="done"||g.status==="cancelled") return false
    return now>=toMin(g.startTime)&&now<=toMin(g.endTime)
  })
  const upcoming=!active?goals.filter(g=>{
    if(g.status==="done"||g.status==="cancelled") return false
    return toMin(g.startTime)>now
  }).sort((a,b)=>toMin(a.startTime)-toMin(b.startTime))[0]:undefined

  const goal=active||upcoming
  if(!goal) return null

  const isActive=!!active
  const accent=isActive?"#22c55e":"var(--accent-color)"
  const catColor=categoryColors[goal.category]??"#6366f1"
  const cd=isActive?countdown(goal.endTime):countdown(goal.startTime)

  if(collapsed) return (
    <button onClick={()=>setCollapsed(false)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{background:isActive?"rgba(34,197,94,0.12)":"rgba(99,102,241,0.12)",color:accent,border:`1px solid ${accent}30`}}>
      {isActive?<span className="size-1.5 rounded-full animate-pulse" style={{background:accent}}/>:<Clock className="size-3"/>}
      <span>{cd}</span>
      <ChevronRight className="size-3 rotate-90"/>
    </button>
  )

  return (
    <button onClick={()=>setCollapsed(true)}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all group"
      style={{background:isActive?"rgba(34,197,94,0.08)":"rgba(99,102,241,0.08)",border:`1px solid ${accent}25`,maxWidth:"340px"}}>

      <div className="flex-shrink-0">
        {isActive?(
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{background:"#22c55e"}}/>
            <span className="relative inline-flex rounded-full size-2" style={{background:"#22c55e"}}/>
          </span>
        ):<Clock className="size-3.5" style={{color:"var(--accent-color)"}}/>}
      </div>

      <span className="text-[10px] font-bold uppercase tracking-widest flex-shrink-0" style={{color:accent}}>
        {isActive?"NOW":"NEXT"}
      </span>

      <div className="w-px h-3 flex-shrink-0" style={{background:"var(--border-c)"}}/>

      <span className="text-xs font-semibold truncate" style={{color:"var(--text-primary)",maxWidth:"120px"}}>
        {goal.title}
      </span>

      <div className="size-1.5 rounded-full flex-shrink-0" style={{background:catColor}}/>
      <div className="w-px h-3 flex-shrink-0" style={{background:"var(--border-c)"}}/>

      <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{color:accent}}>{cd}</span>
      <span className="text-[9px] flex-shrink-0" style={{color:"var(--text-muted)"}}>{isActive?"left":"away"}</span>
      <ChevronRight className="size-3 flex-shrink-0 opacity-0 group-hover:opacity-60 -rotate-90" style={{color:"var(--text-muted)"}}/>
    </button>
  )
}
