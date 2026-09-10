"use client";

import React from "react";

export default function DatesSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 p-4 animate-pulse select-none">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="w-full rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800/60 rounded-md" />
              </div>
            </div>
            <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>

          {/* Details Box */}
          <div className="h-20 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />

          {/* Buttons */}
          <div className="flex gap-2">
            <div className="h-10 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            <div className="h-10 flex-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
