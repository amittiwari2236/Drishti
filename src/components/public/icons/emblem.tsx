import React from "react";

export function GovernmentEmblem({ className = "size-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="State Emblem of India"
    >
      {/* Golden / Platinum Government Lion Capital Vector Art */}
      <defs>
        <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#f3f4f6" />
          <stop offset="70%" stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>
        <linearGradient id="chakraBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* Central Lion Head */}
      <path
        d="M50 8 C44 8 38 13 38 21 C38 25 40 29 43 32 L43 40 C41 41 39 43 39 46 C39 49 41 52 44 53 L44 57 C41 58 40 60 40 63 C40 67 43 70 48 71 L48 76 L52 76 L52 71 C57 70 60 67 60 63 C60 60 59 58 56 57 L56 53 C59 52 61 49 61 46 C61 43 59 41 57 40 L57 32 C60 29 62 25 62 21 C62 13 56 8 50 8 Z"
        fill="url(#emblemGold)"
      />

      {/* Left Lion Head (Profile) */}
      <path
        d="M38 18 C33 17 26 21 24 28 C23 33 25 38 28 41 C27 44 26 48 27 52 C28 55 31 58 35 59 L38 56 L38 48 C34 46 32 42 33 37 C34 33 36 29 38 28 Z"
        fill="url(#emblemGold)"
        opacity="0.92"
      />

      {/* Right Lion Head (Profile) */}
      <path
        d="M62 18 C67 17 74 21 76 28 C77 33 75 38 72 41 C73 44 74 48 73 52 C72 55 69 58 65 59 L62 56 L62 48 C66 46 68 42 67 37 C66 33 64 29 62 28 Z"
        fill="url(#emblemGold)"
        opacity="0.92"
      />

      {/* Lion Facial Details & Mane Grooves */}
      <path d="M46 22 Q50 24 54 22" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M50 24 L50 31" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M44 32 Q50 36 56 32" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="45" cy="20" r="1.5" fill="#1f2937" />
      <circle cx="55" cy="20" r="1.5" fill="#1f2937" />

      {/* Abacus / Base Platform */}
      <rect x="22" y="77" width="56" height="7" rx="2" fill="url(#emblemGold)" />
      
      {/* Central Ashoka Chakra on Abacus */}
      <circle cx="50" cy="80.5" r="3.2" stroke="url(#chakraBlue)" strokeWidth="0.9" fill="#0f172a" />
      <line x1="50" y1="77.5" x2="50" y2="83.5" stroke="#38bdf8" strokeWidth="0.6" />
      <line x1="47" y1="80.5" x2="53" y2="80.5" stroke="#38bdf8" strokeWidth="0.6" />
      <line x1="48" y1="78.5" x2="52" y2="82.5" stroke="#38bdf8" strokeWidth="0.6" />
      <line x1="48" y1="82.5" x2="52" y2="78.5" stroke="#38bdf8" strokeWidth="0.6" />

      {/* Left Bull motif */}
      <path d="M30 81 C28 79 26 82 25 80" stroke="#374151" strokeWidth="1" strokeLinecap="round" />
      {/* Right Galloping Horse motif */}
      <path d="M70 81 C72 79 74 82 75 80" stroke="#374151" strokeWidth="1" strokeLinecap="round" />

      {/* Bell-shaped Lotus Base */}
      <path
        d="M26 86 C26 86 32 99 50 99 C68 99 74 86 74 86 C68 89 58 90 50 90 C42 90 32 89 26 86 Z"
        fill="url(#emblemGold)"
      />
      <path d="M34 88 C38 95 44 97 50 97 C56 97 62 95 66 88" stroke="#6b7280" strokeWidth="0.8" fill="none" />

      {/* Satyameva Jayate (सत्यमेव जयते) Inscription Representation */}
      <text
        x="50"
        y="112"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        fill="url(#emblemGold)"
        fontFamily="sans-serif"
        letterSpacing="0.08em"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
}
