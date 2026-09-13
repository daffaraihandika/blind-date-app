"use client";

import React from "react";
import { ChatMessage } from "@/types/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const { content, createdAt, isSender } = message;
  const timeStr = formatTime(createdAt);

  return (
    <div
      className={`flex w-full ${
        isSender ? "justify-end" : "justify-start"
      } mb-2.5 select-none`}
    >
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-3xl text-sm leading-relaxed shadow-xs flex flex-col gap-0.5 ${
          isSender
            ? "bg-gradient-to-tr from-rose-500 to-rose-600 text-white rounded-br-sm"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm border border-zinc-200/50 dark:border-zinc-700/50"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <span
          className={`text-[9px] self-end font-medium ${
            isSender ? "text-rose-100" : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {timeStr}
        </span>
      </div>
    </div>
  );
}
