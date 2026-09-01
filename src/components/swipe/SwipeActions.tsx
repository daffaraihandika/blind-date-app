"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Heart } from "lucide-react";

interface SwipeActionsProps {
  onPass: () => void;
  onLike: () => void;
  disabled?: boolean;
}

export default function SwipeActions({
  onPass,
  onLike,
  disabled = false,
}: SwipeActionsProps) {
  return (
    <div className="absolute bottom-5 inset-x-0 flex items-center justify-between px-10 pointer-events-none z-30 select-none max-w-sm mx-auto">
      {/* PASS (Dislike) Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.05 }}
        disabled={disabled}
        onClick={onPass}
        className="pointer-events-auto w-16 h-16 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xl flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-zinc-800 transition-all disabled:opacity-40"
        title="Pass / Lewati"
      >
        <X className="w-8 h-8 stroke-[2.5px]" />
      </motion.button>

      {/* LIKE Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.05 }}
        disabled={disabled}
        onClick={onLike}
        className="pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 via-rose-600 to-orange-400 shadow-2xl shadow-rose-500/40 border-2 border-white/20 flex items-center justify-center text-white hover:brightness-105 active:brightness-95 transition-all disabled:opacity-40"
        title="Like / Suka"
      >
        <Heart className="w-8 h-8 fill-white stroke-[1.5px]" />
      </motion.button>
    </div>
  );
}
