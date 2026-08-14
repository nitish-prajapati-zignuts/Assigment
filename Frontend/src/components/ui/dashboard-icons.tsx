import React from "react";

interface IconProps {
  className?: string;
}

export function MeetingsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="5" width="18" height="15" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="13" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="11" y="13" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="15" y="13" width="2" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export function ActionItemsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M9 3H15C16.1046 3 17 3.89543 17 5V19C17 20.1046 16.1046 21 15 21H9C7.89543 21 7 20.1046 7 19V5C7 3.89543 7.89543 3 9 3Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M9 11L11 13L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function OpenItemsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CompletedItemsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OverdueItemsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M12 3L21 19H3L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function TranscriptsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M6 3H14L18 7V19C18 20.1046 17.1046 21 16 21H6C4.89543 21 4 20.1046 4 19V5C4 3.89543 4.89543 3 6 3Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M14 3V7H18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BlockedItemsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M8.5 3H15.5L21 8.5V15.5L15.5 21H8.5L3 15.5V8.5L8.5 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
