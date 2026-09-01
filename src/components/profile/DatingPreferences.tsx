"use client";

import React from "react";
import { Coffee, ShieldCheck, HeartHandshake, MapPin } from "lucide-react";

interface DatingPreferencesProps {
  gender: string;
  city: string;
}

export default function DatingPreferences({
  gender,
  city,
}: DatingPreferencesProps) {
  const isFemale = gender === "female";

  return (
    <div className="p-5 text-left flex flex-col gap-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/80">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Aturan & Preferensi Kencan
        </h3>
        <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>BlindDate Rules</span>
        </span>
      </div>

      {/* Role Explanation Card */}
      <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Coffee className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <span className="font-bold text-rose-700 dark:text-rose-300 block mb-0.5">
            {isFemale ? "Peranmu: Menentukan Tempat Kencan" : "Peranmu: Menerima Undangan Kencan"}
          </span>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {isFemale
              ? "Saat match terjadi, kamu yang memiliki hak penuh memilih kafe atau restoran publik yang aman dan nyaman untuk kencan pertamamu."
              : "Saat match terjadi, pasangan wanitamu yang akan menentukan kafe/resto kencannya. Kamu cukup konfirmasi kehadiran atau ajukan reschedule jika berhalangan."}
          </p>
        </div>
      </div>

      {/* Trust & Safety Highlights */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tempat Publik</span>
          </div>
          <span className="text-[10px] text-zinc-400 leading-tight">
            Semua kencan diarahkan di kafe/resto ramai demi keselamatan.
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Area {city}</span>
          </div>
          <span className="text-[10px] text-zinc-400 leading-tight">
            Mencocokkan calon kencan dalam radius terdekat di kotamu.
          </span>
        </div>
      </div>
    </div>
  );
}
