"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Coffee, Sparkles, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MatchEvent } from "@/types/match";

interface MatchModalProps {
  matchEvent: MatchEvent | null;
  onClose: () => void;
  onPlanDate: () => void;
}

export default function MatchModal({
  matchEvent,
  onClose,
  onPlanDate,
}: MatchModalProps) {
  if (!matchEvent) return null;

  const { matchedUser, currentUserAvatar, currentUserGender = "female" } = matchEvent;
  const isFemale = currentUserGender === "female";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-sm rounded-[36px] bg-gradient-to-b from-zinc-900 via-zinc-900 to-black border border-rose-500/30 p-6 text-center text-white shadow-2xl shadow-rose-500/20 overflow-hidden flex flex-col items-center"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Ambient Glow */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-rose-500/30 to-transparent pointer-events-none" />

          {/* Sparkle Header Badge */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold mb-3 mt-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Kalian Saling Menyukai!</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-300 to-orange-300"
          >
            It's a Match! 🎉
          </motion.h2>

          <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
            Kamu dan <strong className="text-white">{matchedUser.fullName}</strong> sama-sama tertarik untuk kencan nyata.
          </p>

          {/* Overlapping Avatars Composition */}
          <div className="relative flex items-center justify-center my-6 py-2">
            {/* Left Avatar (Current User) */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25, type: "spring" }}
              className="relative w-22 h-22 rounded-full p-1 bg-gradient-to-tr from-rose-500 to-orange-400 shadow-xl z-10 -mr-4"
            >
              <img
                src={currentUserAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt="My Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>

            {/* Center Heart Emblem */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="absolute z-30 w-10 h-10 rounded-full bg-rose-500 border-2 border-zinc-900 shadow-lg flex items-center justify-center text-white"
            >
              <Heart className="w-5 h-5 fill-white animate-pulse" />
            </motion.div>

            {/* Right Avatar (Matched User) */}
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25, type: "spring" }}
              className="relative w-22 h-22 rounded-full p-1 bg-gradient-to-tr from-orange-400 to-rose-500 shadow-xl z-20"
            >
              <img
                src={matchedUser.avatarUrl}
                alt={matchedUser.fullName}
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>
          </div>

          {/* BlindDate Golden Rule Card */}
          <div className="w-full rounded-2xl bg-zinc-800/80 border border-zinc-700/80 p-3.5 mb-6 text-left flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <Coffee className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-rose-300 block mb-0.5">
                Aturan Kencan BlindDate:
              </span>
              <p className="text-[11px] text-zinc-300 leading-snug">
                {isFemale
                  ? "Sebagai wanita, giliranmu memilih tempat kafe/resto dan waktu kencan yang aman!"
                  : `Tunggu ${matchedUser.fullName} memilih kafe dan waktu kencan yang nyaman untuk kalian.`}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full flex flex-col gap-2.5">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onPlanDate}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isFemale ? "Tentukan Tempat Kencan" : "Kirim Undangan Kencan"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              Lanjut Swipe Dulu
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
