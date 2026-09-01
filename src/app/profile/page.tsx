"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import MobileContainer from "@/components/layout/MobileContainer";
import BottomNav from "@/components/layout/BottomNav";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfilePrompts from "@/components/profile/ProfilePrompts";
import DatingPreferences from "@/components/profile/DatingPreferences";
import AccountSettings from "@/components/profile/AccountSettings";
import ProfileEditModal from "@/components/profile/ProfileEditModal";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import DateProfileCard from "@/components/swipe/DateProfileCard";
import { createClient } from "@/lib/supabase/client";
import { completeUserProfile } from "@/lib/storage";
import { ProfileFeedCard } from "@/types/match";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    id: string;
    fullName: string;
    age: number;
    gender: "female" | "male";
    city: string;
    bio: string;
    phone: string;
    email: string;
    avatarUrl: string;
    photos: string[];
    interests: string[];
    prompts: { question: string; answer: string }[];
  }>({
    id: "",
    fullName: "",
    age: 24,
    gender: "female",
    city: "Jakarta Selatan",
    bio: "",
    phone: "",
    email: "",
    avatarUrl: "",
    photos: [],
    interests: [],
    prompts: [],
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            setProfile({
              id: data.id,
              fullName: data.full_name || user.user_metadata?.full_name || "Pengguna",
              age: data.birth_date
                ? new Date().getFullYear() - new Date(data.birth_date).getFullYear()
                : 24,
              gender: data.gender || "female",
              city: data.city || "Jakarta Selatan",
              bio: data.bio || "",
              phone: data.phone || "",
              email: data.email || user.email || "",
              avatarUrl: data.avatar_url || "",
              photos: data.photos && data.photos.length > 0 ? data.photos : [],
              interests:
                data.interests && data.interests.length > 0
                  ? data.interests
                  : ["coffee", "music"],
              prompts:
                data.prompts && data.prompts.length > 0
                  ? data.prompts
                  : [],
            });
          }
        }
      } catch (err) {
        console.warn("Profile load notice:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [supabase]);

  // Handle Save from Edit Modal
  const handleSaveProfile = async (updatedData: {
    bio: string;
    interests: string[];
    photos: string[];
    city: string;
    prompts: { question: string; answer: string }[];
  }) => {
    setProfile((prev) => ({
      ...prev,
      ...updatedData,
    }));

    if (profile.id) {
      await completeUserProfile(profile.id, {
        avatarUrl: profile.avatarUrl,
        supportingPhotos: updatedData.photos,
        bio: updatedData.bio,
        city: updatedData.city,
        interests: updatedData.interests,
      });

      // Update prompts to Supabase profiles table
      try {
        await supabase
          .from("profiles")
          .update({ prompts: updatedData.prompts })
          .eq("id", profile.id);
      } catch (err) {
        console.warn("Prompts save notice:", err);
      }
    }
  };

  // Handle Phone Update
  const handleUpdatePhone = async (newPhone: string) => {
    setProfile((prev) => ({ ...prev, phone: newPhone }));
    if (profile.id) {
      await supabase
        .from("profiles")
        .update({ phone: newPhone })
        .eq("id", profile.id);
    }
  };

  // Format profile for preview card
  const previewFeedCard: ProfileFeedCard = {
    id: profile.id,
    fullName: profile.fullName || "Kamu",
    age: profile.age,
    gender: profile.gender,
    city: profile.city,
    distanceKm: 1,
    bio: profile.bio || "",
    selfieVerified: true,
    avatarUrl: profile.avatarUrl,
    photos: profile.photos,
    interests: profile.interests.map((i) => ({
      id: i,
      label: i.charAt(0).toUpperCase() + i.slice(1),
      icon: "☕",
    })),
    prompts:
      profile.prompts.length > 0
        ? profile.prompts
        : [
            {
              question: "Tempat kencan pertama impianku...",
              answer: "Coffee shop santai dengan suasana yang nyaman.",
            },
          ],
  };

  return (
    <MobileContainer>
      <div className="flex flex-col flex-1 h-full min-h-0 justify-between bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
        {/* Top Header */}
        <header className="px-5 py-3.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/80 sticky top-0 z-20 flex items-center justify-between">
          <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Profil Saya
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Terverifikasi</span>
          </div>
        </header>

        {/* Scrollable Content Body with Skeleton Loading State */}
        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <ProfileSkeleton />
          ) : (
            <>
              {/* 1. Profile Hero */}
              <ProfileHero
                fullName={profile.fullName || "Pengguna"}
                age={profile.age}
                city={profile.city}
                gender={profile.gender}
                avatarUrl={profile.avatarUrl}
                onEditClick={() => setIsEditOpen(true)}
                onPreviewClick={() => setIsPreviewOpen(true)}
              />

              {/* 2. Dating Prompts (Kutipan Kencan Saya) */}
              <ProfilePrompts prompts={profile.prompts} />

              {/* 3. Dating Preferences & Rules */}
              <DatingPreferences
                gender={profile.gender}
                city={profile.city}
              />

              {/* 4. Account Settings & WhatsApp */}
              <AccountSettings
                initialPhone={profile.phone}
                email={profile.email}
                onPhoneUpdate={handleUpdatePhone}
              />

              {/* Bottom space for scroll breathing room */}
              <div className="h-6" />
            </>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav />

        {/* Profile Edit Modal */}
        <ProfileEditModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          userId={profile.id}
          initialData={{
            bio: profile.bio,
            interests: profile.interests,
            photos: profile.photos,
            avatarUrl: profile.avatarUrl,
            city: profile.city,
            prompts: profile.prompts,
          }}
          onSave={handleSaveProfile}
        />

        {/* Profile Card Preview Modal */}
        <AnimatePresence>
          {isPreviewOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-sm h-[78vh] flex flex-col items-center justify-center"
              >
                {/* Close Preview Button */}
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute -top-11 right-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-full h-full relative">
                  <DateProfileCard
                    profile={previewFeedCard}
                    isTopCard={true}
                    onSwipe={() => setIsPreviewOpen(false)}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MobileContainer>
  );
}
