"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CheckCircle2, XCircle, PlayCircle, StopCircle, X, Bell } from "lucide-react"

type Status = "todo"|"processing"|"done"|"cancelled"
type GoalType = "binary"|"measurable"
type RepeatType = "none"|"daily"|"weekly"
type CheckInType = "start"|"end"

interface GoalUI {
  id: number; title: string; description: string; status: Status
  dueDate: string; startTime: string; endTime: string; category: string
  priority: "low"|"medium"|"high"; progress: number; goalType: GoalType
  targetValue?: number; targetUnit?: string; currentValue?: number
  repeat: RepeatType; reminderBefore: number
  startChecked: boolean; endChecked: boolean; endCheckedAt?: string
}

interface ActiveCheckIn { goalId: number; type: CheckInType }

const STORAGE_KEY = "aura_goals"
const TRIGGERED_KEY = "aura_goals_triggered"
const WINDOW_MINS = 60

const categoryColors: Record<string,string> = {
  Career:"#6366f1",Learning:"#22d3ee",Personal:"#f97316",Health:"#22c55e",Finance:"#eab308",
}

function loadGoals(): GoalUI[] {
  if(typeof window==="undefined") return []
  try { const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):[] } catch { return [] }
}
function saveGoals(g: GoalUI[]) { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(g)) } catch {} }
function loadTriggered(): Set<string> {
  try { const r=localStorage.getItem(TRIGGERED_KEY); return r?new Set(JSON.parse(r)):new Set() } catch { return new Set() }
}
function saveTriggered(s: Set<string>) { try { localStorage.setItem(TRIGGERED_KEY,JSON.stringify([...s])) } catch {} }
function toMin(t: string) { const [h,m]=t.split(":").map(Number); return h*60+m }
function nowMin() { const n=new Date(); return n.getHours()*60+n.getMinutes() }
function todayKey() { return new Date().toISOString().split("T")[0] }
function fmt(t: string) {
  if(!t) return ""; const [h,m]=t.split(":").map(Number)
  return `${h%12||12}:${m.toString().padStart(2,"0")} ${h>=12?"PM":"AM"}`
}
async function askPermission() {
  if(!("Notification" in window)) return false
  if(Notification.permission==="granted") return true
  if(Notification.permission==="denied") return false
  return (await Notification.requestPermission())==="granted"
}
function sendNotif(title: string, body: string, tag: string) {
  if(!("Notification" in window)||Notification.permission!=="granted") return
  const n=new Notification(title,{body,tag,icon:"/favicon.ico",requireInteraction:true})
  n.onclick=()=>{ window.focus(); n.close() }
}

function CheckInModal({ ci, goals, onResponse, onDismiss }: {
  ci: ActiveCheckIn; goals: GoalUI[]
  onResponse:(id:number,t:CheckInType,ans:boolean)=>void; onDismiss:()=>void
}) {
  const goal=goals.find(g=>g.id===ci.goalId)
  if(!goal) return null
  const isStart=ci.type==="start"
  const accent=isStart?"#22c55e":"#6366f1"
  const cat=categoryColors[goal.category]??"#6366f1"
  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)"}}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{background:"var(--surface-card)",border:"1px solid var(--border-glass)"}}>
        <div className="h-1 w-full" style={{background:accent}}/>
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl flex items-center justify-center"
                style={{background:isStart?"rgba(34,197,94,0.12)":"rgba(99,102,241,0.12)"}}>
                {isStart?<PlayCircle className="size-6" style={{color:accent}}/>
                        :<CheckCircle2 className="size-6" style={{color:accent}}/>}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{color:accent}}>
                  {isStart?"⏰ Start Check-in":"🏁 Completion Check-in"}
                </p>
                <p className="text-xs mt-0.5" style={{color:"var(--text-muted)"}}>
                  Scheduled at {isStart?fmt(goal.startTime):fmt(goal.endTime)}
                </p>
              </div>
            </div>
            <button onClick={onDismiss} className="size-8 rounded-xl flex items-center justify-center"
              style={{background:"var(--surface)",color:"var(--text-muted)"}}>
              <X className="size-4"/>
            </button>
          </div>

          <div className="rounded-2xl p-4 flex flex-col gap-2"
            style={{background:"var(--surface)",border:"1px solid var(--border-c)"}}>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit"
              style={{background:`${cat}18`,color:cat}}>{goal.category}</span>
            <p className="text-sm font-bold leading-snug" style={{color:"var(--text-primary)"}}>{goal.title}</p>
            {goal.goalType==="measurable"&&goal.targetValue&&(
              <p className="text-xs" style={{color:"var(--text-muted)"}}>
                Target: {goal.currentValue??0}/{goal.targetValue} {goal.targetUnit}
              </p>
            )}
            <div className="flex items-center gap-3 text-[11px]" style={{color:"var(--text-muted)"}}>
              <span className="flex items-center gap-1"><PlayCircle className="size-3" style={{color:"#22c55e"}}/>{fmt(goal.startTime)}</span>
              <span>→</span>
              <span className="flex items-center gap-1"><StopCircle className="size-3" style={{color:"#ef4444"}}/>{fmt(goal.endTime)}</span>
            </div>
          </div>

          <p className="text-base font-bold text-center" style={{color:"var(--text-primary)"}}>
            {isStart?"Did you start this goal?":"Did you complete it successfully?"}
          </p>

          <div className="flex gap-3">
            <button onClick={()=>onResponse(goal.id,ci.type,false)}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{background:"rgba(239,68,68,0.12)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.3)"}}>
              <XCircle className="size-4"/>{isStart?"Not Yet":"Didn't Finish"}
            </button>
            <button onClick={()=>onResponse(goal.id,ci.type,true)}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{background:isStart?"rgba(34,197,94,0.15)":"rgba(99,102,241,0.15)",color:accent,border:`1px solid ${accent}40`}}>
              <CheckCircle2 className="size-4"/>{isStart?"Yes, Started!":"Completed! 🎉"}
            </button>
          </div>
          <button onClick={onDismiss} className="text-xs text-center" style={{color:"var(--text-muted)"}}>Remind me later</button>
        </div>
      </div>
    </div>
  )
}

