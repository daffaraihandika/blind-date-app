"use client";

import React, { useState } from "react";
import { Edit3, Eye, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProfileHeroProps {
  fullName: string;
  age: number;
  city: string;
  gender: string;
  avatarUrl?: string;
  onEditClick: () => void;
  onPreviewClick: () => void;
}

function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileHero({
  fullName,
  age,
  city,
  gender,
  avatarUrl,
  onEditClick,
  onPreviewClick,
}: ProfileHeroProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(fullName);

  return (
    <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/80">
      {/* Avatar with glowing ring or initials fallback */}
      <div className="relative mb-4">
        <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-rose-600 to-orange-400 shadow-xl shadow-rose-500/25">
          {avatarUrl && !imageError ? (
            <img
              src={avatarUrl}
              alt={fullName}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover rounded-full bg-zinc-800"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-white text-3xl font-extrabold tracking-wider select-none">
              {initials}
            </div>
          )}
        </div>

        {/* Verified Badge */}
        <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-zinc-900">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      {/* Name and Age */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {fullName}
        </h1>
        <span className="text-xl font-light text-zinc-500 dark:text-zinc-400">
          {age > 0 ? age : 24}
        </span>
      </div>

      {/* City & Gender Role Badge */}
      <div className="flex items-center gap-2 mt-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
          <MapPin className="w-3 h-3 text-rose-500" />
          {city || "Jakarta Selatan"}
        </span>

        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[11px] font-semibold text-rose-600 dark:text-rose-300">
          {gender === "female" ? "👩 Penentu Kafe" : "👨 Penerima Undangan"}
        </span>
      </div>

      {/* Action Buttons: Edit & Preview */}
      <div className="flex items-center gap-3 w-full max-w-xs mt-6">
        <Button
          variant="outline"
          size="md"
          className="flex-1 text-xs"
          onClick={onEditClick}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Edit Profil
        </Button>

        <Button
          variant="secondary"
          size="md"
          className="flex-1 text-xs"
          onClick={onPreviewClick}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Preview Kartu
        </Button>
      </div>
    </div>
  );
}
