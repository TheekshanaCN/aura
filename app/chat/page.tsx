"use client"

import { useState, useRef, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Copy, ThumbsUp, ThumbsDown, Plus, Briefcase, Bell, GalleryVerticalEnd, Gem, Flame } from "lucide-react"
import { api } from "@/lib/api"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const data = {
  user: {
    name: "shadcn",
    email: "aura@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey there! I'm Aura, your AI assistant. How can I help you today?",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadChatMessages = async () => {
      try {
        const chatMessages = await api.chat.getMessages()
        if (chatMessages.length > 0) {
          setMessages((prev) => [...prev, ...chatMessages.slice(0, 3)])
        }
      } catch (error) {
        console.error("Error loading chat messages:", error)
      }
    }

    loadChatMessages()
  }, [])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    const userInput = input
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Get AI response from API
      const responseText = await api.chat.getAIResponse(userInput)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <div
        className="flex flex-col w-full min-h-screen"
        style={{ background: "var(--app-bg)", color: "var(--text-primary)" }}
      >
        {/* Global Sticky Header */}
        <header
          className="sticky top-0 z-50 flex h-16 w-full items-center justify-between px-4 glass"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div
              className="flex aspect-square size-8 items-center justify-center rounded-lg"
              style={{ background: "var(--logo-bg)", color: "var(--logo-text)" }}
            >
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              aura
            </span>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden items-center gap-2 md:flex">
              {[Briefcase, Bell].map((Icon, i) => (
                <button
                  key={i}
                  className="flex size-9 items-center justify-center rounded-xl transition-colors"
                  style={{
                    background: "var(--btn-icon-bg)",
                    color: "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--btn-icon-hover)"
                    e.currentTarget.style.color = "var(--text-primary)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--btn-icon-bg)"
                    e.currentTarget.style.color = "var(--text-muted)"
                  }}
                >
                  <Icon className="size-5" />
                </button>
              ))}
              <button
                className="flex size-9 items-center justify-center rounded-xl transition-colors"
                style={{ background: "var(--btn-icon-bg)", color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--btn-icon-hover)"
                  e.currentTarget.style.color = "var(--text-primary)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--btn-icon-bg)"
                  e.currentTarget.style.color = "var(--text-muted)"
                }}
              >
                <div
                  className="p-0.5 rounded-md"
                  style={{ border: "1px solid var(--text-muted)" }}
                >
                  <Plus className="size-3" />
                </div>
              </button>
            </div>

            <div
              className="glass flex items-center gap-3 px-3 py-1.5 rounded-xl"
              style={{
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <Flame className="size-4 fill-orange-500 text-orange-500" />
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>91</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gem className="size-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>1K</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="size-4 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent-secondary)" }}
                >
                  <Plus className="size-3 text-white" />
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>440</span>
              </div>
            </div>
            <NavUser user={data.user} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset style={{ background: "var(--app-bg)" }}>
            <div className="flex flex-1 flex-col h-full">
              {/* Chat Messages Area */}
              <div className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md lg:max-w-lg rounded-lg p-4 ${
                          message.role === "user"
                            ? "rounded-br-none"
                            : "rounded-bl-none"
                        }`}
                        style={{
                          background:
                            message.role === "user"
                              ? "var(--accent-color)"
                              : "var(--surface-card)",
                          color:
                            message.role === "user"
                              ? "var(--accent-text)"
                              : "var(--text-primary)",
                          border:
                            message.role === "user"
                              ? "none"
                              : "1px solid var(--border-glass)",
                          backdropFilter: message.role === "assistant" ? "blur(10px)" : "none",
                          WebkitBackdropFilter: message.role === "assistant" ? "blur(10px)" : "none",
                        }}
                      >
                        <p className="text-sm lg:text-base leading-relaxed">
                          {message.content}
                        </p>
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-current border-opacity-20">
                            <button
                              className="p-1.5 rounded transition-colors opacity-70 hover:opacity-100"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                              }}
                              title="Copy message"
                            >
                              <Copy className="size-4" />
                            </button>
                            <button
                              className="p-1.5 rounded transition-colors opacity-70 hover:opacity-100"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                              }}
                              title="Helpful"
                            >
                              <ThumbsUp className="size-4" />
                            </button>
                            <button
                              className="p-1.5 rounded transition-colors opacity-70 hover:opacity-100"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                              }}
                              title="Not helpful"
                            >
                              <ThumbsDown className="size-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div
                        className="glass-card rounded-lg rounded-bl-none p-4"
                        style={{
                          background: "var(--surface-card)",
                          border: "1px solid var(--border-glass)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }}
                      >
                        <div className="flex gap-2">
                          <div
                            className="w-2 h-2 rounded-full animate-bounce"
                            style={{ background: "var(--accent-color)" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full animate-bounce"
                            style={{
                              background: "var(--accent-color)",
                              animationDelay: "0.1s",
                            }}
                          />
                          <div
                            className="w-2 h-2 rounded-full animate-bounce"
                            style={{
                              background: "var(--accent-color)",
                              animationDelay: "0.2s",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input Area */}
              <div
                className="border-t"
                style={{ borderColor: "var(--border-c)" }}
              >
                <form
                  onSubmit={handleSendMessage}
                  className="max-w-3xl mx-auto w-full p-4 lg:p-6"
                >
                  <div className="relative flex items-end gap-3">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      className="pr-12 rounded-full focus:ring-0 transition-all"
                      disabled={isLoading}
                      style={{
                        background: "var(--search-bg)",
                        border: "1px solid var(--search-border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="rounded-full p-2 h-10 w-10 flex items-center justify-center transition-colors"
                      style={{
                        background: "var(--accent-color)",
                        color: "var(--accent-text)",
                      }}
                    >
                      <Send className="size-5" />
                    </Button>
                  </div>
                  <p
                    className="text-xs mt-2 text-center"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    Powered by Aura AI
                  </p>
                </form>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
