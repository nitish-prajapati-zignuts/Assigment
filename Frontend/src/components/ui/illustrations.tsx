import React from "react";

export function DashboardBannerIllustration({ className = "w-48 h-36" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
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
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Ambient background glow */}
      <circle cx="120" cy="90" r="70" fill="url(#glow-grad)" filter="url(#shadow)" />

      {/* Floating abstract dashboard grids */}
      <rect x="30" y="40" width="70" height="50" rx="10" fill="white" className="fill-white dark:fill-zinc-900 shadow-sm" opacity="0.9" />
      <rect x="40" y="52" width="20" height="6" rx="3" fill="#e2e8f0" className="fill-zinc-100 dark:fill-zinc-850" />
      <rect x="40" y="66" width="40" height="4" rx="2" fill="#e2e8f0" className="fill-zinc-200 dark:fill-zinc-800" />
      <rect x="40" y="74" width="30" height="4" rx="2" fill="#e2e8f0" className="fill-zinc-200 dark:fill-zinc-800" />

      {/* Speech bubbles / soundwave */}
      <g filter="url(#shadow)">
        <rect x="130" y="25" width="80" height="45" rx="12" fill="url(#gradient-primary)" />
        {/* Soundwave lines inside speech bubble */}
        <line x1="145" y1="47" x2="145" y2="47" stroke="white" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
        <line x1="152" y1="40" x2="152" y2="54" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="159" y1="36" x2="159" y2="58" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="166" y1="43" x2="166" y2="51" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="173" y1="38" x2="173" y2="56" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="180" y1="45" x2="180" y2="49" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M190 70 L195 78 L200 70 Z" fill="#a855f7" />
      </g>

      {/* Analytics Chart SVG representation */}
      <g filter="url(#shadow)">
        <rect x="110" y="90" width="100" height="65" rx="12" fill="white" className="fill-white dark:fill-zinc-900" opacity="0.95" />
        <path
          d="M125 135 L145 115 L165 125 L185 105"
          stroke="url(#gradient-secondary)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="125" cy="135" r="4" fill="#ec4899" />
        <circle cx="145" cy="115" r="4" fill="#f43f5e" />
        <circle cx="165" cy="125" r="4" fill="#ec4899" />
        <circle cx="185" cy="105" r="4" fill="#f43f5e" />
      </g>

      {/* Circular floating element with checkmark */}
      <circle cx="95" cy="120" r="18" fill="url(#gradient-primary)" filter="url(#shadow)" />
      <path
        d="M89 120 L93 124 L101 116"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyMeetingsIllustration({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="meeting-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>

      {/* Background soft circle */}
      <circle cx="80" cy="80" r="60" fill="#f4f4f5" className="fill-zinc-100 dark:fill-zinc-800/40" />

      {/* Grid Lines */}
      <line x1="50" y1="60" x2="110" y2="60" stroke="#e4e4e7" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="50" y1="80" x2="110" y2="80" stroke="#e4e4e7" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="50" y1="100" x2="110" y2="100" stroke="#e4e4e7" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="2" strokeDasharray="3 3" />

      {/* Styled calendar card representation */}
      <rect x="55" y="45" width="50" height="65" rx="8" fill="white" className="fill-white dark:fill-zinc-900" stroke="url(#meeting-grad)" strokeWidth="2" />
      
      {/* Calendar Header Line */}
      <path d="M55 58 H105" stroke="url(#meeting-grad)" strokeWidth="2" />
      <circle cx="67" cy="51" r="2" fill="url(#meeting-grad)" />
      <circle cx="93" cy="51" r="2" fill="url(#meeting-grad)" />

      {/* Floating clock */}
      <circle cx="110" cy="100" r="16" fill="white" className="fill-white dark:fill-zinc-900" stroke="#a855f7" strokeWidth="2" />
      <path d="M110 92 V100 H116" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />

      {/* Chat bubble icon representing meetings/dialogue */}
      <path
        d="M40 90 C40 81.7157 46.7157 75 55 75 H65 C73.2843 75 80 81.7157 80 90 C80 98.2843 73.2843 105 65 105 H52 L42 112 V102 C40.75 98.5 40 94.5 40 90 Z"
        fill="#818cf8"
        opacity="0.85"
      />
      <circle cx="53" cy="90" r="2.5" fill="white" />
      <circle cx="60" cy="90" r="2.5" fill="white" />
      <circle cx="67" cy="90" r="2.5" fill="white" />
    </svg>
  );
}

export function EmptyActionItemsIllustration({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="action-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="80" cy="80" r="60" fill="#f0fdf4" className="fill-emerald-50/20 dark:fill-emerald-950/10" />

      {/* Clipboard base */}
      <rect x="55" y="40" width="50" height="75" rx="6" fill="white" className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" stroke="#e4e4e7" strokeWidth="2" />
      
      {/* Clipboard header */}
      <rect x="68" y="34" width="24" height="10" rx="3" fill="#e4e4e7" className="fill-zinc-200 dark:fill-zinc-800" />
      <circle cx="80" cy="39" r="2" fill="#71717a" className="fill-zinc-500" />

      {/* Checkboxes & lines */}
      <rect x="65" y="55" width="8" height="8" rx="2" fill="url(#action-grad)" />
      <line x1="78" y1="59" x2="98" y2="59" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

      <rect x="65" y="73" width="8" height="8" rx="2" fill="url(#action-grad)" />
      <line x1="78" y1="77" x2="98" y2="77" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

      <rect x="65" y="91" width="8" height="8" rx="2" fill="#e4e4e7" className="fill-zinc-200 dark:fill-zinc-800" />
      <line x1="78" y1="95" x2="98" y2="95" stroke="#e4e4e7" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="2" strokeLinecap="round" />

      {/* Big green target circles */}
      <circle cx="115" cy="70" r="16" fill="white" className="fill-white dark:fill-zinc-900" stroke="#10b981" strokeWidth="2" />
      <path
        d="M109 70 L113 74 L121 66"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
