"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Coffee,
  MapPin,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  Calendar,
} from "lucide-react";
import MobileContainer from "@/components/layout/MobileContainer";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import QuickCoordinationChips from "@/components/chat/QuickCoordinationChips";
import { ChatMessage } from "@/types/chat";
import {
  fetchChatMessages,
  sendChatMessage,
  getChatRoomDetails,
} from "@/lib/chat";
import { createClient } from "@/lib/supabase/client";

function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateDisplay(dateSlot: string): string {
  if (!dateSlot) return "";
  try {
    const d = new Date(dateSlot + "T00:00:00");
    return d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateSlot;
  }
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomDetails, setRoomDetails] = useState<Awaited<
    ReturnType<typeof getChatRoomDetails>
  > | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const supabase = createClient();

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Load user, room details, and message history
  const loadRoom = useCallback(async (uid: string) => {
    if (!matchId || !uid) return;

    try {
      const [details, msgs] = await Promise.all([
        getChatRoomDetails(matchId, uid),
        fetchChatMessages(matchId, uid),
      ]);

      setRoomDetails(details);
      setMessages(msgs);
    } catch (err) {
      console.error("Error loading chat room:", err);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
        await loadRoom(user.id);
      } else {
        setIsLoading(false);
      }
    }

    init();
  }, [supabase, loadRoom]);

  // Scroll to bottom after initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [isLoading]);

  // Realtime subscription for incoming messages
  useEffect(() => {
    if (!matchId || !currentUserId) return;

    const channel = supabase
      .channel(`chat-room-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            // Avoid duplicate message
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev;
            }

            // Replace matching temp message if sender sent it
            const tempIdx = prev.findIndex(
              (m) =>
                m.id.startsWith("temp-") &&
                m.content === newMsg.content &&
                m.senderId === newMsg.sender_id
            );

            const formatted: ChatMessage = {
              id: newMsg.id,
              matchId: newMsg.match_id,
              senderId: newMsg.sender_id,
              receiverId: newMsg.receiver_id,
              content: newMsg.content,
              createdAt: newMsg.created_at,
              isSender: newMsg.sender_id === currentUserId,
            };

            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = formatted;
              return updated;
            }

            return [...prev, formatted];
          });

          // Scroll down on new message
          setTimeout(() => scrollToBottom("smooth"), 100);
        }
      )
      .subscribe();

    // Also listen for date status changes (e.g., if completed or canceled)
    const invChannel = supabase
      .channel(`chat-inv-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "date_invitations",
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          getChatRoomDetails(matchId, currentUserId).then((updated) => {
            if (updated) setRoomDetails(updated);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(invChannel);
    };
  }, [supabase, matchId, currentUserId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !roomDetails || isSending) return;

    const receiverId = roomDetails.partner.id;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      matchId,
      senderId: currentUserId,
      receiverId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      isSender: true,
    };

    // Optimistically add message
    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText("");
    setIsSending(true);
    setTimeout(() => scrollToBottom("smooth"), 50);

    const result = await sendChatMessage({
      matchId,
      senderId: currentUserId,
      receiverId,
      content: trimmed,
    });

    setIsSending(false);

    if (!result.success) {
      // Revert optimistic message if send failed
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Gagal mengirim pesan: " + (result.error || "Terjadi kesalahan."));
    }
  };

  const handleSelectChip = (chipText: string) => {
    setInputText((prev) => {
      if (!prev.trim()) return chipText;
      return `${prev.trim()} ${chipText}`;
    });
    inputRef.current?.focus();
  };

  const isCompleted = roomDetails?.status === "completed";
  const isCanceled = roomDetails?.status === "canceled";
  const isReadOnly = isCompleted || isCanceled;

  const mapsUrl = roomDetails
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${roomDetails.venueName} ${roomDetails.city}`
      )}`
    : "#";

  return (
    <MobileContainer>
      <div className="flex flex-col flex-1 h-full min-h-0 justify-between bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative select-none">
        {/* Chat Room Header */}
        <header className="px-4 py-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/80 sticky top-0 z-20 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Link
              href="/chat"
              className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Avatar & Online indicator */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
              {roomDetails?.partner.avatarUrl ? (
                <img
                  src={roomDetails.partner.avatarUrl}
                  alt={roomDetails.partner.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {getInitials(roomDetails?.partner.fullName || "")}
                </span>
              )}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
            </div>

            {/* Partner Name & Venue Info */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                {roomDetails?.partner.fullName || "Koordinasi Kencan"}
              </h3>
              {roomDetails && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  <Coffee className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate font-semibold text-rose-600 dark:text-rose-400">
                    {roomDetails.venueName}
                  </span>
                  <span>•</span>
                  <span className="shrink-0">{roomDetails.timeSlot}</span>
                </div>
              )}
            </div>
          </div>

          {/* Maps Button */}
          {roomDetails && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 text-[11px] font-bold shrink-0 transition-colors shadow-2xs"
              title="Buka Lokasi di Google Maps"
            >
              <MapPin className="w-3 h-3" />
              <span>Maps</span>
            </a>
          )}
        </header>

        {/* Privacy Notice Banner */}
        <div className="px-4 py-2 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-100/60 dark:border-amber-900/40 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-[10.5px] text-amber-800 dark:text-amber-300 leading-tight">
            Privasi Terjaga: Nomor HP & kontak pribadi dirahasiakan. Chat ini
            khusus koordinasi kedatangan & meja di kafe.
          </p>
        </div>

        {/* Messages Body */}
        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 flex flex-col justify-between">
          {isLoading ? (
            <div className="flex flex-col gap-3 my-auto">
              <div className="w-3/4 h-12 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse self-start" />
              <div className="w-2/3 h-10 rounded-3xl bg-rose-200/60 dark:bg-rose-950/40 animate-pulse self-end" />
              <div className="w-1/2 h-10 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse self-start" />
            </div>
          ) : !roomDetails ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Ruang Chat Tidak Ditemukan
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Kencan mungkin belum terkonfirmasi atau telah dibatalkan.
              </p>
              <Link
                href="/dates"
                className="mt-4 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold"
              >
                Kembali ke Kencan Saya
              </Link>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              {/* Date & Location Pill Badge */}
              <div className="flex justify-center my-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium shadow-2xs">
                  <Calendar className="w-3 h-3 text-rose-500" />
                  <span>{formatDateDisplay(roomDetails.dateSlot)}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3 text-rose-500" />
                  <span>{roomDetails.timeSlot} WIB</span>
                </div>
              </div>

              {/* Messages list or empty prompt */}
              {messages.length === 0 ? (
                <div className="my-auto flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                    Mulai Koordinasi
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Kalian sudah sepakat bertemu di{" "}
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      {roomDetails.venueName}
                    </strong>
                    . Gunakan tombol cepat di bawah atau ketik pesan untuk memberi
                    tahu posisi kamu!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col pt-2 pb-2">
                  {messages.map((msg) => (
                    <ChatMessageBubble key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Area: Quick Chips & Input Bar */}
        <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200/70 dark:border-zinc-800 sticky bottom-0 z-20">
          {/* Quick Coordination Chips (only when chat is active) */}
          {!isReadOnly && (
            <QuickCoordinationChips
              onSelect={handleSelectChip}
              disabled={isSending}
            />
          )}

          {/* Status Banners or Input Bar */}
          {isCompleted ? (
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800/80 text-center">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                ✨ Kencan ini telah selesai. Ruang chat koordinasi ditutup.
              </p>
            </div>
          ) : isCanceled ? (
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800/80 text-center">
              <p className="text-xs font-semibold text-rose-500 dark:text-rose-400">
                ❌ Kencan ini telah dibatalkan.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSendMessage}
              className="p-3 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik pesan koordinasi..."
                disabled={isSending}
                className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all border border-transparent focus:border-rose-400 dark:focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
                title="Kirim"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
