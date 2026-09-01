"use client";

import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col bg-white dark:bg-zinc-900 animate-pulse select-none">
      {/* 1. Hero Skeleton */}
      <div className="flex flex-col items-center text-center p-6 border-b border-zinc-100 dark:border-zinc-800/80">
        {/* Avatar Circle Skeleton */}
        <div className="w-28 h-28 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-4" />

        {/* Name & Age Skeleton */}
        <div className="h-6 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-xl mb-2.5" />

        {/* Badges Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="h-10 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-10 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        </div>
      </div>

      {/* 2. Prompts Skeleton Card */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-3">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 flex flex-col gap-2">
          <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-md" />
          <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-800/60 rounded-md" />
        </div>
      </div>

      {/* 3. Preferences Skeleton Card */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-3">
        <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-20 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
      </div>

      {/* 4. Settings Skeleton Card */}
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-14 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
        <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl mt-1" />
      </div>
    </div>
  );
}
