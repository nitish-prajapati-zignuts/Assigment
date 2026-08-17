"use client";

import { useEffect, useState, useRef } from "react";
import { Bot, Send, Loader2, Sparkles, X, MessageSquare } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormattedChatMessage, ChatMessage } from "./meeting-detail/MeetingChatTab";

interface ChatbotPanelProps {
  onClose: () => void;
}

interface MeetingSummaryItem {
  id: string;
  title: string;
  createdAt: string;
}

export function ChatbotPanel({ onClose }: ChatbotPanelProps) {
  const [meetings, setMeetings] = useState<MeetingSummaryItem[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! Select a meeting from the dropdown above to start asking questions about its transcript, decisions, and action items.",
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

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || !selectedMeetingId) return;

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
      // Map history format to backend expectation
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
    } catch (err: any) {
      const errorMessage = err?.message || "Sorry, I encountered an error while processing your request.";
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

  const handleMeetingChange = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    const selectedMeeting = meetings.find((m) => m.id === meetingId);
    setChatMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `You are now chatting about the meeting: **${selectedMeeting?.title || "selected meeting"}**. Ask me anything about this meeting!`,
      },
    ]);
  };

  return (
    <aside className="fixed lg:static top-[53px] lg:top-0 bottom-0 right-0 z-40 w-full lg:w-96 h-[calc(100vh-53px)] lg:h-full flex flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
      <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-500" />
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">AI Meeting Co-Pilot</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Meeting Selector */}
      <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-900/10">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
          Select Meeting Context
        </label>
        <select
          value={selectedMeetingId}
          onChange={(e) => handleMeetingChange(e.target.value)}
          className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-1`}>
            <span className="text-[10px] text-zinc-400 font-semibold px-2">
              {msg.role === "user" ? "You" : "Co-Pilot"}
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
            </div>
          </div>
        ))}
        {isChatSending && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold p-2 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/45 rounded-xl max-w-[200px] animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
            <span>Co-Pilot searching notes...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {selectedMeetingId && chatMessages.length === 1 && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-zinc-200/40 dark:border-zinc-800/40">
          {["Key blockers?", "Deliverables & Owners?", "Summarize decisions"].map((prompt) => (
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
          placeholder="Ask a question..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={isChatSending || !selectedMeetingId}
          className="h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 focus-visible:ring-indigo-500/30 rounded-xl"
        />
        <Button
          type="submit"
          disabled={isChatSending || !chatInput.trim() || !selectedMeetingId}
          className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-xs transition-all cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </aside>
  );
}
