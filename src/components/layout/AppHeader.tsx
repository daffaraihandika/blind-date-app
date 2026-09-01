"use client";

import React from "react";
import Link from "next/link";
import { Heart, SlidersHorizontal, Sparkles, MapPin } from "lucide-react";

interface AppHeaderProps {
  currentCity?: string;
  onFilterClick?: () => void;
  isPro?: boolean;
}

export default function AppHeader({
  currentCity = "Jakarta Selatan",
  onFilterClick,
  isPro = false,
}: AppHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-5 pt-3 pb-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/80 sticky top-0 z-30 select-none">
      {/* Brand Logo */}
      <Link href="/feed" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
          <Heart className="w-4.5 h-4.5 text-white fill-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-gradient-brand leading-none">
            BlindDate
          </span>
          <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase mt-0.5">
            Real Dates
          </span>
        </div>
      </Link>

      {/* Location Capsule */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
        <MapPin className="w-3 h-3 text-rose-500" />
        <span>{currentCity}</span>
      </div>

      {/* Right Controls: Pro Badge & Filter */}
      <div className="flex items-center gap-2">
        <Link
          href="/pricing"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-transform active:scale-95 shadow-xs ${
            isPro
              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
              : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40"
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
          <span>{isPro ? "PRO MEMBER" : "5RB/MG"}</span>
        </Link>

        <button
          type="button"
          onClick={onFilterClick || (() => alert("Filter jarak & preferensi usia akan segera hadir."))}
          className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors"
          title="Filter Kencan"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
