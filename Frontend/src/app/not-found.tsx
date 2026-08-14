"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6 py-12 overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-400/20 dark:bg-violet-900/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-400/15 dark:bg-amber-900/5 blur-[100px] pointer-events-none" />

      <div className="max-w-2xl text-center z-10 flex flex-col items-center">
        {/* Animated SVG Illustration */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-72 h-72 md:w-80 md:h-80 mb-8"
        >
          {/* Floating/Hovering Illustration Container */}
          <motion.div
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <svg
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-xl text-zinc-900 dark:text-zinc-50"
            >
              {/* Outer Radar / Scan Lines */}
              <circle
                cx="250"
                cy="250"
                r="180"
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth="2"
                strokeDasharray="8 8"
              />
              <circle
                cx="250"
                cy="250"
                r="120"
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth="1.5"
              />

              {/* Spinning/pulsing radar sweep */}
              <motion.circle
                cx="250"
                cy="250"
                r="120"
                className="stroke-violet-500/30 dark:stroke-violet-400/20"
                strokeWidth="12"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Holographic Planet (representing the page that is lost) */}
              <g transform="translate(180, 150)">
                <circle cx="0" cy="0" r="35" className="fill-violet-100 dark:fill-violet-950/60 stroke-violet-500 dark:stroke-violet-400" strokeWidth="4" />
                <path d="M-45,10 C-15,-20 15,-20 45,10" className="stroke-violet-500 dark:stroke-violet-400" strokeWidth="3" fill="none" />
                {/* Dots inside planet */}
                <circle cx="-10" cy="-5" r="3" className="fill-violet-400 dark:fill-violet-300" />
                <circle cx="10" cy="10" r="4" className="fill-violet-400 dark:fill-violet-300" />
              </g>

              {/* Floating Astronaut/Telescope Searcher */}
              <g transform="translate(290, 260)">
                {/* Robot/Searcher Body */}
                <rect x="-30" y="-30" width="60" height="60" rx="20" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-400 dark:stroke-zinc-700" strokeWidth="3" />
                {/* Head/Screen */}
                <rect x="-20" y="-20" width="40" height="30" rx="10" className="fill-zinc-800 dark:fill-zinc-950 stroke-zinc-500" strokeWidth="2" />
                {/* Glowing Eyes */}
                <ellipse cx="-8" cy="-5" rx="4" ry="4" className="fill-amber-400 animate-pulse" />
                <ellipse cx="8" cy="-5" rx="4" ry="4" className="fill-amber-400 animate-pulse" />

                {/* Searching beam light */}
                <polygon
                  points="-10,15 -120,200 -20,220 10,15"
                  className="fill-amber-300/10 dark:fill-amber-400/5 stroke-none"
                />
              </g>

              {/* "404" stylized text */}

            </svg>
          </motion.div>
        </motion.div>

        {/* Text Details */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-4"
        >
          <text
            x="250"
            y="420"
            textAnchor="middle"
            className="font-extrabold text-[80px] tracking-widest fill-zinc-900 dark:fill-zinc-100 font-sans"
          >
            404
          </text>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Lost in Space
          </h1>
          <p className="max-w-md mx-auto text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The page you are looking for has either been moved, archived, or was swallowed by a black hole.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 w-full max-w-sm"
        >
          <Button
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants(),
              "w-full sm:w-auto h-11 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-md shadow-violet-500/10"
            )}
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
