"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Check,
  Quote,
  ChevronDown,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { uploadSupportingPhotos } from "@/lib/storage";

interface PhotoItem {
  url: string;
  file?: File;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  initialData: {
    bio: string;
    interests: string[];
    photos: string[];
    avatarUrl: string;
    city: string;
    prompts?: { question: string; answer: string }[];
  };
  onSave: (updatedData: {
    bio: string;
    interests: string[];
    photos: string[];
    city: string;
    prompts: { question: string; answer: string }[];
  }) => Promise<void>;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".heif"];

const ALL_INTERESTS = [
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
  { id: "tech", label: "Teknologi", icon: "💻" },
];

export const PROMPT_QUESTIONS = [
  "Tempat kencan pertama idealku adalah...",
  "Aku yang menentukan tempat kencan karena...",
  "Topik yang bikin aku betah ngobrol berjam-jam...",
  "Kamu pasti cocok denganku kalau...",
  "Kopi atau minuman wajibku saat nongkrong...",
  "Hal yang paling aku cari saat kencan offline...",
];

export const CITIES = [
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Bandung",
];

export default function ProfileEditModal({
  isOpen,
  onClose,
  userId = "user-default",
  initialData,
  onSave,
}: ProfileEditModalProps) {
  const [bio, setBio] = useState(initialData.bio || "");
  const [interests, setInterests] = useState<string[]>(initialData.interests || []);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [city, setCity] = useState(initialData.city || "Jakarta Selatan");
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Track which prompt's dropdown is currently open (null, 0, 1, ...)
  const [openPromptDropdownIdx, setOpenPromptDropdownIdx] = useState<number | null>(null);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Prompts State (Max 5 prompts)
  const [prompts, setPrompts] = useState<{ question: string; answer: string }[]>(
    initialData.prompts && initialData.prompts.length > 0
      ? initialData.prompts
      : [
          {
            question: PROMPT_QUESTIONS[0],
            answer: "",
          },
        ]
  );

  const [isSaving, setIsSaving] = useState(false);

  // Synchronize form state with latest initialData whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setBio(initialData.bio || "");
      setInterests(initialData.interests || []);
      setPhotos((initialData.photos || []).map((url) => ({ url })));
      setCity(initialData.city || "Jakarta Selatan");
      setPrompts(
        initialData.prompts && initialData.prompts.length > 0
          ? initialData.prompts
          : [
              {
                question: PROMPT_QUESTIONS[0],
                answer: "",
              },
            ]
      );
      setOpenPromptDropdownIdx(null);
      setIsCityDropdownOpen(false);
      setPhotoError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests((prev) => prev.filter((item) => item !== id));
    } else {
      if (interests.length >= 6) return;
      setInterests((prev) => [...prev, id]);
    }
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPhotoError(null);

    const newPhotoItems: PhotoItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileNameLower = file.name.toLowerCase();
      const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
      const isImageMime =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.type.startsWith("image/");

      // 1. Validasi Tipe Format File (JPG, PNG, HEIC iPhone)
      if (!isImageMime && !hasValidExt) {
        setPhotoError("Format foto harus berupa JPG, PNG, atau HEIC (iPhone).");
        continue;
      }

      // 2. Validasi Batas Ukuran File (Maks 5 MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setPhotoError(`Foto "${file.name}" melebihi batas maksimal ${MAX_FILE_SIZE_MB} MB.`);
        continue;
      }

      if (photos.length + newPhotoItems.length < 3) {
        newPhotoItems.push({
          url: URL.createObjectURL(file),
          file,
        });
      }
    }

    setPhotos((prev) => [...prev, ...newPhotoItems].slice(0, 3));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoError(null);
  };

  const handleSelectQuestion = (index: number, question: string) => {
    setPrompts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], question };
      return updated;
    });
    setOpenPromptDropdownIdx(null);
  };

  const handlePromptAnswerChange = (index: number, answer: string) => {
    setPrompts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], answer };
      return updated;
    });
  };

  const handleAddPrompt = () => {
    if (prompts.length >= 5) return;
    const unusedQuestion =
      PROMPT_QUESTIONS.find((q) => !prompts.some((p) => p.question === q)) ||
      PROMPT_QUESTIONS[0];

    setPrompts((prev) => [
      ...prev,
      {
        question: unusedQuestion,
        answer: "",
      },
    ]);
  };

  const handleRemovePrompt = (index: number) => {
    setPrompts((prev) => prev.filter((_, i) => i !== index));
    if (openPromptDropdownIdx === index) {
      setOpenPromptDropdownIdx(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Process and upload any new supporting photo files to Supabase Storage
      const finalPhotoUrls: string[] = [];

      for (const item of photos) {
        if (item.file && userId) {
          const uploadedUrls = await uploadSupportingPhotos(userId, [item.file]);
          if (uploadedUrls.length > 0) {
            finalPhotoUrls.push(uploadedUrls[0]);
          }
        } else if (item.url && !item.url.startsWith("blob:")) {
          finalPhotoUrls.push(item.url);
        }
      }

      // 2. Save profile updates to PostgreSQL
      await onSave({
        bio: bio.trim(),
        interests,
        photos: finalPhotoUrls,
        city,
        prompts: prompts.filter((p) => p.answer.trim().length > 0),
      });
      onClose();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="relative w-full max-w-md h-full sm:h-[88vh] sm:rounded-[36px] bg-white dark:bg-zinc-900 overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Edit Profil Kencan
            </h2>
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
            {/* Section: Photos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Foto Profil & Galeri
                </label>
                <span className="text-[10px] text-zinc-400">JPG, PNG, HEIC (Maks {MAX_FILE_SIZE_MB}MB)</span>
              </div>

              {/* Photo Error Pill */}
              {photoError && (
                <div className="mb-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs animate-shake w-full">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                {/* Main Selfie Slot (Fixed) */}
                <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-rose-500 bg-zinc-800 shadow-sm flex items-center justify-center">
                  {initialData.avatarUrl ? (
                    <img
                      src={initialData.avatarUrl}
                      alt="Main Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center text-zinc-400">
                      <span className="text-xl font-bold text-white">📸</span>
                      <span className="text-[9px] text-zinc-400 mt-0.5">Selfie Live</span>
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    UTAMA
                  </div>
                </div>

                {/* Supporting Photos */}
                {photos.map((item, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-800 group"
                  >
                    <img
                      src={item.url}
                      alt={`Supporting ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Empty Slots */}
                {photos.length < 2 && (
                  <label className="relative aspect-square rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-rose-400 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                    <Plus className="w-5 h-5 text-zinc-400 group-hover:text-rose-500 mb-1 transition-colors" />
                    <span className="text-[10px] font-semibold text-zinc-400">
                      Tambah
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/heic, image/heif, .heic, .heif, .jpg, .jpeg, .png"
                      multiple
                      className="hidden"
                      onChange={handleAddPhoto}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Section: Bio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Tentang Saya (Bio)
                </label>
                <span className="text-[10px] text-zinc-400">
                  {bio.length}/140
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={140}
                placeholder="Ceritakan sedikit tentang dirimu..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            {/* ================= SECTION: DATING PROMPTS (UP TO 5 PROMPTS) ================= */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Kutipan & Prompts Kencan
                  </label>
                  <span className="text-[10px] text-zinc-500 font-bold">
                    ({prompts.length}/5)
                  </span>
                </div>
                {prompts.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddPrompt}
                    className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Prompt</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {prompts.map((prompt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 relative flex flex-col gap-2"
                  >
                    {/* Themed Custom Question Selector Button */}
                    <div className="relative">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenPromptDropdownIdx(
                              openPromptDropdownIdx === idx ? null : idx
                            )
                          }
                          className="flex-1 flex items-center justify-between gap-1.5 p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/50 text-left transition-all hover:bg-rose-100/60"
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 dark:text-rose-400 line-clamp-1">
                            <Quote className="w-3.5 h-3.5 shrink-0" />
                            <span>{prompt.question}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-rose-500 shrink-0 transition-transform duration-200 ${
                              openPromptDropdownIdx === idx ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {prompts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePrompt(idx)}
                            className="w-8 h-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-colors shrink-0"
                            title="Hapus Prompt"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Custom Themed Popover Menu for Prompt Questions */}
                      <AnimatePresence>
                        {openPromptDropdownIdx === idx && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-zinc-900/95 dark:bg-zinc-900/98 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 max-h-52 overflow-y-auto"
                          >
                            {PROMPT_QUESTIONS.map((q) => {
                              const isSelected = prompt.question === q;
                              return (
                                <button
                                  key={q}
                                  type="button"
                                  onClick={() => handleSelectQuestion(idx, q)}
                                  className={`w-full p-2.5 rounded-xl text-xs text-left transition-colors flex items-center justify-between gap-2 ${
                                    isSelected
                                      ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40"
                                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                  }`}
                                >
                                  <span>{q}</span>
                                  {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Answer Input */}
                    <textarea
                      rows={2}
                      maxLength={120}
                      placeholder="Tuliskan jawaban unikmu di sini..."
                      value={prompt.answer}
                      onChange={(e) =>
                        handlePromptAnswerChange(idx, e.target.value)
                      }
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Interests */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Minat & Topik Obrolan
                </label>
                <span className="text-[11px] font-bold text-rose-500">
                  {interests.length}/6
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ALL_INTERESTS.map((item) => {
                  const isSelected = interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: City (Themed Custom Dropdown) */}
            <div className="relative">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Area Kencan Utama
              </label>

              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="w-full h-11 px-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{city}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                    isCityDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Custom Popover for City */}
              <AnimatePresence>
                {isCityDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-zinc-900/95 dark:bg-zinc-900/98 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 max-h-48 overflow-y-auto"
                  >
                    {CITIES.map((c) => {
                      const isSelected = city === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCity(c);
                            setIsCityDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-xs text-left transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40"
                              : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          <span>{c}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSaving}
              onClick={handleSave}
            >
              Simpan Perubahan
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
