"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageCircle, Coffee, RefreshCw, Sparkles, Heart } from "lucide-react";
import MobileContainer from "@/components/layout/MobileContainer";
import BottomNav from "@/components/layout/BottomNav";
import ChatListItem from "@/components/chat/ChatListItem";
import { Button } from "@/components/ui/Button";
import { ChatConversation } from "@/types/chat";
import { fetchUserChatConversations } from "@/lib/chat";
import { createClient } from "@/lib/supabase/client";

export default function ChatListPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  const supabase = createClient();

  const loadConversations = useCallback(async (uid: string) => {
    if (!uid) return;
    try {
      const data = await fetchUserChatConversations(uid);
      setConversations(data);
    } catch (err) {
      console.error("Error loading chat conversations:", err);
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
        await loadConversations(user.id);
      } else {
        setIsLoading(false);
      }
    }

    init();
  }, [supabase, loadConversations]);

  // Realtime subscription for incoming messages to update conversation preview
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("realtime-chat-list")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          loadConversations(userId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "date_invitations",
        },
        () => {
          loadConversations(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, loadConversations]);

  return (
    <MobileContainer>
      <div className="flex flex-col flex-1 h-full min-h-0 justify-between bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative select-none">
        {/* Top Header */}
        <header className="px-5 py-3.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/80 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Koordinasi Kencan
            </span>
            {conversations.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                {conversations.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => loadConversations(userId)}
            className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors"
            title="Muat Ulang"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* Informative Header Banner */}
        <div className="px-5 py-2.5 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-100/60 dark:border-rose-900/30 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-tight">
            Chat aktif untuk koordinasi di kafe pada kencan yang telah terkonfirmasi.
          </p>
        </div>

        {/* Content Body */}
        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="flex flex-col gap-3">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="w-full h-20 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : conversations.length > 0 ? (
            <div className="flex flex-col gap-3">
              {conversations.map((conv) => (
                <ChatListItem key={conv.matchId} conversation={conv} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                Belum Ada Chat Koordinasi
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs leading-relaxed">
                Ruang chat akan otomatis aktif setelah undangan kencan disetujui bersama agar kamu dan pasangan bisa saling berkoordinasi saat hari H di kafe!
              </p>

              <Link href="/dates" className="mt-5 w-full max-w-xs">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={<Coffee className="w-4 h-4" />}
                >
                  Cek Kencan Saya
                </Button>
              </Link>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </MobileContainer>
  );
}
