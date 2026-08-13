"use client";

import { Bot, Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; type: string }[];
}

function formatInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\(Source\s*#\d+\)|\[Source\s*#\d+\])/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-zinc-900 dark:text-zinc-50">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/\(Source\s*#\d+\)|\[Source\s*#\d+\]/i.test(part)) {
      const match = part.match(/Source\s*#\d+/i);
      return (
        <span
          key={i}
          className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/80 text-[10px]"
        >
          {match ? match[0] : part}
        </span>
      );
    }

    return part;
  });
}

export function FormattedChatMessage({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 font-sans leading-relaxed text-xs sm:text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("# ")) {
          return (
            <h3 key={idx} className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-2 mb-1">
              {formatInlineText(trimmed.replace(/^#\s+/, ""))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={idx} className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mt-2 mb-1">
              {formatInlineText(trimmed.replace(/^##\s+/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h5 key={idx} className="text-xs font-bold text-indigo-500 mt-1.5 mb-1">
              {formatInlineText(trimmed.replace(/^###\s+/, ""))}
            </h5>
          );
        }

        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || /^\d+\.\s/.test(trimmed)) {
          const bulletText = trimmed.replace(/^(\*|-|\d+\.)\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
              <div className="flex-1 text-zinc-800 dark:text-zinc-200">{formatInlineText(bulletText)}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="text-zinc-800 dark:text-zinc-200">
            {formatInlineText(line)}
          </p>
        );
      })}
    </div>
  );
}

interface MeetingChatTabProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  isChatSending: boolean;
  onSendChatMessage: (promptText?: string) => void;
}

export function MeetingChatTab({
  chatMessages,
  chatInput,
  setChatInput,
  isChatSending,
  onSendChatMessage,
}: MeetingChatTabProps) {
  return (
    <div className="bg-zinc-50/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-4">
      {/* Header & Quick Suggestion Chips */}
      <div className="space-y-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Bot className="h-4 w-4" /> RAG Knowledge Assistant
          </span>
          <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200">
            Grounded Answers
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            "💻 What technical blockers were discussed?",
            "👤 Who handles deliverables & tasks?",
            "📋 Summary of key decisions made",
            "📅 What are the deadline dates?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSendChatMessage(suggestion.replace(/^[^\s]+\s*/, ""))}
              disabled={isChatSending}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-indigo-50 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60 transition-all cursor-pointer font-medium shadow-2xs"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="min-h-[220px] max-h-[350px] overflow-y-auto space-y-3 pr-1">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white shadow-xs rounded-br-none"
                  : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/60 rounded-bl-none shadow-xs"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap font-sans font-medium">{msg.content}</div>
              ) : (
                <FormattedChatMessage content={msg.content} />
              )}

              {/* RAG Source Attribution Badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-zinc-400 font-semibold">Sources:</span>
                  {msg.sources.map((src, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-medium"
                    >
                      {src.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isChatSending && (
          <div className="flex items-center gap-2 text-xs text-indigo-500 font-medium p-2 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl max-w-[200px]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>RAG Assistant searching context...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSendChatMessage();
        }}
        className="flex items-center gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60"
      >
        <Input
          placeholder="Ask anything about this meeting..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={isChatSending}
          className="h-10 text-xs sm:text-sm bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500/40 rounded-xl"
        />
        <Button
          type="submit"
          disabled={isChatSending || !chatInput.trim()}
          className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 text-xs shadow-xs"
        >
          {isChatSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <Send className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
