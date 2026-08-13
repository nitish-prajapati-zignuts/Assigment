import { Bot, Send, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
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
  const [openSources, setOpenSources] = useState<Record<string, boolean>>({});

  const toggleSources = (msgId: string) => {
    setOpenSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="bg-zinc-50/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-5 shadow-xs">
      {/* Header & Quick Suggestion Chips */}
      <div className="space-y-3 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" /> RAG Knowledge Assistant
          </span>
          <Badge variant="outline" className="text-[10px] font-semibold bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80">
            AI Co-Pilot
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            "💻 What blockers were discussed?",
            "👤 Who handles deliverables?",
            "📋 Summary of key decisions",
            "📅 Key target deadlines?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSendChatMessage(suggestion.replace(/^[^\s]+\s*/, ""))}
              disabled={isChatSending}
              className="text-[11px] px-3 py-1.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/55 dark:hover:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer font-medium shadow-xs"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="min-h-[250px] max-h-[380px] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {chatMessages.map((msg) => {
          const showSources = openSources[msg.id];
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-1`}
            >
              <span className="text-[10px] text-zinc-400 font-semibold px-2">
                {msg.role === "user" ? "You" : "Assistant"}
              </span>
              <div
                className={`max-w-[90%] rounded-3xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                    : "bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200/85 dark:border-zinc-800 rounded-tl-none"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                ) : (
                  <FormattedChatMessage content={msg.content} />
                )}

                {/* RAG Source Attribution Accordion */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    <button
                      onClick={() => toggleSources(msg.id)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {showSources ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      <span>Transcript Sources ({msg.sources.length})</span>
                    </button>

                    {showSources && (
                      <div className="mt-2 max-h-[140px] overflow-y-auto rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 p-3 border border-zinc-100 dark:border-zinc-800 space-y-2 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-mono">
                        {msg.sources.map((src, i) => (
                          <div key={i} className="pb-2 last:pb-0 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                            <span className="text-indigo-500 font-semibold mr-1">[{i + 1}]</span>
                            {src}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isChatSending && (
          <div className="flex items-center gap-2.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/45 rounded-2xl max-w-[240px] animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            <span>AI RAG Co-Pilot searching context...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSendChatMessage();
        }}
        className="flex items-center gap-2 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60"
      >
        <Input
          placeholder="Ask anything about this meeting..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={isChatSending}
          className="h-11 text-xs sm:text-sm bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500/30 rounded-2xl shadow-xs"
        />
        <Button
          type="submit"
          disabled={isChatSending || !chatInput.trim()}
          className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl font-bold flex items-center gap-2 text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          {isChatSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Ask AI</span>
              <Send className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
