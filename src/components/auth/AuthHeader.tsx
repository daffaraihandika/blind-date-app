"use client";

import React from "react";
import { Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  badgeText?: string;
}

export default function AuthHeader({
  title,
  subtitle,
  badgeText = "Real Dates, No Endless Chat",
}: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center pt-8 pb-6 px-6">
      {/* Brand Icon with glowing ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative mb-5"
      >
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 via-rose-600 to-orange-400 flex items-center justify-center shadow-lg shadow-rose-500/30">
          <Heart className="w-8 h-8 text-white fill-white/80 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 p-1.5 rounded-full shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
        </div>
      </motion.div>

      {/* Pill Badge */}
      {badgeText && (
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 text-[11px] font-semibold text-rose-600 dark:text-rose-300 mb-3"
        >
          <span>✨</span>
          <span>{badgeText}</span>
        </motion.div>
      )}

      {/* Header Titles */}
      <motion.h1
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-[280px]"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
