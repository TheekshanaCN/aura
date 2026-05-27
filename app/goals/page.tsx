"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus, Bell, Target,
  Kanban, List, Calendar, Clock, CheckCircle2, Circle, Loader2,
  XCircle, ChevronRight, Flag, TrendingUp, BarChart3, X,
  PlayCircle, StopCircle, AlarmClock, Repeat, Hash, ToggleLeft,
  ChevronDown, Pencil, Trash2, GitCommitHorizontal,
} from "lucide-react"
import { logHistory } from "@/lib/history"

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
interface CheckInState { visible: boolean; goalId: number|null; type: CheckInType }
interface GoalFormState {
  title: string; description: string; category: string; priority: GoalUI["priority"]
  dueDate: string; startTime: string; endTime: string; goalType: GoalType
  targetValue: string; targetUnit: string; repeat: RepeatType; reminderBefore: string
}

const STORAGE_KEY = "aura_goals"
const TRIGGERED_KEY = "aura_goals_triggered"
const CHECK_IN_WINDOW = 60

function loadGoals(): GoalUI[] {
  if (typeof window === "undefined") return []
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function saveGoals(g: GoalUI[]) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(g)) } catch {} }
function loadTriggered(): Set<string> {
  try { const r = localStorage.getItem(TRIGGERED_KEY); return r ? new Set(JSON.parse(r)) : new Set() } catch { return new Set() }
}
function saveTriggered(s: Set<string>) { try { localStorage.setItem(TRIGGERED_KEY, JSON.stringify([...s])) } catch {} }

const today = new Date().toISOString().split("T")[0]
const CATEGORIES = ["Career", "Learning", "Personal", "Health", "Finance"]
const STATUSES: Status[] = ["todo", "processing", "done", "cancelled"]

