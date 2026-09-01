"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import MobileContainer from "@/components/layout/MobileContainer";
import CameraCapture from "@/components/onboarding/CameraCapture";
import SupportingPhotos from "@/components/onboarding/SupportingPhotos";
import InterestsSelector from "@/components/onboarding/InterestsSelector";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { uploadAvatar, uploadSupportingPhotos, completeUserProfile } from "@/lib/storage";

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string>("");
  const [supportingPhotoBlobs, setSupportingPhotoBlobs] = useState<Blob[]>([]);
  const [supportingPhotoPreviews, setSupportingPhotoPreviews] = useState<string[]>([]);
  const [interestsData, setInterestsData] = useState<{
    interests: string[];
    bio: string;
    city: string;
  }>({
    interests: [],
    bio: "",
    city: "Jakarta Selatan",
  });

  const [userId, setUserId] = useState<string>("demo-user");
  const [userName, setUserName] = useState<string>("Kamu");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setUserName(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Kamu"
        );
      }
    }
    loadUser();
  }, [supabase]);

  // Step 1: Live Selfie Complete
  const handleSelfieComplete = (blob: Blob, previewUrl: string) => {
    setSelfieBlob(blob);
    setSelfiePreview(previewUrl);
    setStep(2);
  };

  // Step 2: Supporting Photos Complete
  const handlePhotosComplete = (blobs: Blob[], previews: string[]) => {
    setSupportingPhotoBlobs(blobs);
    setSupportingPhotoPreviews(previews);
    setStep(3);
  };

  // Step 3: Interests and Bio Complete (Final Submit to Cloud)
  const handleInterestsComplete = async (data: {
    interests: string[];
    bio: string;
    city: string;
  }) => {
    setInterestsData(data);
    setIsSubmitting(true);

    try {
      let finalAvatarUrl = selfiePreview;
      let finalSupportingUrls: string[] = supportingPhotoPreviews;

      // If user is real authenticated user and we have the blob
      if (selfieBlob && userId !== "demo-user") {
        // 1. Upload Main Live Selfie
        const uploadResult = await uploadAvatar(userId, selfieBlob, "verified_selfie.jpg");
        if (uploadResult.url) {
          finalAvatarUrl = uploadResult.url;
        }

        // 2. Upload Supporting Photos (if any)
        if (supportingPhotoBlobs.length > 0) {
          finalSupportingUrls = await uploadSupportingPhotos(userId, supportingPhotoBlobs);
        }

        // 3. Update Database Profile
        await completeUserProfile(userId, {
          avatarUrl: finalAvatarUrl,
          supportingPhotos: finalSupportingUrls,
          bio: data.bio,
          city: data.city,
          interests: data.interests,
        });
      }

      setStep(4); // Success Celebration screen
    } catch (err) {
      console.error("Onboarding submit error:", err);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col flex-1 justify-between py-6">
        {/* Top Progress & Title Bar */}
        {step < 4 && (
          <div className="px-6 mb-4">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-2">
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                Langkah {step} dari 3
              </span>
              <span>
                {step === 1 && "Verifikasi Selfie Wajib"}
                {step === 2 && "Foto Tambahan"}
                {step === 3 && "Minat & Bio"}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-1">
              <div
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  step >= 1 ? "bg-gradient-to-r from-rose-500 to-orange-500" : "bg-transparent"
                }`}
              />
              <div
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  step >= 2 ? "bg-gradient-to-r from-rose-500 to-orange-500" : "bg-transparent"
                }`}
              />
              <div
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  step >= 3 ? "bg-gradient-to-r from-rose-500 to-orange-500" : "bg-transparent"
                }`}
              />
            </div>
          </div>
        )}

        {/* Step Views with Framer Motion transitions */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col flex-1"
              >
                <div className="text-center px-6 mb-4">
                  <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    Verifikasi Selfie Live
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                    Hai {userName}, ambil 1 foto selfie langsung untuk mengaktifkan badge verifikasi anti-catfish.
                  </p>
                </div>

                <CameraCapture onCaptureComplete={handleSelfieComplete} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col flex-1"
              >
                <SupportingPhotos
                  verifiedSelfieUrl={selfiePreview}
                  onComplete={handlePhotosComplete}
                  onBack={() => setStep(1)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col flex-1"
              >
                <InterestsSelector
                  onComplete={handleInterestsComplete}
                  onBack={() => setStep(2)}
                  isLoading={isSubmitting}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="flex flex-col flex-1 items-center justify-between px-6 py-6 text-center"
              >
                <div className="my-auto flex flex-col items-center">
                  {/* Verified Card Preview */}
                  <div className="relative w-36 h-36 rounded-3xl p-1 bg-gradient-to-tr from-rose-500 to-orange-400 shadow-xl shadow-rose-500/30 mb-5">
                    {selfiePreview ? (
                      <img
                        src={selfiePreview}
                        alt="Verified Selfie"
                        className="w-full h-full object-cover rounded-[22px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 rounded-[22px] flex items-center justify-center">
                        <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-zinc-900">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-300 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Profil 100% Terverifikasi</span>
                  </div>

                  <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    Kamu Siap Berkencan!
                  </h1>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs leading-relaxed">
                    Profilmu sudah aktif di area <strong>{interestsData.city}</strong>. Foto selfie & foto pendukungmu telah tersimpan dengan aman di cloud.
                  </p>

                  <div className="mt-5 p-3.5 rounded-2xl bg-rose-50/70 dark:bg-zinc-800/60 border border-rose-200/50 dark:border-zinc-700/60 text-left w-full max-w-xs text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>
                      <strong>1x Kencan Pertama Gratis:</strong> Cewek yang menentukan kafe kencannya!
                    </span>
                  </div>
                </div>

                <Link href="/feed" className="w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Mulai Cari Kencan
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileContainer>
  );
}
