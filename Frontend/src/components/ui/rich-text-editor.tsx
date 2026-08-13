"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "next-themes";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write transcript or notes here...",
  height = 300,
}: RichTextEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <Editor
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height,
          menubar: false,
          placeholder,
          skin: isDarkMode ? "oxide-dark" : "oxide",
          content_css: isDarkMode ? "dark" : "default",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link removeformat | help",
          content_style: "body { font-family:Inter,sans-serif; font-size:14px; line-height:1.6 }",
        }}
      />
    </div>
  );
}
