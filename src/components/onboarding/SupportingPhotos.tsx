"use client";

import React, { useState } from "react";
import { Plus, X, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SupportingPhotosProps {
  verifiedSelfieUrl: string;
  onComplete: (photoFiles: Blob[], photoPreviews: string[]) => void;
  onBack: () => void;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".heif"];

export default function SupportingPhotos({
  verifiedSelfieUrl,
  onComplete,
  onBack,
}: SupportingPhotosProps) {
  const [photoFiles, setPhotoFiles] = useState<Blob[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const newFiles: Blob[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileNameLower = file.name.toLowerCase();
      const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
      const isImageMime = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/heic" || file.type === "image/heif" || file.type.startsWith("image/");

      // 1. Validasi Tipe Format File (JPG, PNG, HEIC iPhone)
      if (!isImageMime && !hasValidExt) {
        setErrorMessage("Format foto harus berupa JPG, PNG, atau HEIC (iPhone).");
        continue;
      }

      // 2. Validasi Batas Ukuran File (Maks 5 MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`Foto "${file.name}" melebihi batas maksimal ${MAX_FILE_SIZE_MB} MB.`);
        continue;
      }

      if (photoFiles.length + newFiles.length < 3) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setPhotoFiles((prev) => [...prev, ...newFiles].slice(0, 3));
    setPreviewUrls((prev) => [...prev, ...newPreviews].slice(0, 3));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col flex-1 justify-between px-6 pb-6 text-center">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Foto Pendukung
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
          Tambahkan hingga 3 foto gaya hidup, hobi, atau liburanmu (maks {MAX_FILE_SIZE_MB} MB per foto).
        </p>

        {/* Error Notification Pill */}
        {errorMessage && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs text-left animate-shake">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Photos Grid */}
        <div className="grid grid-cols-2 gap-3.5 mt-6">
          {/* Main Verified Selfie Box (Locked as #1) */}
          <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-rose-500 shadow-md">
            <img
              src={verifiedSelfieUrl}
              alt="Main Verified Selfie"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              UTAMA
            </div>
          </div>

          {/* Supporting Photo Slots */}
          {previewUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xs group bg-zinc-100 dark:bg-zinc-800"
            >
              <img
                src={url}
                alt={`Supporting ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-rose-500 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Upload Button Slot */}
          {photoFiles.length < 3 && (
            <label className="relative aspect-square rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-rose-400 dark:hover:border-rose-500 bg-zinc-50 dark:bg-zinc-800/40 flex flex-col items-center justify-center cursor-pointer transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-rose-500 transition-colors mb-2">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                Pilih Foto
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                JPG, PNG, HEIC (iPhone)
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

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => onComplete(photoFiles, previewUrls)}
        >
          {photoFiles.length > 0 ? "Lanjut ke Minat Kencan" : "Lewati & Lanjut"}
        </Button>

        <Button variant="ghost" size="sm" fullWidth onClick={onBack}>
          Ambil Ulang Selfie
        </Button>
      </div>
    </div>
  );
}
