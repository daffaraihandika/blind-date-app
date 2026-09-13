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
  ChevronDown,
  Check,
  Navigation,
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

const CITIES = [
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Bandung",
];

const TIME_PRESETS = [
  { id: "16:00 WIB", time24: "16:00", label: "Sore Santai" },
  { id: "19:00 WIB", time24: "19:00", label: "Malam Hari" },
  { id: "14:00 WIB", time24: "14:00", label: "Siang Santai" },
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
      shortLabel: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
      isWeekend,
    });
  }
  return days;
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
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
  const [selectedCity, setSelectedCity] = useState<string>(city || "Jakarta Selatan");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [venueSearch, setVenueSearch] = useState<string>("");
  const [selectedVenueName, setSelectedVenueName] = useState<string>("");

  const upcomingDays = getUpcomingDays();
  const todayDateStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDays[0]?.dateStr || todayDateStr);

  const [selectedTime, setSelectedTime] = useState<string>(TIME_PRESETS[0].id);
  const [customTimeInput, setCustomTimeInput] = useState<string>("16:00");

  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Synchronize city prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCity(city || "Jakarta Selatan");
    }
  }, [isOpen, city]);

  // Load curated venues when selectedCity changes
  useEffect(() => {
    if (isOpen && selectedCity) {
      async function load() {
        setIsLoadingVenues(true);
        const data = await fetchVenuesByCity(selectedCity);
        setVenues(data);
        if (data.length > 0) {
          setSelectedVenueName(data[0].name);
        } else {
          setSelectedVenueName("");
        }
        setIsLoadingVenues(false);
      }
      load();
      setErrorMessage(null);
    }
  }, [isOpen, selectedCity]);

  if (!isOpen) return null;

  // Filtered venues list based on search query (No sub-area grouping)
  const filteredVenues = venues.filter((v) => {
    if (!venueSearch.trim()) return true;
    const q = venueSearch.toLowerCase();
    return v.name.toLowerCase().includes(q) || (v.area && v.area.toLowerCase().includes(q));
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
    if (!selectedTime) {
      setErrorMessage("Silakan tentukan jam kencan.");
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
        city: selectedCity,
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
          className="relative w-full max-w-md h-[92vh] sm:h-[88vh] sm:rounded-[36px] bg-white dark:bg-zinc-900 overflow-hidden flex flex-col shadow-2xl"
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
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6 text-left no-scrollbar">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* SECTION 1: VENUE & CITY SELECTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  1. Pilih Tempat / Coffee Shop
                </label>

                {/* Interactive City Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                  >
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>{selectedCity}</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>

                  {/* Popover Menu for Cities */}
                  <AnimatePresence>
                    {isCityDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-zinc-900 border border-rose-500/30 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 max-h-48 overflow-y-auto"
                      >
                        {CITIES.map((c) => {
                          const isSelected = selectedCity === c;
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setSelectedCity(c);
                                setIsCityDropdownOpen(false);
                              }}
                              className={`w-full p-2 rounded-xl text-xs text-left transition-colors flex items-center justify-between ${
                                isSelected
                                  ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40"
                                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                              }`}
                            >
                              <span>{c}</span>
                              {isSelected && <Check className="w-3 h-3 text-rose-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Custom Input Field (Can be typed manually or filled by recommendations) */}
              <div className="relative mb-2">
                <Input
                  label=""
                  placeholder="Ketik nama tempat pilihanmu..."
                  value={selectedVenueName}
                  onChange={(e) => setSelectedVenueName(e.target.value)}
                  leftIcon={<Coffee className="w-4 h-4 text-rose-500" />}
                />
                {selectedVenueName.trim().length > 0 && (
                  <div className="mt-1 flex items-center justify-end">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${selectedVenueName} ${selectedCity}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:underline"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Cek &quot;{selectedVenueName}&quot; di Google Maps ↗</span>
                    </a>
                  </div>
                )}
              </div>

              {/* All Curated Recommendations List with Google Maps Links */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Rekomendasi Kafe di {selectedCity}:
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {filteredVenues.length} tempat
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto p-0.5 no-scrollbar">
                  {isLoadingVenues ? (
                    <div className="text-xs text-zinc-400 py-3 text-center">
                      Memuat rekomendasi kafe...
                    </div>
                  ) : filteredVenues.length > 0 ? (
                    filteredVenues.map((v) => {
                      const isSelected = selectedVenueName.trim().toLowerCase() === v.name.toLowerCase();
                      const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${v.name} ${selectedCity}`
                      )}`;

                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVenueName(v.name)}
                          className={`p-2.5 px-3 rounded-2xl transition-all flex items-center justify-between cursor-pointer border ${
                            isSelected
                              ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 text-zinc-900 dark:text-zinc-50 shadow-xs"
                              : "bg-zinc-50 dark:bg-zinc-800/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                                isSelected
                                  ? "bg-rose-500 text-white"
                                  : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              ☕
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">{v.name}</span>
                              {v.area && (
                                <span className="text-[10px] text-zinc-400 block truncate">
                                  {v.area}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Google Maps Button */}
                            <a
                              href={gmapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-zinc-200/80 dark:border-zinc-700 flex items-center gap-1 transition-all shadow-xs"
                              title="Buka lokasi di Google Maps"
                            >
                              <Navigation className="w-2.5 h-2.5 text-rose-500" />
                              <span>Maps</span>
                            </a>

                            {/* Checkmark when selected */}
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-zinc-400 py-3 text-center">
                      Tidak ada rekomendasi kafe yang cocok.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: FLEXIBLE DATE PICKER */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  2. Pilih Tanggal Kencan
                </label>
                {selectedDate && (
                  <span className="text-[11px] font-bold text-rose-500">
                    {formatDateLabel(selectedDate)}
                  </span>
                )}
              </div>

              {/* Quick Day Chips */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-2.5">
                {upcomingDays.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-rose-500 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60"
                      }`}
                    >
                      <span>{d.shortLabel}</span>
                      {d.isWeekend && (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                            isSelected
                              ? "bg-white/25 text-white"
                              : "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          Wknd
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Input for Free Date Picking */}
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <Calendar className="w-4 h-4 text-rose-500 shrink-0 ml-1" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Atur tanggal sendiri:
                  </span>
                  <input
                    type="date"
                    min={todayDateStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: FLEXIBLE TIME PICKER */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  3. Pilih Waktu Kencan
                </label>
                {selectedTime && (
                  <span className="text-[11px] font-bold text-rose-500">
                    {selectedTime}
                  </span>
                )}
              </div>

              {/* Quick Time Preset Chips */}
              <div className="grid grid-cols-3 gap-2 mb-2.5">
                {TIME_PRESETS.map((t) => {
                  const isSelected = selectedTime === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTime(t.id);
                        setCustomTimeInput(t.time24);
                      }}
                      className={`py-2 px-2 rounded-xl text-center transition-all ${
                        isSelected
                          ? "bg-rose-500 text-white font-bold shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60"
                      }`}
                    >
                      <span className="text-xs block">{t.id}</span>
                      <span className={`text-[9px] block ${isSelected ? "text-rose-100" : "text-zinc-400"}`}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Time Input for Free Time Picking */}
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <Clock className="w-4 h-4 text-rose-500 shrink-0 ml-1" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Atur jam sendiri:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={customTimeInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomTimeInput(val);
                        if (val) {
                          setSelectedTime(`${val} WIB`);
                        }
                      }}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-rose-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-zinc-500">WIB</span>
                  </div>
                </div>
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
