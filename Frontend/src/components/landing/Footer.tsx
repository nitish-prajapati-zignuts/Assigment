"use client";

import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-zinc-200/50 dark:border-zinc-800/50 py-12 px-6 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Syncra AI
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400 max-w-xs">
              AI-powered meeting intelligence platform that transforms conversations into structured, actionable
              insights.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-4">Product</h4>
            <div className="space-y-2.5">
              {["Features", "How It Works", "Security", "Pricing"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-4">Company</h4>
            <div className="space-y-2.5">
              {["About", "Blog", "Careers", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-4">Legal</h4>
            <div className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50 gap-4">
          <p className="text-[10px] text-zinc-400">© {new Date().getFullYear()} Syncra AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Twitter", "GitHub", "LinkedIn"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-[10px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
