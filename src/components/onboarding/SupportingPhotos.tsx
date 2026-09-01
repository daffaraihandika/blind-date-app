"use client";

import React, { useState } from "react";
import { Plus, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SupportingPhotosProps {
  verifiedSelfieUrl: string;
  onComplete: (photoFiles: Blob[], photoPreviews: string[]) => void;
  onBack: () => void;
}

export default function SupportingPhotos({
  verifiedSelfieUrl,
  onComplete,
  onBack,
}: SupportingPhotosProps) {
  const [photoFiles, setPhotoFiles] = useState<Blob[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: Blob[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (photoFiles.length + newFiles.length < 3) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    setPhotoFiles((prev) => [...prev, ...newFiles].slice(0, 3));
    setPreviewUrls((prev) => [...prev, ...newPreviews].slice(0, 3));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col flex-1 justify-between px-6 pb-6 text-center">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Foto Pendukung
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
          Tambahkan hingga 3 foto gaya hidup, hobi, atau liburanmu (opsional).
        </p>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 gap-3.5 mt-6">
          {/* Main Verified Selfie Box (Locked as #1) */}
          <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-rose-500 shadow-md">
            <img
              src={verifiedSelfieUrl}
              alt="Main Verified Selfie"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
              UTAMA
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
              <span className="text-[10px] text-white font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                Live Selfie
              </span>
            </div>
          </div>

          {/* Uploaded Supporting Photos Slots */}
          {previewUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm group"
            >
              <img
                src={url}
                alt={`Supporting ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white rounded-full flex items-center justify-center transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Empty Upload Slots */}
          {photoFiles.length < 3 && (
            <label className="relative aspect-square rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-rose-400 dark:hover:border-rose-500 bg-zinc-50/50 dark:bg-zinc-800/40 flex flex-col items-center justify-center cursor-pointer transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-rose-500 group-hover:scale-110 transition-transform mb-1.5">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Tambah Foto
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAddPhoto}
              />
            </label>
          )}
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-3.5 mt-5 text-left flex items-start gap-2.5 border border-zinc-200/60 dark:border-zinc-700/60">
          <ImageIcon className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
            Foto pendukung membuat profilmu lebih menarik dan memberikan topik obrolan saat kencan nanti.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" size="md" className="flex-1" onClick={onBack}>
          Kembali
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={() => onComplete(photoFiles, previewUrls)}
        >
          {photoFiles.length === 0 ? "Lewati & Lanjut" : "Lanjut ke Minat"}
        </Button>
      </div>
    </div>
  );
}
