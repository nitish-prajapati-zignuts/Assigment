"use client";

import { useState } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp, SectionBadge } from "./shared";

const faqs = [
  {
    q: "How does Syncra AI generate meeting summaries?",
    a: "Syncra uses advanced LLMs powered by LangChain to analyze your meeting transcripts. It identifies key decisions, action items, sentiment patterns, and speaker contributions, then generates structured summaries tailored to different roles like executives, developers, or sales teams.",
  },
  {
    q: "Is my meeting data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. Share links use AES-256-GCM encryption with optional password protection and configurable expiration. We implement CSRF protection, rate limiting, and Helmet security headers.",
  },
  {
    q: "Can I search across all my past meetings?",
    a: "Yes! Our RAG (Retrieval-Augmented Generation) system indexes all your transcripts into a vector store. You can ask natural language questions and the AI will retrieve relevant context from your entire meeting history.",
  },
  {
    q: "What file formats are supported for transcript uploads?",
    a: "Syncra supports plain text paste, DOCX files (via Mammoth), and PDF files (via pdf-parse). You can also type directly into our built-in rich text editor.",
  },
  {
    q: "Does Syncra integrate with existing tools?",
    a: "Syncra features a service registry architecture that makes it easy to add integrations. The platform includes email notifications, Slack-style @mention autocomplete for participants, and REST APIs documented with Swagger.",
  },
];

function FAQItem({ q, a, open, toggle }: { q: string; a: string; open: boolean; toggle: () => void }) {
  return (
    <div className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer"
      >
        {q}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <p className="px-5 pb-5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 md:py-32 px-6 z-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <FadeUp>
            <SectionBadge>
              <MessageSquare className="h-3 w-3" />
              FAQ
            </SectionBadge>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-5 mb-4">Frequently Asked Questions</h2>
          </FadeUp>
        </div>

        <FadeUp delay={0.15}>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openFAQ === i}
                toggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
