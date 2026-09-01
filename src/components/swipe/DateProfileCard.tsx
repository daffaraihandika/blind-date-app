"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import {
  MapPin,
  ChevronDown,
  Quote,
  CheckCircle2,
} from "lucide-react";
import { ProfileFeedCard, SwipeDirection } from "@/types/match";

interface DateProfileCardProps {
  profile: ProfileFeedCard;
  isTopCard: boolean;
  onSwipe: (direction: SwipeDirection) => void;
}

function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DateProfileCard({
  profile,
  isTopCard,
  onSwipe,
}: DateProfileCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Motion values for drag translation & rotation
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const passOpacity = useTransform(x, [-30, -120], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  const hasBio = Boolean(profile.bio && profile.bio.trim().length > 0);
  const hasInterests = Boolean(profile.interests && profile.interests.length > 0);
  const initials = getInitials(profile.fullName);

  return (
    <motion.div
      ref={cardRef}
      style={{
        x: isTopCard ? x : 0,
        rotate: isTopCard ? rotate : 0,
        zIndex: isTopCard ? 20 : 10,
      }}
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTopCard ? 1 : 0.95, y: isTopCard ? 0 : 8, opacity: 1 }}
      animate={{ scale: isTopCard ? 1 : 0.95, y: isTopCard ? 0 : 8, opacity: 1 }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        transition: { duration: 0.25 },
      }}
      className="absolute inset-0 w-full h-full select-none touch-pan-y"
    >
      {/* Visual Swipe Stamp: LIKE */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-6 z-30 pointer-events-none -rotate-12 border-3 border-emerald-500 bg-emerald-500/20 backdrop-blur-xs px-4 py-1.5 rounded-2xl shadow-xl"
      >
        <span className="text-xl font-black text-emerald-400 tracking-wider flex items-center gap-1.5">
          LIKE 💖
        </span>
      </motion.div>

      {/* Visual Swipe Stamp: PASS */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute top-8 right-6 z-30 pointer-events-none rotate-12 border-3 border-rose-500 bg-rose-500/20 backdrop-blur-xs px-4 py-1.5 rounded-2xl shadow-xl"
      >
        <span className="text-xl font-black text-rose-400 tracking-wider flex items-center gap-1.5">
          PASS ✖️
        </span>
      </motion.div>

      {/* Vertical Scrollable Profile Card Body */}
      <div className="w-full h-full rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl overflow-y-auto overflow-x-hidden relative flex flex-col">
        
        {/* ================= SECTION 1: HERO SELFIE PHOTO ================= */}
        <div className="relative w-full aspect-[3.8/4.6] shrink-0 bg-zinc-950 overflow-hidden flex items-center justify-center">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center text-white text-5xl font-black tracking-wider">
              {initials}
            </div>
          )}

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

          {/* Hero Bottom Info (Name, Age, City) */}
          <div className="absolute bottom-4 inset-x-5 text-white text-left z-10">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
                {profile.fullName}
              </h2>
              <span className="text-2xl font-light opacity-90">{profile.age}</span>
              <CheckCircle2 className="w-5 h-5 text-rose-400 fill-rose-400 shrink-0" />
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-xs text-white/90">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-medium">
                <MapPin className="w-3 h-3 text-rose-400" />
                {profile.city}
              </span>
            </div>

            {/* Scroll Indicator Prompt */}
            <div className="flex items-center justify-center gap-1 text-[10px] text-white/60 font-semibold mt-3 animate-bounce">
              <span>Scroll ke bawah untuk melihat profil</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: ABOUT ME & BIO / INTERESTS ================= */}
        {(hasBio || hasInterests) && (
          <div className="p-5 text-left flex flex-col gap-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/80">
            {/* Show Tentang Saya only if bio is not empty */}
            {hasBio && (
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500 block mb-1">
                  Tentang Saya
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed font-normal">
                  "{profile.bio}"
                </p>
              </div>
            )}

            {/* Interests & Hobbies Chips */}
            {hasInterests && (
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-2">
                  Minat & Topik Obrolan
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 text-rose-700 dark:text-rose-200 text-xs font-semibold shadow-xs"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 3: SUPPORTING PHOTO #1 ================= */}
        {profile.photos && profile.photos[0] && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="w-full aspect-[4/4.5] rounded-3xl overflow-hidden shadow-md bg-zinc-800">
              <img
                src={profile.photos[0]}
                alt={`${profile.fullName} photo 1`}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* ================= SECTION 4: DATE PROMPTS & Q&A ================= */}
        {profile.prompts && profile.prompts.length > 0 && (
          <div className="p-5 text-left flex flex-col gap-3 bg-gradient-to-br from-rose-50/60 to-orange-50/40 dark:from-zinc-900 dark:to-zinc-800/80 border-b border-zinc-100 dark:border-zinc-800/80">
            {profile.prompts.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border border-rose-100 dark:border-zinc-700 shadow-xs"
              >
                <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold mb-1.5">
                  <Quote className="w-3.5 h-3.5" />
                  <span>{p.question}</span>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-100 font-medium leading-relaxed">
                  {p.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ================= SECTION 5: SUPPORTING PHOTO #2 (IF ANY) ================= */}
        {profile.photos && profile.photos[1] && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="w-full aspect-[4/4.5] rounded-3xl overflow-hidden shadow-md bg-zinc-800">
              <img
                src={profile.photos[1]}
                alt={`${profile.fullName} photo 2`}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* Spacer at the bottom so content can scroll past floating buttons */}
        <div className="h-24 shrink-0" />

      </div>
    </motion.div>
  );
}
