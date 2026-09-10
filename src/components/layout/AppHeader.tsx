"use client";

import React from "react";
import Link from "next/link";
import { Heart, SlidersHorizontal, MapPin } from "lucide-react";

interface AppHeaderProps {
  currentCity?: string;
  onFilterClick?: () => void;
  isLoading?: boolean;
}

export default function AppHeader({
  currentCity = "Jakarta Selatan",
  onFilterClick,
  isLoading = false,
}: AppHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-5 pt-3 pb-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/80 sticky top-0 z-30 select-none">
      {/* Brand Logo (Left Side) */}
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

      {/* Right Group: Static City Indicator + Clickable Filter Button */}
      <div className="flex items-center gap-2">
        {/* City Pill / Shimmer Skeleton */}
        {isLoading ? (
          <div className="h-7 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="max-w-[110px] truncate">{currentCity}</span>
          </div>
        )}

        {/* Clickable Filter Button (Triggers City Filter Modal) */}
        <button
          type="button"
          onClick={onFilterClick}
          disabled={isLoading}
          className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-300 transition-all shadow-2xs active:scale-95 disabled:opacity-50"
          title="Filter Wilayah Kencan"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