const statusConfig: Record<Status, { label: string; Icon: React.ElementType; color: string; bg: string; border: string }> = {
  todo:       { label: "Todo",        Icon: Circle,       color: "#8b99b4", bg: "rgba(139,153,180,0.1)",  border: "rgba(139,153,180,0.25)" },
  processing: { label: "In Progress", Icon: Loader2,      color: "#6366f1", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.3)" },
  done:       { label: "Done",        Icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.3)" },
  cancelled:  { label: "Cancelled",   Icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)" },
}
const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "#f97316", label: "High" }, medium: { color: "#eab308", label: "Medium" }, low: { color: "#22c55e", label: "Low" },
}
const categoryColors: Record<string, string> = {
  Career: "#6366f1", Learning: "#22d3ee", Personal: "#f97316", Health: "#22c55e", Finance: "#eab308",
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
function isOverdue(d: string, s: Status) { if (s === "done" || s === "cancelled") return false; return new Date(d) < new Date() }
function fmtTime(t: string) {
  if (!t) return ""
  const [h, m] = t.split(":").map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`
}
function toMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m }
function nowMin() { const n = new Date(); return n.getHours() * 60 + n.getMinutes() }
function todayKey() { return new Date().toISOString().split("T")[0] }

function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status] || statusConfig.todo
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <cfg.Icon className={`size-3 ${status === "processing" ? "animate-spin" : ""}`} />{cfg.label}
    </span>
  )
}

/* ── GOAL FORM MODAL ── */
function GoalFormModal({ open, onClose, onSave, editGoal }: {
  open: boolean; onClose: () => void; onSave: (g: GoalUI) => void; editGoal?: GoalUI | null
}) {
  const isEdit = !!editGoal
  const [step, setStep] = useState(1)
  const blank: GoalFormState = {
    title: "", description: "", category: "Career", priority: "medium",
    dueDate: today, startTime: "09:00", endTime: "10:00", goalType: "binary" as GoalType,
    targetValue: "", targetUnit: "", repeat: "none" as RepeatType, reminderBefore: "10",
  }
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (editGoal) {
        setForm({
          title: editGoal.title, description: editGoal.description, category: editGoal.category,
          priority: editGoal.priority, dueDate: editGoal.dueDate, startTime: editGoal.startTime,
          endTime: editGoal.endTime, goalType: editGoal.goalType,
          targetValue: editGoal.targetValue?.toString() ?? "", targetUnit: editGoal.targetUnit ?? "",
          repeat: editGoal.repeat, reminderBefore: editGoal.reminderBefore.toString(),
        })
      } else { setForm(blank) }
      setStep(1); setErrors({})
    }
  }, [open, editGoal])

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); setErrors(p => { const n = { ...p }; delete n[k]; return n }) }

  function v1() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Required"
    if (!form.dueDate) e.dueDate = "Required"
    return e
  }
  function v2() {
    const e: Record<string, string> = {}
    if (!form.startTime) e.startTime = "Required"
    if (!form.endTime) e.endTime = "Required"
    if (form.startTime >= form.endTime) e.endTime = "Must be after start time"
    if (form.goalType === "measurable") {
      if (!form.targetValue || isNaN(Number(form.targetValue))) e.targetValue = "Enter a number"
      if (!form.targetUnit.trim()) e.targetUnit = "Enter a unit"
    }
    return e
  }

  function handleNext() { const e = v1(); if (Object.keys(e).length) { setErrors(e); return }; setStep(2) }
  function handleSubmit() {
    const e = v2(); if (Object.keys(e).length) { setErrors(e); return }
    onSave({
      id: editGoal?.id ?? Date.now(), title: form.title.trim(),
      description: form.description.trim() || "No description.",
      status: editGoal?.status ?? "todo", dueDate: form.dueDate,
      startTime: form.startTime, endTime: form.endTime, category: form.category,
      priority: form.priority, progress: editGoal?.progress ?? 0, goalType: form.goalType,
      targetValue: form.goalType === "measurable" ? Number(form.targetValue) : undefined,
      targetUnit: form.goalType === "measurable" ? form.targetUnit : undefined,
      currentValue: editGoal?.currentValue ?? 0, repeat: form.repeat,
      reminderBefore: Number(form.reminderBefore),
      startChecked: editGoal ? (editGoal.startTime !== form.startTime ? false : editGoal.startChecked) : false,
      endChecked: editGoal ? (editGoal.endTime !== form.endTime ? false : editGoal.endChecked) : false,
    })
    onClose()
  }

  if (!open) return null
  const accent = isEdit ? "#eab308" : "var(--accent-color)"
  const catColor = categoryColors[form.category] ?? "#6366f1"
  const timeDiff = (() => {
    if (!form.startTime || !form.endTime || form.startTime >= form.endTime) return null
    const d = toMin(form.endTime) - toMin(form.startTime)
    return d >= 60 ? `${Math.floor(d / 60)}h${d % 60 > 0 ? ` ${d % 60}m` : ""}` : `${d}m`
  })()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl flex flex-col overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--border-glass)", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--border-c)" }}>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-2xl flex items-center justify-center"
              style={{ background: isEdit ? "rgba(234,179,8,0.15)" : "rgba(99,102,241,0.15)" }}>
              {isEdit ? <Pencil className="size-5" style={{ color: accent }} /> : <Target className="size-5" style={{ color: accent }} />}
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {isEdit ? "Edit Goal" : step === 1 ? "New Goal" : "Schedule & Settings"}
              </h2>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Step {step} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="size-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--surface)", color: "var(--text-muted)" }}><X className="size-4" /></button>
        </div>

        <div className="flex gap-2 px-6 pt-4">
          {[1, 2].map(s => <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: s <= step ? accent : "var(--border-c)" }} />)}
        </div>

        <div className="overflow-y-auto flex-1">
          {step === 1 && (
            <div className="flex flex-col gap-4 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Goal Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Deep work session…"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface)", border: `1px solid ${errors.title ? "#ef4444" : "var(--border-c)"}`, color: "var(--text-primary)" }} />
                {errors.title && <p className="text-[11px]" style={{ color: "#ef4444" }}>{errors.title}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Description <span className="opacity-50">(optional)</span></label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="What does completing this look like?" rows={2}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-c)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Category</label>
                  <div className="relative">
                    <select value={form.category} onChange={e => set("category", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none pr-8"
                      style={{ background: "var(--surface)", border: "1px solid var(--border-c)", color: "var(--text-primary)" }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full" style={{ background: catColor }} />
                    <span className="text-[10px]" style={{ color: catColor }}>{form.category}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Priority</label>
                  <div className="flex flex-col gap-1">
                    {(["high", "medium", "low"] as const).map(p => {
                      const cfg = priorityConfig[p]
                      return (
                        <button key={p} onClick={() => set("priority", p)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: form.priority === p ? `${cfg.color}18` : "var(--surface)", color: form.priority === p ? cfg.color : "var(--text-muted)", border: `1px solid ${form.priority === p ? cfg.color + "40" : "var(--border-c)"}` }}>
                          <Flag className="size-3" />{cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Due Date <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface)", border: `1px solid ${errors.dueDate ? "#ef4444" : "var(--border-c)"}`, color: "var(--text-primary)" }} />
                {errors.dueDate && <p className="text-[11px]" style={{ color: "#ef4444" }}>{errors.dueDate}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Start Time", key: "startTime", color: "#22c55e", Icon: PlayCircle, err: "startTime" },
                  { label: "End Time",   key: "endTime",   color: "#ef4444", Icon: StopCircle, err: "endTime"   },
                ].map(({ label, key, color, Icon, err }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <Icon className="size-3.5" style={{ color }} />{label}
                    </label>
                    <input type="time" value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--surface)", border: `1px solid ${(errors as any)[err] ? "#ef4444" : "var(--border-c)"}`, color: "var(--text-primary)" }} />
                    {(errors as any)[err] && <p className="text-[11px]" style={{ color: "#ef4444" }}>{(errors as any)[err]}</p>}
                  </div>
                ))}
              </div>
              {timeDiff && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "var(--accent-color)" }}>
                  <AlarmClock className="size-3.5" />
                  {fmtTime(form.startTime)} → {fmtTime(form.endTime)}
                  <span className="ml-auto opacity-70">{timeDiff}</span>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Goal Type</label>
                <div className="flex gap-2">
                  {([
                    { val: "binary" as const, Icon: ToggleLeft, label: "Binary", sub: "Done or not done" },
                    { val: "measurable" as const, Icon: Hash, label: "Measurable", sub: "Track a number" },
                  ]).map(({ val, Icon, label, sub }) => (
                    <button key={val} onClick={() => set("goalType", val)}
                      className="flex-1 flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{ background: form.goalType === val ? "rgba(99,102,241,0.12)" : "var(--surface)", border: `1px solid ${form.goalType === val ? "rgba(99,102,241,0.4)" : "var(--border-c)"}`, color: form.goalType === val ? "var(--accent-color)" : "var(--text-muted)" }}>
                      <div className="flex items-center gap-1.5"><Icon className="size-3.5" /><span className="text-xs font-bold">{label}</span></div>
                      <span className="text-[10px] opacity-70">{sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              {form.goalType === "measurable" && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Target Value", key: "targetValue", type: "number", placeholder: "e.g. 10", err: "targetValue" },
                    { label: "Unit",         key: "targetUnit",  type: "text",   placeholder: "pages, km…", err: "targetUnit" },
                  ].map(({ label, key, type, placeholder, err }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{label}</label>
                      <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--surface)", border: `1px solid ${(errors as any)[err] ? "#ef4444" : "var(--border-c)"}`, color: "var(--text-primary)" }} />
                      {(errors as any)[err] && <p className="text-[11px]" style={{ color: "#ef4444" }}>{(errors as any)[err]}</p>}
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Repeat", key: "repeat", Icon: Repeat, opts: [{ v: "none", l: "One-time" }, { v: "daily", l: "Daily" }, { v: "weekly", l: "Weekly" }] },
                  { label: "Remind before", key: "reminderBefore", Icon: Bell, opts: [{ v: "5", l: "5 minutes" }, { v: "10", l: "10 minutes" }, { v: "15", l: "15 minutes" }, { v: "30", l: "30 minutes" }] },
                ].map(({ label, key, Icon, opts }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <Icon className="size-3.5" />{label}
                    </label>
                    <div className="relative">
                      <select value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none pr-8"
                        style={{ background: "var(--surface)", border: "1px solid var(--border-c)", color: "var(--text-primary)" }}>
                        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border-c)" }}>
          {step === 2 && (
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>← Back</button>
          )}
          {step === 1
            ? <button onClick={handleNext} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: accent, color: isEdit ? "#000" : "var(--accent-text)" }}>Continue →</button>
            : <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: accent, color: isEdit ? "#000" : "var(--accent-text)" }}>
                {isEdit ? "Save Changes ✓" : "Add Goal ✓"}
              </button>
          }
        </div>
      </div>
    </div>
  )
}

/* ── CHECK-IN MODAL ── */
function GoalCheckInModal({ modal, goals, onResponse, onDismiss }: {
  modal: CheckInState; goals: GoalUI[]
  onResponse: (id: number, t: CheckInType, ans: boolean) => void; onDismiss: () => void
}) {
  if (!modal.visible || modal.goalId === null) return null
  const goal = goals.find(g => g.id === modal.goalId); if (!goal) return null
  const isStart = modal.type === "start"
  const accent = isStart ? "#22c55e" : "var(--accent-color)"
  const cat = categoryColors[goal.category] ?? "#6366f1"
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface-card)", border: "1px solid var(--border-glass)" }}>
        <div className="h-1 w-full" style={{ background: accent }} />
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl flex items-center justify-center"
              style={{ background: isStart ? "rgba(34,197,94,0.12)" : "rgba(99,102,241,0.12)" }}>
              {isStart ? <PlayCircle className="size-6" style={{ color: accent }} /> : <CheckCircle2 className="size-6" style={{ color: accent }} />}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>
                {isStart ? "⏰ Start Check-in" : "🏁 Completion Check-in"}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Scheduled at {isStart ? fmtTime(goal.startTime) : fmtTime(goal.endTime)}
              </p>
            </div>
          </div>
          <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit"
              style={{ background: `${cat}18`, color: cat }}>{goal.category}</span>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{goal.title}</p>
            <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1"><PlayCircle className="size-3" style={{ color: "#22c55e" }} />{fmtTime(goal.startTime)}</span>
              <span>→</span>
              <span className="flex items-center gap-1"><StopCircle className="size-3" style={{ color: "#ef4444" }} />{fmtTime(goal.endTime)}</span>
            </div>
          </div>
          <p className="text-base font-bold text-center" style={{ color: "var(--text-primary)" }}>
            {isStart ? "Did you start this goal?" : "Did you complete it successfully?"}
          </p>
          <div className="flex gap-3">
            <button onClick={() => onResponse(goal.id, modal.type, false)}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
              <XCircle className="size-4" />{isStart ? "Not Yet" : "Didn't Finish"}
            </button>
            <button onClick={() => onResponse(goal.id, modal.type, true)}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: isStart ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.15)", color: accent, border: `1px solid ${accent}40` }}>
              <CheckCircle2 className="size-4" />{isStart ? "Yes, Started!" : "Completed! 🎉"}
            </button>
          </div>
          <button onClick={onDismiss} className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Remind me later</button>
        </div>
      </div>
    </div>
  )
}

/* ── KANBAN CARD ── */
function KanbanCard({ goal, onStatusChange, onEdit, onDelete }: {
  goal: GoalUI; onStatusChange: (id: number, s: Status) => void
  onEdit: (g: GoalUI) => void; onDelete: (id: number) => void
}) {
  const overdue = isOverdue(goal.dueDate, goal.status)
  const catColor = categoryColors[goal.category] ?? "#6366f1"
  const pri = priorityConfig[goal.priority]
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 group transition-all duration-200"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border-c)" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-color)" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-c)" }}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: `${catColor}18`, color: catColor }}>{goal.category}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(goal)} className="size-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}><Pencil className="size-3" /></button>
          <button onClick={() => onDelete(goal.id)} className="size-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}><Trash2 className="size-3" /></button>
          <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: pri.color }}>
            <Flag className="size-3" />{pri.label}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{goal.title}</h3>
      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>{goal.description}</p>
      <div className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
        <PlayCircle className="size-3" style={{ color: "#22c55e" }} />{fmtTime(goal.startTime)}
        <span>→</span>
        <StopCircle className="size-3" style={{ color: "#ef4444" }} />{fmtTime(goal.endTime)}
      </div>
      {goal.status !== "cancelled" && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            <span>{goal.goalType === "measurable" && goal.targetValue ? `${goal.currentValue ?? 0}/${goal.targetValue} ${goal.targetUnit}` : "Progress"}</span>
            <span>{goal.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-c)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${goal.progress}%`, background: goal.status === "done" ? "#22c55e" : "var(--accent-color)" }} />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 text-[10px]">
        {[{ label: "Started", checked: goal.startChecked }, { label: "Done", checked: goal.endChecked }].map(({ label, checked }) => (
          <span key={label} className="flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
            style={{ background: checked ? "rgba(34,197,94,0.1)" : "rgba(139,153,180,0.1)", color: checked ? "#22c55e" : "#8b99b4" }}>
            {checked ? <CheckCircle2 className="size-3" /> : <Circle className="size-3" />}{label}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="size-3" style={{ color: overdue ? "#ef4444" : "var(--text-subtle)" }} />
          <span className="text-[10px] font-medium" style={{ color: overdue ? "#ef4444" : "var(--text-muted)" }}>
            {overdue ? "Overdue · " : ""}{fmtDate(goal.dueDate)}
          </span>
        </div>
        <StatusBadge status={goal.status} />
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {(Object.keys(statusConfig) as Status[]).filter(s => s !== goal.status).map(s => {
          const cfg = statusConfig[s]
          return (
            <button key={s} onClick={() => onStatusChange(goal.id, s)}
              className="flex-1 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</button>
          )
        })}
      </div>
    </div>
  )
}

/* ── LIST ROW ── */
function ListRow({ goal, onStatusChange, onEdit, onDelete }: {
  goal: GoalUI; onStatusChange: (id: number, s: Status) => void
  onEdit: (g: GoalUI) => void; onDelete: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const overdue = isOverdue(goal.dueDate, goal.status)
  const catColor = categoryColors[goal.category] ?? "#6366f1"
  const pri = priorityConfig[goal.priority]
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border-glass)" }}>
      <button className="w-full flex items-center gap-4 px-5 py-4 text-left" onClick={() => setExpanded(p => !p)}
        onMouseEnter={e => { e.currentTarget.parentElement!.style.borderColor = "var(--accent-color)" }}
        onMouseLeave={e => { e.currentTarget.parentElement!.style.borderColor = "var(--border-c)" }}>
        {(() => { const cfg = statusConfig[goal.status] || statusConfig.todo; return <cfg.Icon className={`size-5 flex-shrink-0 ${goal.status === "processing" ? "animate-spin" : ""}`} style={{ color: cfg.color }} /> })()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)", textDecoration: goal.status === "cancelled" ? "line-through" : "none", opacity: goal.status === "cancelled" ? 0.5 : 1 }}>
              {goal.title}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ background: `${catColor}18`, color: catColor }}>{goal.category}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
            <PlayCircle className="size-3" style={{ color: "#22c55e" }} />{fmtTime(goal.startTime)} → {fmtTime(goal.endTime)}
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold flex-shrink-0" style={{ color: pri.color }}>
          <Flag className="size-3" />{pri.label}
        </span>
        <div className="hidden md:flex items-center gap-2 w-28 flex-shrink-0">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-c)" }}>
            <div className="h-full rounded-full" style={{ width: `${goal.status === "cancelled" ? 0 : goal.progress}%`, background: goal.status === "done" ? "#22c55e" : "var(--accent-color)" }} />
          </div>
          <span className="text-[10px] font-semibold w-7 text-right" style={{ color: "var(--text-muted)" }}>
            {goal.status === "cancelled" ? "—" : `${goal.progress}%`}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0" style={{ color: overdue ? "#ef4444" : "var(--text-muted)" }}>
          <Calendar className="size-3.5" /><span className="text-[11px] font-medium">{fmtDate(goal.dueDate)}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(goal)} className="size-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(234,179,8,0.12)", color: "#eab308" }}><Pencil className="size-3.5" /></button>
          <button onClick={() => onDelete(goal.id)} className="size-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}><Trash2 className="size-3.5" /></button>
        </div>
        <div className="flex-shrink-0"><StatusBadge status={goal.status} /></div>
        <ChevronRight className={`size-4 flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} style={{ color: "var(--text-muted)" }} />
      </button>
      {expanded && (
        <div className="px-5 pb-4 flex flex-col gap-3" style={{ borderTop: "1px solid var(--border-c)" }}>
          <p className="text-sm leading-relaxed pt-3" style={{ color: "var(--text-muted)" }}>{goal.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>Check-ins:</span>
            {[{ label: "Started", checked: goal.startChecked }, { label: "Completed", checked: goal.endChecked }].map(({ label, checked }) => (
              <span key={label} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: checked ? "rgba(34,197,94,0.1)" : "rgba(139,153,180,0.1)", color: checked ? "#22c55e" : "#8b99b4" }}>
                {checked ? <CheckCircle2 className="size-3" /> : <Circle className="size-3" />}{label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] font-semibold self-center" style={{ color: "var(--text-muted)" }}>Move to:</span>
            {(Object.keys(statusConfig) as Status[]).filter(s => s !== goal.status).map(s => {
              const cfg = statusConfig[s]
              return (
                <button key={s} onClick={() => onStatusChange(goal.id, s)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  <cfg.Icon className={`size-3 ${s === "processing" ? "animate-spin" : ""}`} />{cfg.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── CONTRIBUTION GRID ── */
function ContributionGrid({ goals }: { goals: GoalUI[] }) {
  const weeks = 15; const days = weeks * 7
  const cells: { date: string; count: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const ds = d.toISOString().split("T")[0]
    const count = goals.filter(g => g.status === "done" && (g.endCheckedAt?.startsWith(ds) || g.dueDate === ds)).length
    cells.push({ date: ds, count })
  }
  const maxCount = Math.max(...cells.map(c => c.count), 1)
  function cellColor(n: number) {
    if (n === 0) return "var(--border-c)"
    const t = n / maxCount
    if (t <= 0.25) return "rgba(99,102,241,0.25)"
    if (t <= 0.5)  return "rgba(99,102,241,0.45)"
    if (t <= 0.75) return "rgba(99,102,241,0.65)"
    return "rgba(99,102,241,0.9)"
  }
  const totalDone = goals.filter(g => g.status === "done").length
  const activeDays = cells.filter(c => c.count > 0).length
  const weekCols: typeof cells[] = []
  for (let w = 0; w < weeks; w++) weekCols.push(cells.slice(w * 7, w * 7 + 7))
  const monthLabels: { label: string; col: number }[] = []
  let lastM = -1
  weekCols.forEach((week, wi) => {
    const m = new Date(week[0].date).getMonth()
    if (m !== lastM) { monthLabels.push({ label: new Date(week[0].date).toLocaleString("en", { month: "short" }), col: wi }); lastM = m }
  })
  return (
    <div className="rounded-3xl p-6 flex flex-col gap-4" style={{ background: "var(--surface-card)", border: "1px solid var(--border-glass)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommitHorizontal className="size-5" style={{ color: "var(--accent-color)" }} />
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Goal Activity</h2>
        </div>
        <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
          <span><span className="font-bold" style={{ color: "var(--text-primary)" }}>{totalDone}</span> completed</span>
          <span><span className="font-bold" style={{ color: "var(--text-primary)" }}>{activeDays}</span> active days</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${weeks * 14}px` }}>
          <div className="flex mb-1" style={{ paddingLeft: "20px" }}>
            {weekCols.map((_, wi) => {
              const lbl = monthLabels.find(m => m.col === wi)
              return <div key={wi} style={{ width: "14px", flexShrink: 0 }}>
                {lbl && <span className="text-[9px] font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{lbl.label}</span>}
              </div>
            })}
          </div>
          <div className="flex gap-0">
            <div className="flex flex-col gap-0.5 mr-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} style={{ height: "11px", width: "14px" }}>
                  {i % 2 === 1 && <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{d}</span>}
                </div>
              ))}
            </div>
            {weekCols.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5" style={{ marginRight: "2px" }}>
                {week.map(cell => (
                  <div key={cell.date} title={`${cell.date}: ${cell.count} completed`}
                    style={{ width: "11px", height: "11px", borderRadius: "2px", background: cellColor(cell.count), flexShrink: 0 }} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
              <div key={i} style={{ width: "11px", height: "11px", borderRadius: "2px", flexShrink: 0, background: v === 0 ? "var(--border-c)" : `rgba(99,102,241,${v * 0.9 + 0.1})` }} />
            ))}
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── SUMMARY ── */
function GoalsSummary({ goals }: { goals: GoalUI[] }) {
  const total = goals.length
  const counts = { todo: 0, processing: 0, done: 0, cancelled: 0 }; goals.forEach(g => counts[g.status]++)
  const active = goals.filter(g => g.status !== "cancelled")
  const avg = active.length ? active.reduce((s, g) => s + g.progress, 0) / active.length : 0
  const rate = total ? Math.round((counts.done / total) * 100) : 0
  const checkedIn = goals.filter(g => g.endChecked).length
  return (
    <div className="rounded-3xl p-6 flex flex-col gap-5" style={{ background: "var(--surface-card)", border: "1px solid var(--border-glass)" }}>
      <div className="flex items-center gap-2">
        <BarChart3 className="size-5" style={{ color: "var(--accent-color)" }} />
        <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Goals Summary</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(statusConfig) as Status[]).map(s => {
          const cfg = statusConfig[s]
          return (
            <div key={s} className="flex flex-col gap-2 rounded-2xl p-4" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <div className="flex items-center justify-between">
                <cfg.Icon className={`size-4 ${s === "processing" ? "animate-spin" : ""}`} style={{ color: cfg.color }} />
                <span className="text-2xl font-extrabold" style={{ color: cfg.color }}>{counts[s]}</span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, Icon: Target, color: "var(--accent-color)", bg: "rgba(99,102,241,0.15)" },
          { label: "Avg Progress", value: `${Math.round(avg)}%`, Icon: TrendingUp, color: "#22c55e", bg: "rgba(34,197,94,0.12)", bar: avg, bc: "#22c55e" },
          { label: "Completion", value: `${rate}%`, Icon: CheckCircle2, color: "var(--accent-color)", bg: "rgba(99,102,241,0.12)", bar: rate, bc: "var(--accent-color)" },
          { label: "Check-ins", value: `${checkedIn}/${total}`, Icon: AlarmClock, color: "#f97316", bg: "rgba(249,115,22,0.12)" },
        ].map(({ label, value, Icon, color, bg, bar, bc }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
            <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="size-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>{value}</p>
              {bar !== undefined && (
                <div className="h-1 rounded-full overflow-hidden mt-1" style={{ background: "var(--border-c)" }}>
                  <div className="h-full rounded-full" style={{ width: `${bar}%`, background: bc }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── MAIN PAGE ── */
export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalUI[]>([])
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all")
  const [selectedDate, setSelectedDate] = useState(today)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalUI | null>(null)
  const [checkIn, setCheckIn] = useState<CheckInState>({ visible: false, goalId: null, type: "start" })
  const triggeredRef = useRef<Set<string>>(new Set())

  useEffect(() => { setGoals(loadGoals()); triggeredRef.current = loadTriggered() }, [])

  useEffect(() => {
    if (goals.length === 0) return
    const tick = () => {
      const now = nowMin(), day = todayKey()
      for (const g of goals) {
        if (g.status === "done" || g.status === "cancelled") continue
        const sm = toMin(g.startTime), em = toMin(g.endTime)
        const sk = `${g.id}-start-${day}`
        if (now >= sm && now <= sm + CHECK_IN_WINDOW && !g.startChecked && !triggeredRef.current.has(sk)) {
          triggeredRef.current.add(sk); saveTriggered(triggeredRef.current)
          setCheckIn({ visible: true, goalId: g.id, type: "start" }); return
        }
        const ek = `${g.id}-end-${day}`
        if (now >= em && now <= em + CHECK_IN_WINDOW && !g.endChecked && !triggeredRef.current.has(ek)) {
          triggeredRef.current.add(ek); saveTriggered(triggeredRef.current)
          setCheckIn({ visible: true, goalId: g.id, type: "end" }); return
        }
      }
    }
    tick(); const iv = setInterval(tick, 30_000); return () => clearInterval(iv)
  }, [goals])

  function mutate(fn: (p: GoalUI[]) => GoalUI[]) { setGoals(p => { const n = fn(p); saveGoals(n); return n }) }

  function handleSaveGoal(goal: GoalUI) {
    if (editingGoal) {
      mutate(p => p.map(g => g.id === goal.id ? goal : g))
      logHistory({ action: "Goal Updated", description: `Updated "${goal.title}"`, category: "goal" })
    } else {
      mutate(p => [goal, ...p])
      logHistory({ action: "Goal Created", description: `Created "${goal.title}" · ${goal.category} · ${goal.priority} priority`, category: "goal" })
    }
    setEditingGoal(null)
  }

  function handleEditGoal(goal: GoalUI) { setEditingGoal(goal); setFormOpen(true) }

  function handleDeleteGoal(id: number) {
    if (!confirm("Delete this goal?")) return
    const goal = goals.find(g => g.id === id)
    mutate(p => p.filter(g => g.id !== id))
    if (goal) logHistory({ action: "Goal Deleted", description: `Deleted "${goal.title}"`, category: "goal" })
  }

  function handleStatusChange(id: number, status: Status) {
    const goal = goals.find(g => g.id === id)
    mutate(p => p.map(g => g.id !== id ? g : { ...g, status, progress: status === "done" ? 100 : g.progress }))
    if (goal) logHistory({ action: "Status Changed", description: `"${goal.title}" → ${statusConfig[status].label}`, category: "goal" })
  }

  function handleCheckInResponse(goalId: number, type: CheckInType, answered: boolean) {
    const goal = goals.find(g => g.id === goalId)
    mutate(p => p.map(g => {
      if (g.id !== goalId) return g
      if (type === "start") return { ...g, startChecked: true, status: answered ? "processing" : g.status }
      return { ...g, endChecked: true, status: answered ? "done" : g.status, progress: answered ? 100 : g.progress, endCheckedAt: new Date().toISOString() }
    }))
    if (goal) {
      const label = type === "start" ? (answered ? "Started" : "Skipped") : (answered ? "Completed" : "Missed")
      logHistory({ action: `Check-in: ${label}`, description: `"${goal.title}" ${type} check-in → ${label}`, category: "checkin" })
    }
    setCheckIn({ visible: false, goalId: null, type: "start" })
  }

  const selDow = new Date(selectedDate).getDay()
  const isToday = selectedDate === today
  const dateFiltered = goals.filter(g => {
    if (g.status === "cancelled") return false
    if (g.dueDate === selectedDate) return true
    if (g.repeat === "daily") return true
    if (g.repeat === "weekly") return new Date(g.dueDate).getDay() === selDow
    if (!isToday && g.endCheckedAt?.startsWith(selectedDate)) return true
    return false
  })
  const filtered = filterStatus === "all" ? dateFiltered : dateFiltered.filter(g => g.status === filterStatus)

  return (
    <>
      <div className="flex flex-col gap-6 p-6 lg:p-8 overflow-auto min-h-full">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                    <Target className="size-5" style={{ color: "var(--accent-color)" }} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>Goals</h1>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Track and manage your personal & professional goals</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="date" value={selectedDate} max={today} onChange={e => setSelectedDate(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                    style={{ background: "var(--surface)", border: `1px solid ${selectedDate !== today ? "var(--accent-color)" : "var(--border-c)"}`, color: selectedDate !== today ? "var(--accent-color)" : "var(--text-primary)" }} />
                  {selectedDate !== today && (
                    <button onClick={() => setSelectedDate(today)} className="px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(99,102,241,0.12)", color: "var(--accent-color)", border: "1px solid rgba(99,102,241,0.3)" }}>Today</button>
                  )}
                  <div className="flex rounded-xl p-1 gap-1" style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
                    {(["kanban", "list"] as const).map(v => (
                      <button key={v} onClick={() => setView(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: view === v ? "var(--accent-color)" : "transparent", color: view === v ? "var(--accent-text)" : "var(--text-muted)" }}>
                        {v === "kanban" ? <Kanban className="size-3.5" /> : <List className="size-3.5" />}
                        {v === "kanban" ? "Kanban" : "List"}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setEditingGoal(null); setFormOpen(true) }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                    style={{ background: "var(--accent-color)", color: "var(--accent-text)" }}>
                    <Plus className="size-4" />Add Goal
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterStatus("all")} className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: filterStatus === "all" ? "var(--accent-color)" : "var(--surface)", color: filterStatus === "all" ? "var(--accent-text)" : "var(--text-muted)", border: `1px solid ${filterStatus === "all" ? "transparent" : "var(--border-c)"}` }}>
                  All ({dateFiltered.length})
                </button>
                {STATUSES.map(s => {
                  const cfg = statusConfig[s]
                  return (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: filterStatus === s ? cfg.bg : "var(--surface)", color: filterStatus === s ? cfg.color : "var(--text-muted)", border: `1px solid ${filterStatus === s ? cfg.border : "var(--border-c)"}` }}>
                      <cfg.Icon className={`size-3 ${s === "processing" ? "animate-spin" : ""}`} />
                      {cfg.label} ({dateFiltered.filter(g => g.status === s).length})
                    </button>
                  )
                })}
              </div>

              {goals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="size-16 rounded-3xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                    <Target className="size-8" style={{ color: "var(--accent-color)" }} />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No goals yet</p>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Click &ldquo;Add Goal&rdquo; to set your first goal</p>
                  </div>
                </div>
              )}

              {view === "kanban" && goals.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {STATUSES.map(s => {
                    const cfg = statusConfig[s]; const cols = filtered.filter(g => g.status === s)
                    return (
                      <div key={s} className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          <div className="flex items-center gap-2">
                            <cfg.Icon className={`size-4 ${s === "processing" ? "animate-spin" : ""}`} style={{ color: cfg.color }} />
                            <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                          </div>
                          <span className="text-xs font-extrabold size-5 rounded-full flex items-center justify-center"
                            style={{ background: cfg.border, color: cfg.color }}>{cols.length}</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {cols.length === 0
                            ? <div className="rounded-2xl p-6 text-center text-xs" style={{ border: `2px dashed ${cfg.border}`, color: "var(--text-muted)" }}>No goals here</div>
                            : cols.map(g => <KanbanCard key={g.id} goal={g} onStatusChange={handleStatusChange} onEdit={handleEditGoal} onDelete={handleDeleteGoal} />)
                          }
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {view === "list" && goals.length > 0 && (
                <div className="flex flex-col gap-3">
                  {filtered.length === 0
                    ? <div className="rounded-2xl p-10 text-center text-sm" style={{ border: "2px dashed var(--border-c)", color: "var(--text-muted)" }}>No goals for this date/filter</div>
                    : filtered.map(g => <ListRow key={g.id} goal={g} onStatusChange={handleStatusChange} onEdit={handleEditGoal} onDelete={handleDeleteGoal} />)
                  }
                </div>
              )}

              {goals.length > 0 && <GoalsSummary goals={goals} />}
              {goals.length > 0 && <ContributionGrid goals={goals} />}
      </div>

      <GoalFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditingGoal(null) }} onSave={handleSaveGoal} editGoal={editingGoal} />
      <GoalCheckInModal modal={checkIn} goals={goals} onResponse={handleCheckInResponse} onDismiss={() => setCheckIn({ visible: false, goalId: null, type: "start" })} />
    </>
  )
}
