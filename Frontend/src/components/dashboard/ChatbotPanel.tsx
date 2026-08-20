"use client";

import { useEffect, useState, useRef } from "react";
import { Bot, Send, Loader2, Sparkles, X, MessageSquare, Brain, RefreshCw, Layers } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormattedChatMessage, ChatMessage } from "./meeting-detail/MeetingChatTab";
import { SERVICE_IDS } from "@/lib/serviceIds";

interface ChatbotPanelProps {
  onClose: () => void;
}

interface MeetingSummaryItem {
  id: string;
  title: string;
  createdAt: string;
}

export function ChatbotPanel({ onClose }: ChatbotPanelProps) {
  const [mode, setMode] = useState<"global" | "meeting">("global");
  const [meetings, setMeetings] = useState<MeetingSummaryItem[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isSyncingMemory, setIsSyncingMemory] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your **LangChain Long-Term Memory Assistant**. I have access to all your past meetings, decisions, and action items. Ask me anything cross-meeting or select a specific meeting!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch list of meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await api.get("/meetings");
        if (res.data && Array.isArray(res.data.meetings)) {
          setMeetings(res.data.meetings);
          if (res.data.meetings.length > 0) {
            setSelectedMeetingId(res.data.meetings[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load meetings for chatbot", err);
      }
    };

    fetchMeetings();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatSending]);

  const handleSyncMemory = async () => {
    setIsSyncingMemory(true);
    setSyncStatusMsg("Indexing all past meetings & tasks into vector memory...");

    try {
      const res = await api.post("/service", {
        serviceId: SERVICE_IDS.CHAT.MEMORY_SYNC,
      });

      if (res.data?.stats) {
        setSyncStatusMsg(
          `Memory Synced! (${res.data.stats.meetingsIndexed} meetings, ${res.data.stats.actionItemsIndexed} action items)`
        );
      } else {
        setSyncStatusMsg("Memory successfully synced!");
      }
    } catch (err: any) {
      setSyncStatusMsg("Failed to sync memory.");
    } finally {
      setIsSyncingMemory(false);
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    if (!textToSend) setChatInput("");

    // Add user message to state
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatSending(true);

    try {
      if (mode === "global") {
        // Query LangChain Global Long-Term Memory
        const res = await api.post("/service", {
          serviceId: SERVICE_IDS.CHAT.GLOBAL,
          payload: {
            question: text,
            sessionId: sessionId || undefined,
          },
        });

        if (res.data) {
          if (res.data.sessionId) setSessionId(res.data.sessionId);

          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            role: "assistant",
            content: res.data.answer || "No response received from LangChain memory.",
            sources: res.data.retrievedSources?.map((s: any) => s.title) || [],
          };
          setChatMessages((prev) => [...prev, botMsg]);
        }
      } else {
        // Query single meeting endpoint
        if (!selectedMeetingId) return;

        const historyPayload = chatMessages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const res = await api.post(`/meetings/${selectedMeetingId}/chat`, {
          question: text,
          history: historyPayload,
        });

        if (res.data) {
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            role: "assistant",
            content: res.data.answer || "No response received.",
            sources: res.data.retrievedSources?.map((s: any) => s.title) || [],
          };
          setChatMessages((prev) => [...prev, botMsg]);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Sorry, I encountered an error while querying long-term memory.";
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: errorMessage,
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleModeToggle = (newMode: "global" | "meeting") => {
    setMode(newMode);
    if (newMode === "global") {
      setChatMessages([
        {
          id: "welcome-global",
          role: "assistant",
          content:
            "Switched to **All Meetings & Action Items Memory**. Ask me questions across all your meetings and task deliverables!",
        },
      ]);
    } else {
      const selected = meetings.find((m) => m.id === selectedMeetingId);
      setChatMessages([
        {
          id: "welcome-meeting",
          role: "assistant",
          content: `Switched to single meeting scope: **${selected?.title || "selected meeting"}**.`,
        },
      ]);
    }
  };

  return (
    <aside className="fixed lg:static top-[53px] lg:top-0 bottom-0 right-0 z-40 w-full lg:w-96 h-[calc(100vh-53px)] lg:h-full flex flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-500" />
          <span className="font-bold text-xs tracking-tight text-zinc-900 dark:text-zinc-50">
            LangChain Long-Term Memory
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSyncMemory}
            disabled={isSyncingMemory}
            title="Re-index & sync all meetings & action items memory"
            className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingMemory ? "animate-spin text-indigo-500" : ""}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium flex items-center justify-between">
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="p-2 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-900/10">
        <div className="grid grid-cols-2 gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
          <button
            onClick={() => handleModeToggle("global")}
            className={`py-1 text-[11px] font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
              mode === "global"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Brain className="h-3 w-3" />
            <span>All Meetings (Memory)</span>
          </button>
          <button
            onClick={() => handleModeToggle("meeting")}
            className={`py-1 text-[11px] font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
              mode === "meeting"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Single Meeting</span>
          </button>
        </div>

        {/* Single Meeting Dropdown if mode === 'meeting' */}
        {mode === "meeting" && (
          <div className="mt-2">
            <select
              value={selectedMeetingId}
              onChange={(e) => {
                setSelectedMeetingId(e.target.value);
                const selected = meetings.find((m) => m.id === e.target.value);
                setChatMessages([
                  {
                    id: "welcome-meeting-select",
                    role: "assistant",
                    content: `Selected meeting: **${selected?.title || "meeting"}**.`,
                  },
                ]);
              }}
              className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {meetings.length === 0 ? (
                <option value="">No meetings found</option>
              ) : (
                meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))
              )}
            </select>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-1`}>
            <span className="text-[10px] text-zinc-400 font-semibold px-2">
              {msg.role === "user" ? "You" : "LangChain Memory Co-Pilot"}
            </span>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                  : "bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800/60 rounded-tl-none"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
              ) : (
                <FormattedChatMessage content={msg.content} />
              )}

              {/* Citations & Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-indigo-500">Retrieved Memory Sources:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/50 px-1.5 py-0.5 rounded-md font-mono text-[9px]"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isChatSending && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold p-2 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/45 rounded-xl max-w-[220px] animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
            <span>Searching LangChain memory...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {chatMessages.length === 1 && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-zinc-200/40 dark:border-zinc-800/40">
          {(mode === "global"
            ? [
                "What are my pending action items?",
                "Summarize decisions from recent meetings",
                "What deliverables are due soon?",
              ]
            : ["Key blockers?", "Deliverables & Owners?", "Summarize decisions"]
          ).map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="text-[10px] px-2 py-1 bg-zinc-50 dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 border border-zinc-250 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex gap-2 bg-zinc-50/50 dark:bg-zinc-900/20"
      >
        <Input
          placeholder={mode === "global" ? "Ask across all meetings & action items..." : "Ask about this meeting..."}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={isChatSending || (mode === "meeting" && !selectedMeetingId)}
          className="h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 focus-visible:ring-indigo-500/30 rounded-xl"
        />
        <Button
          type="submit"
          disabled={isChatSending || !chatInput.trim() || (mode === "meeting" && !selectedMeetingId)}
          className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-xs transition-all cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </aside>
  );
}
