"use client";

import { useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, FileUp, Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface MeetingFormTranscriptEditorProps {
  watchTranscript?: string;
  setValue: UseFormSetValue<any>;
}

export function MeetingFormTranscriptEditor({ watchTranscript = "", setValue }: MeetingFormTranscriptEditorProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsReadingFile(true);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "txt" || ext === "vtt" || ext === "srt" || ext === "json" || ext === "md") {
        const text = await file.text();
        setValue("transcript", text);
      } else if (ext === "pdf") {
        const pdfModule = await import("pdf-parse");
        const pdfParse = (pdfModule as any).default || pdfModule;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdfParse(buffer);
        setValue("transcript", data.text);
      } else if (ext === "docx") {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setValue("transcript", result.value);
      } else {
        const text = await file.text();
        setValue("transcript", text);
      }
    } catch (err) {
      console.error("Failed to parse file:", err);
      alert(`Could not extract text from "${file.name}". Please paste the text manually.`);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setFileName(null);
    setFileSize(null);
    setValue("transcript", "");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Meeting Notes & Transcript</Label>
        <span className="text-[11px] text-zinc-400 font-normal">Provide notes or transcript for AI summarization</span>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "paste" | "upload")}>
        <TabsList className="grid w-full grid-cols-2 h-8 text-xs">
          <TabsTrigger value="paste" className="flex items-center justify-center gap-1.5 text-xs">
            <Type className="h-3.5 w-3.5" /> Paste Notes
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center justify-center gap-1.5 text-xs">
            <FileUp className="h-3.5 w-3.5" /> Upload File (.txt, .docx, .pdf)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="mt-2">
          <RichTextEditor
            value={watchTranscript || ""}
            onChange={(html) => setValue("transcript", html)}
            placeholder="Type or paste meeting notes, agenda, discussion points, or transcript dialogue here..."
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
            }`}
          >
            {isReadingFile ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Reading file content...</p>
              </div>
            ) : fileName ? (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2.5 text-left">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                      {fileName}
                    </p>
                    <p className="text-[10px] text-zinc-400">{fileSize}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                <FileUp className="mx-auto h-8 w-8 text-zinc-400" />
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Drag and drop your transcript file here, or{" "}
                  <label className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-semibold">
                    browse
                    <input
                      type="file"
                      accept=".txt,.vtt,.srt,.json,.md,.pdf,.docx"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-[10px] text-zinc-400">Supports .txt, .vtt, .srt, .pdf, .docx, .json files</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
