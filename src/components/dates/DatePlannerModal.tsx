"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Coffee,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Send,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Venue } from "@/types/date";
import { fetchVenuesByCity, createDateInvitation } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";

interface DatePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  city: string;
  onInvitationSent?: () => void;
}

const TIME_SLOTS = [
  { id: "16:00 WIB", label: "16:00 WIB (Sore Santai)", desc: "Cocok untuk kopi & ngobrol sore" },
  { id: "19:00 WIB", label: "19:00 WIB (Malam)", desc: "Suasana santai setelah beraktivitas" },
  { id: "14:00 WIB", label: "14:00 WIB (Siang)", desc: "Waktu kencan cerah di akhir pekan" },
];

function getUpcomingDays() {
  const days = [];
  const today = new Date();
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    days.push({
      dateStr,
      label: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
      isWeekend,
    });
  }
  return days;
}

export default function DatePlannerModal({
  isOpen,
  onClose,
  matchId,
  partnerId,
  partnerName,
  partnerAvatar,
  city = "Jakarta Selatan",
  onInvitationSent,
}: DatePlannerModalProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedSubArea, setSelectedSubArea] = useState<string>("Semua");
  const [venueSearch, setVenueSearch] = useState<string>("");
  const [selectedVenueName, setSelectedVenueName] = useState<string>("");

  const upcomingDays = getUpcomingDays();
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDays[0]?.dateStr || "");
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0].id);

  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Load curated venues when modal opens
  useEffect(() => {
    if (isOpen) {
      async function load() {
        setIsLoadingVenues(true);
        const data = await fetchVenuesByCity(city);
        setVenues(data);
        if (data.length > 0) {
          setSelectedVenueName(data[0].name);
        }
        setIsLoadingVenues(false);
      }
      load();
      setErrorMessage(null);
    }
  }, [isOpen, city]);

  if (!isOpen) return null;

  // Extract unique sub-areas for quick filtering
  const subAreas = ["Semua", ...Array.from(new Set(venues.map((v) => v.area).filter(Boolean)))];

  // Filtered venues list
  const filteredVenues = venues.filter((v) => {
    const matchesArea = selectedSubArea === "Semua" || v.area === selectedSubArea;
    const matchesSearch = v.name.toLowerCase().includes(venueSearch.toLowerCase()) || (v.area && v.area.toLowerCase().includes(venueSearch.toLowerCase()));
    return matchesArea && matchesSearch;
  });

  const handleSubmit = async () => {
    if (!selectedVenueName.trim()) {
      setErrorMessage("Silakan pilih atau ketik nama tempat kencan.");
      return;
    }
    if (!selectedDate) {
      setErrorMessage("Silakan pilih tanggal kencan.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("Sesi login berakhir. Silakan login kembali.");
        return;
      }

      const res = await createDateInvitation({
        matchId,
        inviterId: user.id,
        inviteeId: partnerId,
        venueName: selectedVenueName.trim(),
        city,
        dateSlot: selectedDate,
        timeSlot: selectedTime,
      });

      if (res.success) {
        onClose();
        if (onInvitationSent) onInvitationSent();
      } else {
        setErrorMessage(res.error || "Gagal mengirim undangan kencan.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md h-[90vh] sm:h-[88vh] sm:rounded-[36px] bg-white dark:bg-zinc-900 overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">
                  Atur Kencan Offline
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Bersama <span className="font-bold text-rose-500">{partnerName}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-left no-scrollbar">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* SECTION 1: VENUE SELECTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  1. Pilih Tempat / Coffee Shop
                </label>
                <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {city}
                </span>
              </div>

              {/* Custom Input Field (Can be typed manually or filled by chips) */}
              <div className="relative mb-3">
                <Input
                  label=""
                  placeholder="Ketik nama kafe favoritmu..."
                  value={selectedVenueName}
                  onChange={(e) => setSelectedVenueName(e.target.value)}
                  leftIcon={<Coffee className="w-4 h-4 text-rose-500" />}
                />
              </div>

              {/* Sub-Area Filter Chips */}
              {subAreas.length > 2 && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-2.5">
                  {subAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setSelectedSubArea(area as string)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                        selectedSubArea === area
                          ? "bg-rose-500 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              )}

              {/* Curated Recommendations Grid Chips */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Rekomendasi Terkurasi di {city}:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 no-scrollbar">
                  {isLoadingVenues ? (
                    <div className="text-xs text-zinc-400 py-2">Memuat rekomendasi kafe...</div>
                  ) : filteredVenues.length > 0 ? (
                    filteredVenues.map((v) => {
                      const isSelected = selectedVenueName === v.name;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVenueName(v.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60"
                          }`}
                        >
                          <span>☕</span>
                          <span>{v.name}</span>
                          {v.area && (
                            <span className="text-[9px] opacity-75 font-normal">
                              ({v.area})
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-xs text-zinc-400 py-1">Tidak ada kafe yang cocok dengan pencarian.</div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: DATE PICKER */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                2. Pilih Tanggal Kencan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {upcomingDays.slice(0, 4).map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`p-3 rounded-2xl flex flex-col items-start text-left transition-all ${
                        isSelected
                          ? "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-600 dark:text-rose-300 shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold">{d.label}</span>
                        {d.isWeekend && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-300">
                            Weekend
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: TIME SLOT PICKER */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                3. Pilih Jam Kencan
              </label>
              <div className="flex flex-col gap-2">
                {TIME_SLOTS.map((t) => {
                  const isSelected = selectedTime === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTime(t.id)}
                      className={`p-3 rounded-2xl flex items-center justify-between transition-all text-left ${
                        isSelected
                          ? "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-600 dark:text-rose-300 shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-rose-500" />
                        <div>
                          <span className="text-xs font-bold block">{t.label}</span>
                          <span className="text-[10px] text-zinc-400">{t.desc}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SAFETY NOTICE BANNER */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-800 dark:text-emerald-200 leading-relaxed">
                <strong>Standar Keamanan:</strong> Kencan selalu diadakan di tempat publik yang ramai demi kenyamanan kedua pihak.
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
              onClick={handleSubmit}
            >
              Kirim Undangan Kencan
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
