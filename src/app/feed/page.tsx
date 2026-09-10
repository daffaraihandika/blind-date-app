"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import MobileContainer from "@/components/layout/MobileContainer";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import DateProfileCard from "@/components/swipe/DateProfileCard";
import SwipeActions from "@/components/swipe/SwipeActions";
import MatchModal from "@/components/swipe/MatchModal";
import FeedEmptyState from "@/components/swipe/FeedEmptyState";
import FeedSkeleton from "@/components/swipe/FeedSkeleton";
import CityFilterModal from "@/components/swipe/CityFilterModal";
import DatePlannerModal from "@/components/dates/DatePlannerModal";
import { ProfileFeedCard, SwipeDirection, MatchEvent } from "@/types/match";
import { Gender } from "@/types/auth";
import { createClient } from "@/lib/supabase/client";
import { fetchFeedProfiles, recordSwipe } from "@/lib/matchmaking";

export default function FeedPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileFeedCard[]>([]);
  const [matchEvent, setMatchEvent] = useState<MatchEvent | null>(null);
  const [activeMatchForPlanning, setActiveMatchForPlanning] = useState<{
    matchId: string;
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
    city: string;
  } | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingCity, setIsLoadingCity] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    fullName: string;
    avatarUrl: string;
    gender: Gender;
    city: string;
  }>({
    id: "",
    fullName: "Kamu",
    avatarUrl: "",
    gender: "male",
    city: "",
  });

  const supabase = createClient();

  // 1. Initial Data Bootstrap
  useEffect(() => {
    async function bootstrap() {
      setIsInitializing(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let userId = "";
        let userFullName = "Kamu";
        let userAvatarUrl = "";
        let userGender: Gender = "male";
        let userCity = "Jakarta Selatan";

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            userId = profile.id;
            userFullName = profile.full_name || user.user_metadata?.full_name || "Kamu";
            userAvatarUrl = profile.avatar_url || "";
            userGender = profile.gender || "male";
            userCity = profile.city || "Jakarta Selatan";
          }
        }

        setCurrentUser({
          id: userId,
          fullName: userFullName,
          avatarUrl: userAvatarUrl,
          gender: userGender,
          city: userCity,
        });
        setSelectedCity(userCity);

        // Fetch candidate cards for the exact user gender & city
        const candidates = await fetchFeedProfiles(userId, userGender, userCity);
        setProfiles(candidates);
      } catch (err) {
        console.warn("Bootstrap feed error:", err);
      } finally {
        setIsInitializing(false);
      }
    }

    bootstrap();
  }, [supabase]);

  // 2. Load Feed for a specific city when user switches location
  const handleSelectCity = useCallback(
    async (newCity: string) => {
      setSelectedCity(newCity);
      setIsLoadingCity(true);
      try {
        const candidates = await fetchFeedProfiles(
          currentUser.id,
          currentUser.gender,
          newCity
        );
        setProfiles(candidates);
      } catch (err) {
        console.error("Error changing city feed:", err);
      } finally {
        setIsLoadingCity(false);
      }
    },
    [currentUser.id, currentUser.gender]
  );

  // 3. Refresh current feed
  const handleRefreshFeed = useCallback(async () => {
    setIsLoadingCity(true);
    try {
      const candidates = await fetchFeedProfiles(
        currentUser.id,
        currentUser.gender,
        selectedCity
      );
      setProfiles(candidates);
    } catch (err) {
      console.error("Error refreshing feed:", err);
    } finally {
      setIsLoadingCity(false);
    }
  }, [currentUser.id, currentUser.gender, selectedCity]);

  const topCard = profiles[0];

  // 4. Handle Swipe Action (Like or Pass)
  const handleSwipe = async (direction: SwipeDirection) => {
    if (profiles.length === 0) return;

    const swipedUser = profiles[0];

    // Optimistically remove card from deck
    setProfiles((prev) => prev.slice(1));

    // Record swipe to Supabase 'swipes' table & check for mutual match
    if (currentUser.id && swipedUser.id) {
      const result = await recordSwipe(currentUser.id, swipedUser.id, direction);

      if (result.isMatch) {
        setMatchEvent({
          matchedUser: swipedUser,
          currentUserAvatar: currentUser.avatarUrl,
          currentUserName: currentUser.fullName,
          currentUserGender: currentUser.gender,
        });

        if (result.matchRecord?.id) {
          setActiveMatchForPlanning({
            matchId: result.matchRecord.id,
            partnerId: swipedUser.id,
            partnerName: swipedUser.fullName,
            partnerAvatar: swipedUser.avatarUrl,
            city: swipedUser.city || selectedCity,
          });
        }
      }
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col flex-1 h-full min-h-0 justify-between bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative select-none">
        {/* Top App Header with Shimmer Loading & Filter Icon */}
        <AppHeader
          currentCity={selectedCity || "Jakarta Selatan"}
          isLoading={isInitializing}
          onFilterClick={() => setIsCityModalOpen(true)}
        />

        {/* Swipe Cards Deck Area */}
        <main className="relative flex-1 w-full min-h-0 p-2.5 flex items-center justify-center overflow-hidden">
          {isInitializing || isLoadingCity ? (
            /* Smooth Loading Skeleton State (No Layout Shift) */
            <FeedSkeleton />
          ) : profiles.length > 0 ? (
            /* Active Card Deck */
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

              {/* Floating 2-Button Action Bar (Pass & Like) */}
              <SwipeActions
                onPass={() => handleSwipe("left")}
                onLike={() => handleSwipe("right")}
                disabled={profiles.length === 0}
              />
            </div>
          ) : (
            /* Radar Empty State (When all cards in area are swiped) */
            <FeedEmptyState
              selectedCity={selectedCity}
              onChangeCityClick={() => setIsCityModalOpen(true)}
              onRefreshClick={handleRefreshFeed}
              isLoading={isLoadingCity}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav />

        {/* City / Area Filter Modal */}
        <CityFilterModal
          isOpen={isCityModalOpen}
          onClose={() => setIsCityModalOpen(false)}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
        />

        {/* Mutual Match Celebration Modal */}
        <MatchModal
          matchEvent={matchEvent}
          onClose={() => setMatchEvent(null)}
          onPlanDate={() => {
            setMatchEvent(null);
            // If match data ready, open planner modal; otherwise go to /dates
            if (activeMatchForPlanning) {
              // Date planner will open automatically through activeMatchForPlanning state
            } else {
              router.push("/dates");
            }
          }}
        />

        {/* Date Planner Modal (Triggered post-match) */}
        {activeMatchForPlanning && !matchEvent && (
          <DatePlannerModal
            isOpen={Boolean(activeMatchForPlanning)}
            onClose={() => setActiveMatchForPlanning(null)}
            matchId={activeMatchForPlanning.matchId}
            partnerId={activeMatchForPlanning.partnerId}
            partnerName={activeMatchForPlanning.partnerName}
            partnerAvatar={activeMatchForPlanning.partnerAvatar}
            city={activeMatchForPlanning.city}
            onInvitationSent={() => {
              setActiveMatchForPlanning(null);
              router.push("/dates");
            }}
          />
        )}
      </div>
    </MobileContainer>
  );
}
