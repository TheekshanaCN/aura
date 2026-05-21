"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Mic, MicOff, ArrowUp } from "lucide-react";
import { api } from "@/lib/api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─────────────────────────────────────────────
// TTS
// ─────────────────────────────────────────────

const speak = (text: string, onEnd?: () => void) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  const voices = window.speechSynthesis.getVoices();
  // Prefer male English voices — Google UK English Male is the most natural cross-platform
  const preferred =
    voices.find((v) => v.name.includes("Daniel")) ||
    voices.find((v) => v.name === "Google UK English Male") ||
    voices.find(
      (v) => v.name === "Microsoft David - English (United States)",
    ) ||
    voices.find((v) => v.name.includes("Alex")) ||
    voices.find((v) => v.lang.startsWith("en") && /male/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith("en"));
  if (preferred) u.voice = preferred;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
};

// ─────────────────────────────────────────────
// Typing dots
// ─────────────────────────────────────────────

function ThinkingDots() {
  return (
    <div
      style={{
        display: "flex",
        gap: "5px",
        alignItems: "center",
        padding: "2px 0",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--text-muted)",
            animation: `aura-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

export function AskAura() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80);
    if (!isOpen) {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Send ──

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const response = await api.chat.getAIResponse(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsSpeaking(true);
      speak(response, () => setIsSpeaking(false));
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage(text);
  };

  // ── Voice ──

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    recognitionRef.current = r;
    r.lang = "en-US";
    r.interimResults = false;
    r.onstart = () => setIsListening(true);
    r.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    r.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    r.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      recognitionRef.current = null;
      if (transcript.trim()) await sendMessage(transcript);
    };
    r.start();
  }, [sendMessage]);

  const toggleMic = () => (isListening ? stopListening() : startListening());

  // ── Textarea auto-resize ──
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* ── Fullscreen Overlay ── */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: hasMessages ? "flex-start" : "center",
          padding: hasMessages ? "60px 20px 20px" : "0 20px",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.06)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(10px)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(255,255,255,0.1)";
            el.style.color = "white";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(255,255,255,0.06)";
            el.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <X size={15} strokeWidth={1.8} />
        </button>

        {/* Branding — shown when no messages */}
        {!hasMessages && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              marginBottom: "32px",
              animation: "aura-fadein 0.3s ease",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, var(--accent-color), var(--accent-secondary, var(--accent-color)))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                boxShadow: "0 8px 32px rgba(var(--accent-rgb,99,102,241),0.35)",
              }}
            >
              ✦
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  color: "white",
                  fontSize: "18px",
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Ask Aura
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "13px",
                  margin: "4px 0 0",
                  fontWeight: 400,
                }}
              >
                Your AI assistant
              </p>
            </div>
          </div>
        )}

        {/* Messages — shown when conversation started */}
        {hasMessages && (
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginBottom: "16px",
              scrollbarWidth: "none",
              paddingRight: "4px",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: "10px",
                  animation: "aura-fadein 0.2s ease",
                }}
              >
                {/* Aura avatar */}
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "9px",
                      flexShrink: 0,
                      background:
                        "linear-gradient(135deg, var(--accent-color), var(--accent-secondary, var(--accent-color)))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                    }}
                  >
                    ✦
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "68%",
                    padding: "11px 15px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 3px 14px"
                        : "3px 14px 14px 14px",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    wordBreak: "break-word",
                    background:
                      msg.role === "user"
                        ? "var(--accent-color)"
                        : "rgba(255,255,255,0.08)",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    backdropFilter:
                      msg.role === "assistant" ? "blur(10px)" : "none",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Thinking */}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "10px",
                  animation: "aura-fadein 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "9px",
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, var(--accent-color), var(--accent-secondary, var(--accent-color)))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                  }}
                >
                  ✦
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "3px 14px 14px 14px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <ThinkingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ── Main Input Bar ── */}
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            borderRadius: "18px",
            border: `1px solid ${isListening ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`,
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: isListening
              ? "0 0 0 3px rgba(239,68,68,0.15), 0 24px 60px rgba(0,0,0,0.4)"
              : "0 24px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "flex-end",
            gap: "8px",
            padding: "10px 10px 10px 18px",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            animation: "aura-scaleup 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask Aura anything..."}
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              color: "white",
              fontSize: "15px",
              lineHeight: "1.55",
              fontFamily: "inherit",
              overflow: "hidden",
              minHeight: "26px",
              maxHeight: "140px",
              paddingTop: "0",
              paddingBottom: "5px",
            }}
          />

          {/* Mic button */}
          <button
            onClick={toggleMic}
            title={isListening ? "Stop listening" : "Voice input"}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              flexShrink: 0,
              border: `1px solid ${isListening ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`,
              background: isListening
                ? "rgba(239,68,68,0.15)"
                : "rgba(255,255,255,0.06)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isListening ? "#ef4444" : "rgba(255,255,255,0.5)",
              transition: "all 0.15s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!isListening) {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.1)";
                el.style.color = "white";
                el.style.borderColor = "rgba(255,255,255,0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isListening) {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.06)";
                el.style.color = "rgba(255,255,255,0.5)";
                el.style.borderColor = "rgba(255,255,255,0.12)";
              }
            }}
          >
            {/* Mic pulse ring when listening */}
            {isListening && (
              <div
                style={{
                  position: "absolute",
                  inset: "-4px",
                  borderRadius: "16px",
                  border: "1px solid rgba(239,68,68,0.4)",
                  animation: "aura-ring 1.5s ease-out infinite",
                }}
              />
            )}
            {isListening ? (
              <MicOff size={16} strokeWidth={1.8} />
            ) : (
              <Mic size={16} strokeWidth={1.8} />
            )}
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              flexShrink: 0,
              border: "none",
              background:
                input.trim() && !isLoading
                  ? "var(--accent-color)"
                  : "rgba(255,255,255,0.08)",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:
                input.trim() && !isLoading ? "white" : "rgba(255,255,255,0.25)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isLoading)
                (e.currentTarget as HTMLElement).style.transform =
                  "scale(1.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Hint text */}
        {!hasMessages && (
          <p
            style={{
              marginTop: "14px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.02em",
              animation: "aura-fadein 0.4s ease 0.1s both",
            }}
          >
            Press{" "}
            <kbd
              style={{
                padding: "1px 5px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "inherit",
              }}
            >
              Enter
            </kbd>{" "}
            to send ·{" "}
            <kbd
              style={{
                padding: "1px 5px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "inherit",
              }}
            >
              Esc
            </kbd>{" "}
            to close
          </p>
        )}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "7px",
          height: "40px",
          padding: "0 14px",
          borderRadius: "10px",
          border: "1px solid var(--border-glass)",
          cursor: "pointer",
          background: "var(--surface-glass)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.04)",
          color: "var(--text-primary)",
          fontSize: "13px",
          fontWeight: 500,
          transition: "all 0.18s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--accent-color)";
          el.style.boxShadow =
            "0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px var(--accent-color)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border-glass)";
          el.style.boxShadow =
            "0 8px 24px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.04)";
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "5px",
            flexShrink: 0,
            background:
              "linear-gradient(135deg, var(--accent-color), var(--accent-secondary, var(--accent-color)))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
          }}
        >
          ✦
        </div>
        <span>Ask Aura</span>
      </button>

      <style>{`
        @keyframes aura-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aura-scaleup {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes aura-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50%       { opacity: 1;   transform: translateY(-3px); }
        }
        @keyframes aura-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </>
  );
}
