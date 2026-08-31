"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Sparkles, ShieldCheck, MapPin, Coffee, ArrowRight } from "lucide-react";
import MobileContainer from "@/components/layout/MobileContainer";
import { Button } from "@/components/ui/Button";

export default function WelcomePage() {
  return (
    <MobileContainer>
      <div className="flex flex-col flex-1 justify-between p-6 pt-10 text-center select-none">
        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 text-[11px] font-bold text-rose-600 dark:text-rose-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Blind Date App Indonesia</span>
          </div>
        </motion.div>

        {/* Hero Visual Area */}
        <div className="relative my-auto py-8 flex flex-col items-center">
          {/* Ambient Glow */}
          <div className="absolute w-44 h-44 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" />

          {/* Center Logo / Avatar composition */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative z-10 w-28 h-28 rounded-[32px] bg-gradient-to-br from-rose-500 via-rose-600 to-orange-400 p-1 shadow-xl shadow-rose-500/30 flex items-center justify-center"
          >
            <div className="w-full h-full rounded-[28px] bg-white/10 backdrop-blur-xs flex items-center justify-center">
              <Heart className="w-14 h-14 text-white fill-white/90" />
            </div>

            {/* Floating Mini Badges */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 -right-3 bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-700"
            >
              <Coffee className="w-5 h-5 text-amber-500" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-2 -left-3 bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-700"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-8 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Temukan Kencan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500">
              Nyata & Tanpa Basa-Basi
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed"
          >
            Bukan sekadar aplikasi chat. Swipe, match, dan langsung tentukan kafe kencanmu dengan profil terverifikasi selfie live.
          </motion.p>

          {/* Quick Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="grid grid-cols-3 gap-2 mt-6 w-full max-w-xs"
          >
            <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-rose-500 mb-1" />
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                Selfie Asli
              </span>
              <span className="text-[9px] text-zinc-400">Anti Catfish</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col items-center">
              <MapPin className="w-4 h-4 text-orange-500 mb-1" />
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                Tempat Kafe
              </span>
              <span className="text-[9px] text-zinc-400">Dipilih Cewek</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col items-center">
              <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                Mulai 5 Rb
              </span>
              <span className="text-[9px] text-zinc-400">Paket Pro</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="flex flex-col gap-3 pb-2"
        >
          <Link href="/signup" className="w-full">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Mulai Sekarang (Daftar)
            </Button>
          </Link>

          <Link href="/login" className="w-full">
            <Button variant="outline" size="md" fullWidth>
              Sudah Punya Akun? Masuk
            </Button>
          </Link>

          <p className="text-[10px] text-zinc-400 mt-1">
            Khusus usia 18+ tahun. Menjunjung tinggi keamanan & privasi.
          </p>
        </motion.div>
      </div>
    </MobileContainer>
  );
}
