"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Coffee, Heart, Calendar, Clock, RefreshCw, Sparkles } from "lucide-react";
import MobileContainer from "@/components/layout/MobileContainer";
import BottomNav from "@/components/layout/BottomNav";
import DateInvitationCard from "@/components/dates/DateInvitationCard";
import DatesSkeleton from "@/components/dates/DatesSkeleton";
import { Button } from "@/components/ui/Button";
import { DateInvitationWithPartner, InvitationStatus } from "@/types/date";
import { fetchUserDateInvitations, updateInvitationStatus } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";

type TabType = "pending" | "confirmed" | "history";

export default function DatesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [invitations, setInvitations] = useState<DateInvitationWithPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  const supabase = createClient();

  const loadDates = useCallback(async (currentUid: string) => {
    if (!currentUid) return;
    try {
      const data = await fetchUserDateInvitations(currentUid);
      setInvitations(data);
    } catch (err) {
      console.error("Error loading dates:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        await loadDates(user.id);
      } else {
        setIsLoading(false);
      }
    }

    init();
  }, [supabase, loadDates]);

  // Supabase Realtime Subscription for Live Updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("realtime-date-invitations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "date_invitations",
        },
        () => {
          loadDates(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, loadDates]);

  // Handle Accept Invitation
  const handleConfirmInvitation = async (invitationId: string, matchId: string) => {
    const ok = await updateInvitationStatus(invitationId, matchId, "confirmed");
    if (ok) {
      await loadDates(userId);
    }
  };

  // Handle Decline Invitation
  const handleDeclineInvitation = async (invitationId: string, matchId: string) => {
    const ok = await updateInvitationStatus(invitationId, matchId, "declined");
    if (ok) {
      await loadDates(userId);
    }
  };

  // Filter invitations by active tab
  const pendingDates = invitations.filter((i) => i.status === "pending_confirmation");
  const confirmedDates = invitations.filter((i) => i.status === "confirmed");
  const historyDates = invitations.filter(
    (i) => i.status === "completed" || i.status === "declined" || i.status === "canceled"
  );

  const currentDisplayList =
    activeTab === "pending"
      ? pendingDates
      : activeTab === "confirmed"
      ? confirmedDates
      : historyDates;

  return (
    <MobileContainer>
      <div className="flex flex-col flex-1 h-full min-h-0 justify-between bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative select-none">
        {/* Top Header */}
        <header className="px-5 py-3.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/80 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Kencan Saya
            </span>
            {pendingDates.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                {pendingDates.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => loadDates(userId)}
            className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors"
            title="Muat Ulang"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* 3 Tab Navigation Pills */}
        <div className="px-5 pt-3 pb-2 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            <span>Undangan</span>
            {pendingDates.length > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === "pending"
                    ? "bg-white text-rose-500"
                    : "bg-rose-500 text-white"
                }`}
              >
                {pendingDates.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("confirmed")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "confirmed"
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            <span>Terkonfirmasi</span>
            {confirmedDates.length > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === "confirmed"
                    ? "bg-white text-rose-500"
                    : "bg-emerald-500 text-white"
                }`}
              >
                {confirmedDates.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === "history"
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            Riwayat
          </button>
        </div>

        {/* Scrollable Content Body */}
        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4">
          {isLoading ? (
            <DatesSkeleton />
          ) : currentDisplayList.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {currentDisplayList.map((inv) => (
                <DateInvitationCard
                  key={inv.id}
                  invitation={inv}
                  onConfirm={handleConfirmInvitation}
                  onDecline={handleDeclineInvitation}
                />
              ))}
              <div className="h-6" />
            </div>
          ) : (
            /* Empty State for Current Tab */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                {activeTab === "pending"
                  ? "Belum Ada Undangan Kencan"
                  : activeTab === "confirmed"
                  ? "Belum Ada Kencan Terkonfirmasi"
                  : "Belum Ada Riwayat Kencan"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs leading-relaxed">
                {activeTab === "pending"
                  ? "Swipe profil di feed dan buat match untuk merencanakan kencan pertama di coffee shop favorit!"
                  : activeTab === "confirmed"
                  ? "Undangan kencan yang telah disetujui bersama akan muncul di sini."
                  : "Riwayat kencan offline yang telah selesai akan tersimpan di sini."}
              </p>

              {activeTab === "pending" && (
                <Link href="/feed" className="mt-5 w-full max-w-xs">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    leftIcon={<Heart className="w-4 h-4" />}
                  >
                    Cari Pasangan Kencan
                  </Button>
                </Link>
              )}
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </MobileContainer>
  );
}
