"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, RefreshCw, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FeedEmptyStateProps {
  selectedCity: string;
  onChangeCityClick: () => void;
  onRefreshClick: () => void;
  isLoading?: boolean;
}

export default function FeedEmptyState({
  selectedCity,
  onChangeCityClick,
  onRefreshClick,
  isLoading = false,
}: FeedEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Radar Animation Effect */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-6">
        {/* Animated Expanding Rings */}
        <motion.div
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border border-rose-500/40 bg-rose-500/10 pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
          className="absolute inset-0 rounded-full border border-orange-500/30 bg-orange-500/10 pointer-events-none"
        />

        {/* Center Glowing Icon */}
        <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/25 z-10">
          <Compass className="w-9 h-9 animate-spin-slow" />
        </div>
      </div>

      {/* Main Copy */}
      <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
        Belum Ada Calon Kencan Baru
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs leading-relaxed">
        Kamu sudah melihat semua calon kencan di{" "}
        <span className="font-bold text-rose-500">{selectedCity}</span>. Coba
        perluas pencarian atau jelajahi area sekitar!
      </p>

      {/* Action Buttons with Horizontal Left Icons */}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-8">
        <Button
          variant="primary"
          size="md"
          fullWidth
          leftIcon={<MapPin className="w-4 h-4" />}
          onClick={onChangeCityClick}
        >
          Ganti Wilayah Kencan
        </Button>

        <Button
          variant="secondary"
          size="md"
          fullWidth
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={onRefreshClick}
        >
          Muat Ulang Feed
        </Button>
      </div>
    </div>
  );
}
