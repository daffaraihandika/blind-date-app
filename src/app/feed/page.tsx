"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Coffee } from "lucide-react";
import MobileContainer from "@/components/layout/MobileContainer";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import DateProfileCard from "@/components/swipe/DateProfileCard";
import SwipeActions from "@/components/swipe/SwipeActions";
import MatchModal from "@/components/swipe/MatchModal";
import { Button } from "@/components/ui/Button";
import { ProfileFeedCard, SwipeDirection, MatchEvent } from "@/types/match";
import { MOCK_PROFILES } from "@/lib/mock-profiles";
import { createClient } from "@/lib/supabase/client";

export default function FeedPage() {
  const [profiles, setProfiles] = useState<ProfileFeedCard[]>(MOCK_PROFILES);
  const [history, setHistory] = useState<ProfileFeedCard[]>([]);
  const [matchEvent, setMatchEvent] = useState<MatchEvent | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    avatarUrl?: string;
    gender?: "female" | "male";
    city?: string;
  }>({
    city: "Jakarta Selatan",
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              avatarUrl: profile.avatar_url,
              gender: profile.gender,
              city: profile.city || "Jakarta Selatan",
            });
          }

          // Fetch other profiles from Supabase
          const { data: otherProfiles } = await supabase
            .from("profiles")
            .select("*")
            .neq("id", user.id)
            .limit(10);

          if (otherProfiles && otherProfiles.length > 0) {
            const formattedRealProfiles: ProfileFeedCard[] = otherProfiles.map(
              (p, idx) => ({
                id: p.id,
                fullName: p.full_name,
                age: p.birth_date
                  ? new Date().getFullYear() - new Date(p.birth_date).getFullYear()
                  : 24,
                gender: p.gender,
                city: p.city || "Jakarta Selatan",
                distanceKm: idx + 2,
                bio: p.bio || "Pecinta kencan santai di coffee shop favorit.",
                selfieVerified: p.is_selfie_verified ?? true,
                avatarUrl:
                  p.avatar_url ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                photos: p.photos && p.photos.length > 0 ? p.photos : [],
                interests:
                  p.interests && p.interests.length > 0
                    ? p.interests.map((i: string) => ({
                        id: i,
                        label: i.charAt(0).toUpperCase() + i.slice(1),
                        icon: "☕",
                      }))
                    : [
                        { id: "coffee", label: "Ngopi", icon: "☕" },
                        { id: "music", label: "Musik", icon: "🎵" },
                      ],
                prompts: [
                  {
                    question: "Tempat kencan pertama impianku...",
                    answer: "Kafe tenang dengan kopi enak dan suasana santai.",
                  },
                ],
              })
            );

            // Merge real profiles with mock profiles
            setProfiles([...formattedRealProfiles, ...MOCK_PROFILES]);
          }
        }
      } catch (err) {
        console.warn("Feed data fetch notice:", err);
      }
    }
    loadData();
  }, [supabase]);

  const topCard = profiles[0];

  // Handle Swipe Action
  const handleSwipe = (direction: SwipeDirection) => {
    if (profiles.length === 0) return;

    const swipedUser = profiles[0];
    setHistory((prev) => [swipedUser, ...prev]);
    setProfiles((prev) => prev.slice(1));

    // Simulate Match Event when user swipes right
    if (direction === "right") {
      setMatchEvent({
        matchedUser: swipedUser,
        currentUserAvatar: currentUser.avatarUrl,
        currentUserGender: currentUser.gender || "female",
      });
    }
  };

  // Reset Feed
  const handleResetFeed = () => {
    setProfiles(MOCK_PROFILES);
    setHistory([]);
  };

  return (
    <MobileContainer>
      <div className="flex flex-col flex-1 h-full min-h-0 justify-between bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
        {/* Top App Header */}
        <AppHeader currentCity={currentUser.city || "Jakarta Selatan"} />

        {/* Swipe Cards Deck Area (Full Height to BottomNav) */}
        <main className="relative flex-1 w-full min-h-0 p-2.5 flex items-center justify-center overflow-hidden">
          {profiles.length > 0 ? (
            <div className="relative w-full h-full">
              <AnimatePresence>
                {profiles
                  .slice(0, 2)
                  .reverse()
                  .map((profile) => {
                    const isTop = profile.id === topCard?.id;
                    return (
                      <DateProfileCard
                        key={profile.id}
                        profile={profile}
                        isTopCard={isTop}
                        onSwipe={handleSwipe}
                      />
                    );
                  })}
              </AnimatePresence>

              {/* Floating 2-Button Action Bar (Overlaying at bottom of card) */}
              <SwipeActions
                onPass={() => handleSwipe("left")}
                onLike={() => handleSwipe("right")}
                disabled={profiles.length === 0}
              />
            </div>
          ) : (
            /* Empty Deck State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center p-8 max-w-xs mx-auto my-auto"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Semua Profil Sudah Dilihat!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Belum ada calon kencan baru di sekitarmu. Coba perluas filter area atau muat ulang deck kencan.
              </p>

              <Button
                variant="outline"
                size="md"
                className="mt-5"
                onClick={handleResetFeed}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Muat Ulang Feed
              </Button>
            </motion.div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav />

        {/* Mutual Match Celebration Modal */}
        <MatchModal
          matchEvent={matchEvent}
          onClose={() => setMatchEvent(null)}
          onPlanDate={() => {
            setMatchEvent(null);
            alert("Langkah berikutnya: Membuka formulir pemilihan kafe kencan bagi perempuan!");
          }}
        />
      </div>
    </MobileContainer>
  );
}
