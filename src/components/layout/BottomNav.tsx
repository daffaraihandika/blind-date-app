"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Coffee, MessageCircle, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      id: "feed",
      label: "Cari Kencan",
      href: "/feed",
      icon: Flame,
    },
    {
      id: "dates",
      label: "Kencan Saya",
      href: "/dates",
      icon: Coffee,
      badge: "Baru",
    },
    {
      id: "chat",
      label: "Chat",
      href: "/chat",
      icon: MessageCircle,
    },
    {
      id: "profile",
      label: "Profil",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <nav className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-800/80 px-4 py-2 sticky bottom-0 z-30 select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/feed" && pathname === "/");

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-rose-500 font-bold scale-105"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-2.5 px-1 py-0.2 bg-rose-500 text-white text-[8px] font-extrabold rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>

              {/* Active Dot Indicator */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
