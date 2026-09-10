"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Check } from "lucide-react";

export const CITIES = [
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Bandung",
];

interface CityFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export default function CityFilterModal({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
}: CityFilterModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                Pilih Wilayah Kencan
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Cari calon kencan di area sekitarmu
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* City Options List */}
          <div className="flex flex-col gap-2 py-1">
            {CITIES.map((city) => {
              const isSelected = city.toLowerCase() === selectedCity.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onSelectCity(city);
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md"
                      : "bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200/60 dark:border-zinc-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin
                      className={`w-4 h-4 ${
                        isSelected ? "text-white" : "text-rose-500"
                      }`}
                    />
                    <span>{city}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
