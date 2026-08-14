import React from "react";

export function DashboardBannerIllustration({ className = "w-48 h-36" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="gradient-secondary" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="glow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#6366f1" floodOpacity="0.2" />
        </filter>
        <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="blur" />
        </filter>
      </defs>

      {/* Futuristic soft ambient background glow */}
      <circle cx="120" cy="90" r="75" fill="url(#glow-grad)" filter="url(#glow-filter)" opacity="0.8" />

      {/* Floating 3D-like isometric grid cards */}
      {/* 1. Left abstract document/notes container */}
      <g filter="url(#shadow)">
        <rect x="25" y="35" width="75" height="55" rx="14" fill="white" className="fill-white dark:fill-zinc-900" />
        <rect
          x="37"
          y="47"
          width="24"
          height="7"
          rx="3.5"
          fill="#e2e8f0"
          className="fill-zinc-100 dark:fill-zinc-800"
        />
        <rect
          x="37"
          y="61"
          width="45"
          height="4"
          rx="2"
          fill="#e2e8f0"
          className="fill-zinc-200/60 dark:fill-zinc-800/40"
        />
        <rect
          x="37"
          y="69"
          width="35"
          height="4"
          rx="2"
          fill="#e2e8f0"
          className="fill-zinc-200/60 dark:fill-zinc-800/40"
        />
        <circle cx="82" cy="50" r="3" fill="#6366f1" />
      </g>

      {/* 2. Floating AI Transcript soundwave card (Right Top) */}
      <g filter="url(#shadow)">
        <rect x="125" y="20" width="85" height="48" rx="16" fill="url(#gradient-primary)" />
        {/* Dynamic sound waves */}
        <rect x="142" y="39" width="3" height="10" rx="1.5" fill="white" opacity="0.6" />
        <rect x="148" y="34" width="3" height="20" rx="1.5" fill="white" />
        <rect x="154" y="30" width="3" height="28" rx="1.5" fill="white" />
        <rect x="160" y="37" width="3" height="14" rx="1.5" fill="white" opacity="0.8" />
        <rect x="166" y="33" width="3" height="22" rx="1.5" fill="white" />
        <rect x="172" y="41" width="3" height="6" rx="1.5" fill="white" opacity="0.5" />
        {/* Small floating sparkles */}
        <path d="M185 30 L187 34 L191 35 L187 36 L185 40 L183 36 L179 35 L183 34 Z" fill="white" opacity="0.9" />
      </g>

      {/* 3. Central Analytics/Metrics card (Right Bottom) */}
      <g filter="url(#shadow)">
        <rect x="105" y="85" width="105" height="68" rx="16" fill="white" className="fill-white dark:fill-zinc-900" />
        {/* Chart line representing progress */}
        <path
          d="M120 128 L142 108 L162 118 L188 96"
          stroke="url(#gradient-secondary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Interactive pulsing dots */}
        <circle cx="120" cy="128" r="4.5" fill="#ec4899" />
        <circle cx="142" cy="108" r="4.5" fill="#f43f5e" />
        <circle cx="162" cy="118" r="4.5" fill="#ec4899" />
        <circle cx="188" cy="96" r="5.5" fill="#f43f5e" className="animate-ping" />
        <circle cx="188" cy="96" r="4.5" fill="#f43f5e" />
      </g>

      {/* 4. Complete Action checklist pill (Bottom Left) */}
      <g filter="url(#shadow)">
        <rect x="50" y="105" width="40" height="40" rx="20" fill="url(#gradient-primary)" />
        <path d="M64 125 L68 129 L76 121" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function EmptyMeetingsIllustration({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="meeting-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>

      {/* Soft circular drop shadow base */}
      <circle cx="80" cy="80" r="64" fill="#f4f4f5" className="fill-zinc-100 dark:fill-zinc-900/40" />

      {/* Grid pattern */}
      <line
        x1="45"
        y1="65"
        x2="115"
        y2="65"
        stroke="#e4e4e7"
        className="stroke-zinc-200 dark:stroke-zinc-800/80"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <line
        x1="45"
        y1="85"
        x2="115"
        y2="85"
        stroke="#e4e4e7"
        className="stroke-zinc-200 dark:stroke-zinc-800/80"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <line
        x1="45"
        y1="105"
        x2="115"
        y2="105"
        stroke="#e4e4e7"
        className="stroke-zinc-200 dark:stroke-zinc-800/80"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />

      {/* Calendar dashboard module */}
      <rect
        x="52"
        y="42"
        width="56"
        height="70"
        rx="12"
        fill="white"
        className="fill-white dark:fill-zinc-950"
        stroke="url(#meeting-grad)"
        strokeWidth="2.5"
      />

      {/* Calendar banner line */}
      <path d="M52 58 H108" stroke="url(#meeting-grad)" strokeWidth="2.5" />
      <circle cx="66" cy="50" r="3" fill="url(#meeting-grad)" />
      <circle cx="94" cy="50" r="3" fill="url(#meeting-grad)" />

      {/* Miniature mock checklist items inside calendar */}
      <rect x="62" y="70" width="36" height="4" rx="2" fill="#e2e8f0" className="fill-zinc-100 dark:fill-zinc-800" />
      <rect x="62" y="80" width="24" height="4" rx="2" fill="#e2e8f0" className="fill-zinc-100 dark:fill-zinc-800" />
      <rect x="62" y="90" width="30" height="4" rx="2" fill="#e2e8f0" className="fill-zinc-100 dark:fill-zinc-800" />

      {/* Floating neon accent clock */}
      <circle
        cx="112"
        cy="102"
        r="18"
        fill="white"
        className="fill-white dark:fill-zinc-950"
        stroke="#a855f7"
        strokeWidth="2.5"
      />
      <path d="M112 94 V102 H119" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Collaboration speech bubble */}
      <path
        d="M38 92 C38 83 45 76 54 76 H62 C71 76 78 83 78 92 C78 101 71 108 62 108 H50 L40 115 V104 C38.5 101 38 97 38 92 Z"
        fill="#818cf8"
        opacity="0.9"
      />
      <circle cx="51" cy="92" r="2.5" fill="white" />
      <circle cx="58" cy="92" r="2.5" fill="white" />
      <circle cx="65" cy="92" r="2.5" fill="white" />
    </svg>
  );
}

export function EmptyActionItemsIllustration({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="action-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Ambient background circle */}
      <circle cx="80" cy="80" r="64" fill="#f0fdf4" className="fill-emerald-50/20 dark:fill-emerald-950/10" />

      {/* Styled Clipboard base */}
      <rect
        x="52"
        y="38"
        width="56"
        height="80"
        rx="10"
        fill="white"
        className="fill-white dark:fill-zinc-950 stroke-zinc-200 dark:stroke-zinc-800"
        stroke="#e4e4e7"
        strokeWidth="2.5"
      />

      {/* Metallic clip header */}
      <rect x="66" y="30" width="28" height="12" rx="4" fill="#e4e4e7" className="fill-zinc-200 dark:fill-zinc-800" />
      <circle cx="80" cy="36" r="2.5" fill="#71717a" className="fill-zinc-500" />

      {/* Action tasks checklist items */}
      <rect x="62" y="55" width="9" height="9" rx="2.5" fill="url(#action-grad)" />
      <line x1="77" y1="60" x2="97" y2="60" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

      <rect x="62" y="74" width="9" height="9" rx="2.5" fill="url(#action-grad)" />
      <line x1="77" y1="79" x2="97" y2="79" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

      <rect x="62" y="93" width="9" height="9" rx="2.5" fill="#e4e4e7" className="fill-zinc-200 dark:fill-zinc-800" />
      <line
        x1="77"
        y1="98"
        x2="97"
        y2="98"
        stroke="#e4e4e7"
        className="stroke-zinc-200 dark:stroke-zinc-800"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Completed floating badge target bubble */}
      <circle
        cx="116"
        cy="72"
        r="18"
        fill="white"
        className="fill-white dark:fill-zinc-950"
        stroke="#10b981"
        strokeWidth="2.5"
      />
      <path d="M109 72 L113 76 L123 66" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LoginIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.08" />
        </filter>
        <linearGradient id="gear-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5c73c" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>

      {/* Background Teal Question Card */}
      <g filter="url(#card-shadow)">
        <rect x="150" y="80" width="160" height="220" rx="16" fill="#8ec8d5" />
        {/* Large question mark */}
        <text x="230" y="210" fill="white" fontSize="96" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
          ?
        </text>
      </g>

      {/* Background Yellow Exclamation Card */}
      <g filter="url(#card-shadow)">
        <rect x="250" y="130" width="160" height="220" rx="16" fill="#f5c73c" />
        {/* Large exclamation mark */}
        <text x="330" y="260" fill="#334155" fontSize="96" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
          !
        </text>
      </g>

      {/* Transcript Card (Foreground) */}
      <g filter="url(#card-shadow)">
        <rect x="195" y="175" width="160" height="220" rx="16" fill="white" className="fill-white dark:fill-zinc-900" />
        <rect
          x="195"
          y="175"
          width="160"
          height="220"
          rx="16"
          stroke="#f1f5f9"
          className="stroke-zinc-100 dark:stroke-zinc-800"
          strokeWidth="2"
        />
        {/* Heading */}
        <text
          x="275"
          y="210"
          fill="#475569"
          className="fill-zinc-600 dark:fill-zinc-400"
          fontSize="12"
          fontFamily="sans-serif"
          fontWeight="800"
          letterSpacing="1"
          textAnchor="middle"
        >
          TRANSCRIPT
        </text>
        <line
          x1="210"
          y1="225"
          x2="340"
          y2="225"
          stroke="#e2e8f0"
          className="stroke-zinc-200 dark:stroke-zinc-800"
          strokeWidth="2"
        />
        {/* Binary code lines */}
        <text
          x="210"
          y="242"
          fill="#64748b"
          className="fill-zinc-500"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          010111000100101
        </text>
        <text
          x="210"
          y="258"
          fill="#64748b"
          className="fill-zinc-500"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          010111000100101
        </text>
        <line
          x1="210"
          y1="272"
          x2="340"
          y2="272"
          stroke="#e2e8f0"
          className="stroke-zinc-200 dark:stroke-zinc-800"
          strokeWidth="2"
        />
        {/* Text lines */}
        <rect
          x="210"
          y="285"
          width="130"
          height="6"
          rx="3"
          fill="#cbd5e1"
          className="fill-zinc-300 dark:fill-zinc-700"
        />
        <rect
          x="210"
          y="297"
          width="110"
          height="6"
          rx="3"
          fill="#e2e8f0"
          className="fill-zinc-200 dark:fill-zinc-800"
        />
        <rect
          x="210"
          y="309"
          width="120"
          height="6"
          rx="3"
          fill="#e2e8f0"
          className="fill-zinc-200 dark:fill-zinc-800"
        />
        <rect
          x="210"
          y="321"
          width="90"
          height="6"
          rx="3"
          fill="#cbd5e1"
          className="fill-zinc-300 dark:fill-zinc-700"
        />
      </g>

      {/* Decorative Stars and Dots */}
      <circle cx="130" cy="350" r="12" fill="#475569" className="fill-zinc-500" opacity="0.15" />
      <g transform="translate(105, 360) scale(0.6)">
        <polygon points="25,1 32,15 47,18 36,28 38,43 25,36 11,43 13,28 3,18 17,15" fill="#f5c73c" />
      </g>
      <circle cx="170" cy="385" r="4.5" fill="#475569" className="fill-zinc-600" />
      <circle cx="155" cy="370" r="2.5" fill="#cbd5e1" className="fill-zinc-400" />

      {/* Gears Overlap */}
      {/* 1. Large gold gear */}
      <g transform="translate(160, 310) scale(0.85)">
        <circle cx="50" cy="50" r="30" fill="url(#gear-grad)" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <rect
              key={i}
              x="45"
              y="10"
              width="10"
              height="80"
              rx="2"
              fill="url(#gear-grad)"
              transform={`rotate(${angle} 50 50)`}
            />
          );
        })}
        {/* Inner center cut */}
        <circle cx="50" cy="50" r="18" fill="white" className="fill-white dark:fill-zinc-900" />
        {/* 2. Inner dark gear */}
        <circle cx="50" cy="50" r="14" fill="#475569" className="fill-zinc-700" />
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 360) / 6;
          return <rect key={i} x="48" y="40" width="4" height="20" rx="1" fill="#475569" className="fill-zinc-700" />;
        })}
        <circle cx="50" cy="50" r="6" fill="white" className="fill-white dark:fill-zinc-900" />
      </g>
    </svg>
  );
}

