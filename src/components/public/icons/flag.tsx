import React from "react";

export function IndianFlagIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} inline-block rounded-xs shadow-xs border border-white/20 overflow-hidden shrink-0`}
    >
      {/* Saffron band */}
      <rect width="36" height="8" fill="#FF9933" />
      {/* White band */}
      <rect y="8" width="36" height="8" fill="#FFFFFF" />
      {/* Green band */}
      <rect y="16" width="36" height="8" fill="#138808" />
      {/* Ashoka Chakra */}
      <circle cx="18" cy="12" r="3" stroke="#000080" strokeWidth="0.8" fill="none" />
      <circle cx="18" cy="12" r="0.8" fill="#000080" />
      {/* Spokes */}
      <line x1="18" y1="9.2" x2="18" y2="14.8" stroke="#000080" strokeWidth="0.4" />
      <line x1="15.2" y1="12" x2="20.8" y2="12" stroke="#000080" strokeWidth="0.4" />
      <line x1="16" y1="10" x2="20" y2="14" stroke="#000080" strokeWidth="0.4" />
      <line x1="16" y1="14" x2="20" y2="10" stroke="#000080" strokeWidth="0.4" />
    </svg>
  );
}