function NotifBanner({ onAllow, onDismiss }: { onAllow:()=>void; onDismiss:()=>void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9998] w-80 rounded-2xl p-4 shadow-2xl flex flex-col gap-3"
      style={{background:"var(--surface-card)",border:"1px solid var(--border-glass)"}}>
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{background:"rgba(99,102,241,0.15)"}}>
          <Bell className="size-4" style={{color:"var(--accent-color)"}}/>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{color:"var(--text-primary)"}}>Enable Notifications</p>
          <p className="text-xs mt-0.5" style={{color:"var(--text-muted)"}}>
            Get browser alerts for goal check-ins even when on other pages.
          </p>
        </div>
        <button onClick={onDismiss} style={{color:"var(--text-muted)"}}><X className="size-4"/></button>
      </div>
      <div className="flex gap-2">
        <button onClick={onDismiss} className="flex-1 py-2 rounded-xl text-xs font-semibold"
          style={{background:"var(--surface)",color:"var(--text-muted)",border:"1px solid var(--border-c)"}}>
          Maybe later
        </button>
        <button onClick={onAllow} className="flex-1 py-2 rounded-xl text-xs font-bold"
          style={{background:"var(--accent-color)",color:"var(--accent-text)"}}>
          Allow
        </button>
      </div>
    </div>
  )
}

export function GoalsReminderProvider() {
  const [goals, setGoals] = useState<GoalUI[]>([])
  const [activeCI, setActiveCI] = useState<ActiveCheckIn|null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const triggered = useRef<Set<string>>(new Set())
  const notifGranted = useRef(false)

  useEffect(() => {
    const g=loadGoals(); setGoals(g); triggered.current=loadTriggered()
    if("Notification" in window) {
      notifGranted.current=Notification.permission==="granted"
      const dismissed=localStorage.getItem("aura_notif_banner_dismissed")==="true"
      if(g.length>0&&Notification.permission==="default"&&!dismissed) {
        setTimeout(()=>setShowBanner(true),3000)
      }
    }
  },[])

  useEffect(()=>{
    const onStorage=(e: StorageEvent)=>{ if(e.key===STORAGE_KEY) setGoals(loadGoals()) }
    window.addEventListener("storage",onStorage)
    const poll=setInterval(()=>setGoals(loadGoals()),15_000)
    return ()=>{ window.removeEventListener("storage",onStorage); clearInterval(poll) }
  },[])

  useEffect(()=>{
    if(goals.length===0) return
    const tick=()=>{
      if(activeCI) return
      const now=nowMin(), day=todayKey()
      for(const g of goals) {
        if(g.status==="done"||g.status==="cancelled") continue
        const sm=toMin(g.startTime), em=toMin(g.endTime)

        // reminder before start
        const rk=`${g.id}-reminder-${day}`
        const rm=sm-g.reminderBefore
        if(now>=rm&&now<sm&&!triggered.current.has(rk)) {
          triggered.current.add(rk); saveTriggered(triggered.current)
          if(notifGranted.current) sendNotif("Upcoming Goal",`"${g.title}" starts in ${g.reminderBefore} min`,rk)
        }

        // start check-in
        const sk=`${g.id}-start-${day}`
        if(now>=sm&&now<=sm+WINDOW_MINS&&!g.startChecked&&!triggered.current.has(sk)) {
          triggered.current.add(sk); saveTriggered(triggered.current)
          if(notifGranted.current) sendNotif("⏰ Start Check-in",`Did you start "${g.title}"?`,sk)
          setActiveCI({goalId:g.id,type:"start"}); return
        }

        // end check-in
        const ek=`${g.id}-end-${day}`
        if(now>=em&&now<=em+WINDOW_MINS&&!g.endChecked&&!triggered.current.has(ek)) {
          triggered.current.add(ek); saveTriggered(triggered.current)
          if(notifGranted.current) sendNotif("🏁 Completion Check-in",`Did you complete "${g.title}"?`,ek)
          setActiveCI({goalId:g.id,type:"end"}); return
        }
      }
    }
    tick()
    const iv=setInterval(tick,30_000)
    return ()=>clearInterval(iv)
  },[goals,activeCI])

  const handleResponse=useCallback((goalId:number,type:CheckInType,answered:boolean)=>{
    const updated=loadGoals().map(g=>{
      if(g.id!==goalId) return g
      if(type==="start") return {...g,startChecked:true,status:(answered?"processing":g.status) as Status}
      return {...g,endChecked:true,status:(answered?"done":g.status) as Status,
        progress:answered?100:g.progress,endCheckedAt:new Date().toISOString()}
    })
    saveGoals(updated); setGoals(updated); setActiveCI(null)
  },[])

  async function handleAllow() {
    setShowBanner(false); localStorage.setItem("aura_notif_banner_dismissed","true")
    notifGranted.current=await askPermission()
  }

  return (
    <>
      {activeCI&&<CheckInModal ci={activeCI} goals={goals} onResponse={handleResponse} onDismiss={()=>setActiveCI(null)}/>}
      {showBanner&&<NotifBanner onAllow={handleAllow} onDismiss={()=>{ setShowBanner(false); localStorage.setItem("aura_notif_banner_dismissed","true") }}/>}
    </>
  )
}
