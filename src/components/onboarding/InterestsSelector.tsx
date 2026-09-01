"use client";

import React, { useState } from "react";
import { Sparkles, MapPin, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InterestsSelectorProps {
  onComplete: (data: { interests: string[]; bio: string; city: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const AVAILABLE_INTERESTS = [
  { id: "coffee", label: "Ngopi Santai", icon: "☕" },
  { id: "foodie", label: "Wisata Kuliner", icon: "🍕" },
  { id: "padel", label: "Padel", icon: "🎾" },
  { id: "gym", label: "Gym & Fitness", icon: "🏋️" },
  { id: "football", label: "Sepak Bola", icon: "⚽" },
  { id: "badminton", label: "Badminton", icon: "🏸" },
  { id: "running", label: "Jogging", icon: "🏃" },
  { id: "cinema", label: "Nonton Film", icon: "🎬" },
  { id: "music", label: "Musik Indie", icon: "🎵" },
  { id: "books", label: "Buku & Baca", icon: "📚" },
  { id: "travel", label: "Traveling", icon: "✈️" },
  { id: "art", label: "Museum & Seni", icon: "🎨" },
  { id: "pets", label: "Pecinta Hewan", icon: "🐾" },
  { id: "boardgames", label: "Board Games", icon: "🎲" },
  { id: "cooking", label: "Masak", icon: "🍳" },
  { id: "photography", label: "Fotografi", icon: "📷" },
  { id: "tech", label: "Teknologi & Koding", icon: "💻" },
];

const CITIES = [
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Bandung",
];

export default function InterestsSelector({
  onComplete,
  onBack,
  isLoading = false,
}: InterestsSelectorProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "coffee",
    "foodie",
  ]);
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("Jakarta Selatan");
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedInterests.length >= 6) {
        setError("Maksimal memilih 6 minat.");
        return;
      }
      setError(null);
      setSelectedInterests((prev) => [...prev, id]);
    }
  };

  const handleFinish = () => {
    if (selectedInterests.length < 2) {
      setError("Pilih minimal 2 minat untuk mencocokkan calon kencan.");
      return;
    }

    onComplete({
      interests: selectedInterests,
      bio: bio.trim() || "Suka ngopi dan diskusi hal-hal seru.",
      city: city,
    });
  };

  return (
    <div className="flex flex-col flex-1 justify-between px-6 pb-6 text-left">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Minat & Area Kencan
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Bantu kami mencocokkan topik obrolan kencan pertamamu.
          </p>
        </div>

        {/* City Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Area Kencan Utama</span>
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Interests Chips Grid */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pilih Minat & Hobi
            </label>
            <span className="text-[11px] font-bold text-rose-500">
              {selectedInterests.length}/6 dipilih
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 py-1">
            {AVAILABLE_INTERESTS.map((item) => {
              const isSelected = selectedInterests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]"
                      : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 border border-zinc-200/60 dark:border-zinc-700/60"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* Bio Textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Bio Singkat (1–2 Kalimat)
          </label>
          <textarea
            rows={3}
            maxLength={140}
            placeholder="Contoh: Pecinta manual brew coffee & suka diskusi seputar film sci-fi."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
          />
          <span className="text-[10px] text-zinc-400 text-right">
            {bio.length}/140 karakter
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          size="md"
          className="flex-1"
          onClick={onBack}
          disabled={isLoading}
        >
          Kembali
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          isLoading={isLoading}
          onClick={handleFinish}
          rightIcon={<Heart className="w-4 h-4 fill-white" />}
        >
          Selesaikan Profil
        </Button>
      </div>
    </div>
  );
}
