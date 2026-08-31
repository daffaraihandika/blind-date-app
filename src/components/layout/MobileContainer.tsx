"use client";

import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileContainer({ children, className = "" }: MobileContainerProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 px-0 sm:p-4 lg:p-6">
      {/* Decorative ambient background glows for desktop preview */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-orange-500/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Mobile viewport container */}
      <main
        className={`relative w-full max-w-[430px] min-h-screen sm:min-h-[880px] sm:max-h-[92vh] sm:rounded-[38px] bg-white dark:bg-zinc-900 shadow-2xl sm:shadow-rose-950/40 border-0 sm:border sm:border-zinc-200/20 overflow-hidden flex flex-col ${className}`}
      >
        {/* iOS style top notch/status bar indicator on desktop view */}
        <div className="hidden sm:flex justify-between items-center px-7 pt-3 pb-1 text-xs font-semibold text-zinc-400 select-none">
          <span>9:41</span>
          <div className="w-20 h-4 bg-zinc-800 rounded-full mx-auto" />
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 border border-zinc-500 rounded-xs" />
            <div className="w-2 h-2 rounded-full bg-zinc-500" />
          </div>
        </div>

        {/* Dynamic page content */}
        <div className="flex-1 flex flex-col overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
