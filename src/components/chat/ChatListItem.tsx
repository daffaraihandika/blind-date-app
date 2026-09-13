"use client";

import React from "react";
import Link from "next/link";
import { Coffee, ChevronRight, Clock, MapPin } from "lucide-react";
import { ChatConversation } from "@/types/chat";

interface ChatListItemProps {
  conversation: ChatConversation;
}

function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatListItem({ conversation }: ChatListItemProps) {
  const { partner, venueName, city, timeSlot, lastMessage, matchId } = conversation;
  const initials = getInitials(partner.fullName);

  return (
    <Link
      href={`/chat/${matchId}`}
      className="w-full p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 hover:border-rose-300 dark:hover:border-rose-800/60 transition-all flex items-center justify-between gap-3.5 shadow-xs select-none"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Avatar */}
        <div className="relative w-13 h-13 rounded-full overflow-hidden bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs">
          {partner.avatarUrl ? (
            <img
              src={partner.avatarUrl}
              alt={partner.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
          {/* Online/Active Live Dot */}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {partner.fullName}
            </h4>
            {lastMessage && (
              <span className="text-[10px] text-zinc-400 font-medium shrink-0">
                {formatMessageTime(lastMessage.createdAt)}
              </span>
            )}
          </div>

          {/* Venue & Time Pill */}
          <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-semibold truncate mb-1">
            <Coffee className="w-3 h-3 shrink-0" />
            <span className="truncate">{venueName}</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium shrink-0">
              {timeSlot}
            </span>
          </div>

          {/* Last Message Preview */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {lastMessage
              ? lastMessage.content
              : "Ketuk untuk koordinasi di kafe ☕"}
          </p>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
    </Link>
  );
}