export function RegisterIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="register-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#4f46e5" floodOpacity="0.08" />
        </filter>
        <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="user-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Floating lines connecting elements */}
      <path
        d="M150 250 C 220 220, 280 280, 350 250"
        stroke="#e2e8f0"
        strokeWidth="3"
        strokeDasharray="6 6"
        className="stroke-zinc-200 dark:stroke-zinc-800"
      />
      <path
        d="M250 150 C 220 220, 280 280, 250 350"
        stroke="#e2e8f0"
        strokeWidth="3"
        strokeDasharray="6 6"
        className="stroke-zinc-200 dark:stroke-zinc-800"
      />

      {/* Center Shield / Lock Card */}
      <g filter="url(#register-shadow)">
        <rect
          x="190"
          y="170"
          width="120"
          height="150"
          rx="20"
          fill="white"
          className="fill-white dark:fill-zinc-900 stroke-zinc-100 dark:stroke-zinc-800"
          stroke="#e2e8f0"
          strokeWidth="2"
        />
        <circle cx="250" cy="235" r="28" fill="url(#shield-grad)" opacity="0.15" />
        {/* Shield Icon */}
        <path
          d="M250 215 C250 215 264 220 268 224 C268 238 259 250 250 255 C241 250 232 238 232 224 C236 220 250 215 250 215 Z"
          fill="url(#shield-grad)"
        />
        {/* Keyhole */}
        <circle cx="250" cy="233" r="3.5" fill="white" />
        <path d="M248.5 236 H251.5 L252 245 H248 Z" fill="white" />
        {/* Verification Check Badge */}
        <circle cx="290" cy="190" r="14" fill="#10b981" />
        <path
          d="M284 190 L288 194 L296 186"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* User Signup Card 1 (Left Top) */}
      <g filter="url(#register-shadow)">
        <rect x="90" y="100" width="110" height="90" rx="16" fill="white" className="fill-white dark:fill-zinc-900" />
        <circle cx="145" cy="135" r="16" fill="url(#user-grad)" />
        {/* User figure silhouette */}
        <path d="M135 151 C135 147 139 145 145 145 C151 145 155 147 155 151 Z" fill="white" />
        <rect
          x="115"
          y="165"
          width="60"
          height="5"
          rx="2.5"
          fill="#e2e8f0"
          className="fill-zinc-100 dark:fill-zinc-800"
        />
      </g>

      {/* Analytics Card 2 (Right Bottom) */}
      <g filter="url(#register-shadow)">
        <rect x="300" y="290" width="120" height="95" rx="16" fill="white" className="fill-white dark:fill-zinc-900" />
        {/* Mock progress bars */}
        <rect x="320" y="315" width="80" height="6" rx="3" fill="#34d399" />
        <rect x="320" y="330" width="60" height="6" rx="3" fill="#60a5fa" />
        <rect x="320" y="345" width="70" height="6" rx="3" fill="#a78bfa" />
        <circle cx="310" cy="305" r="4" fill="#a78bfa" />
      </g>

      {/* Floating sparkles */}
      <path d="M370 100 L372 105 L377 106 L372 107 L370 112 L368 107 L363 106 L368 105 Z" fill="#f5c73c" />
      <path d="M120 320 L121.5 324 L125 325 L121.5 326 L120 330 L118.5 326 L115 325 L118.5 324 Z" fill="#818cf8" />
    </svg>
  );
}
