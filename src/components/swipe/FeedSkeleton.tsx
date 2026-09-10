"use client";

import React from "react";

export default function FeedSkeleton() {
  return (
    <div className="relative w-full h-full rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col animate-pulse select-none">
      {/* 1. Hero Image Skeleton */}
      <div className="relative w-full aspect-[3.8/4.6] bg-zinc-200 dark:bg-zinc-800 flex flex-col justify-end p-5">
        {/* Name & Age Bar Skeleton */}
        <div className="h-7 w-44 bg-zinc-300 dark:bg-zinc-700 rounded-xl mb-2" />

        {/* City Pill Skeleton */}
        <div className="h-5 w-28 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
      </div>

      {/* 2. Bio & Chips Skeleton Section */}
      <div className="p-5 flex flex-col gap-3 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-md" />
        <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800/60 rounded-md mb-2" />

        <div className="flex gap-2">
          <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-7 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>

      {/* Floating Action Buttons Skeleton Placeholder */}
      <div className="absolute bottom-4 inset-x-0 px-10 flex items-center justify-between pointer-events-none z-20">
        <div className="w-14 h-14 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 shadow-md" />
        <div className="w-14 h-14 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 shadow-md" />
      </div>
    </div>
  );
}
