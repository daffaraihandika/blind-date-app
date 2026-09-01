"use client";

import React from "react";
import { Quote, Sparkles } from "lucide-react";

interface ProfilePromptsProps {
  prompts: { question: string; answer: string }[];
}

export default function ProfilePrompts({ prompts }: ProfilePromptsProps) {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="p-5 text-left flex flex-col gap-3 bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/80 border-b border-zinc-100 dark:border-zinc-800/80">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Kutipan Kencan Saya</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {prompts.map((p, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border border-rose-100/80 dark:border-zinc-700/80 shadow-xs flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold">
              <Quote className="w-3.5 h-3.5 shrink-0" />
              <span>{p.question}</span>
            </div>
            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed pl-5">
              "{p.answer}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
