"use client";

import React from "react";

interface QuickCoordinationChipsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

const QUICK_CHIPS = [
  { id: "otw", label: "🚗 Aku otw ya!", text: "Hai! Aku sedang menuju ke kafe ya 🚗" },
  { id: "arrived", label: "☕ Sudah sampai!", text: "Aku sudah sampai di kafe ya! ☕" },
  { id: "table", label: "🪑 Duduk di meja...", text: "Aku sudah duduk di meja " },
  { id: "outfit", label: "👕 Petunjuk pakaian", text: "Petunjuk pakaian: Aku pakai " },
  { id: "traffic", label: "⏳ Sedikit telat ya", text: "Maaf ya agak macet di jalan, aku usahakan secepatnya sampai! 🙏" },
];

export default function QuickCoordinationChips({
  onSelect,
  disabled,
}: QuickCoordinationChipsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1.5 px-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs border-t border-zinc-100 dark:border-zinc-800/80">
      {QUICK_CHIPS.map((chip) => (
        <button
          key={chip.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip.text)}
          className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/60 dark:border-rose-800/50 text-[11px] font-bold text-rose-600 dark:text-rose-300 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs shrink-0 active:scale-95 disabled:opacity-50"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
