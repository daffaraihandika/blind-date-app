"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Coffee,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Navigation,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DateInvitationWithPartner } from "@/types/date";

interface DateInvitationCardProps {
  invitation: DateInvitationWithPartner;
  onConfirm?: (invitationId: string, matchId: string) => Promise<void>;
  onDecline?: (invitationId: string, matchId: string) => Promise<void>;
}

function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateDisplay(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export default function DateInvitationCard({
  invitation,
  onConfirm,
  onDecline,
}: DateInvitationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const partnerInitials = getInitials(invitation.partner.fullName);

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setIsUpdating(true);
    try {
      await onConfirm(invitation.id, invitation.matchId);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecline = async () => {
    if (!onDecline) return;
    setIsUpdating(true);
    try {
      await onDecline(invitation.id, invitation.matchId);
    } finally {
      setIsUpdating(false);
    }
  };

  const mapsQuery = encodeURIComponent(`${invitation.venueName} ${invitation.city}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const cleanPhone = invitation.partner.phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
    `Halo ${invitation.partner.fullName}! Sampai bertemu di ${invitation.venueName} ya ☕`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-sm flex flex-col gap-4 text-left select-none"
    >
      {/* 1. Header: Partner Profile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar / Initials */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
            {invitation.partner.avatarUrl ? (
              <img
                src={invitation.partner.avatarUrl}
                alt={invitation.partner.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{partnerInitials}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {invitation.partner.fullName}
              </h4>
              <CheckCircle2 className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-rose-500" />
              {invitation.city}
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {invitation.status === "confirmed" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              Terkonfirmasi
            </span>
          )}
          {invitation.status === "pending_confirmation" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[10px] font-bold text-amber-600 dark:text-amber-300">
              <Clock3 className="w-3 h-3" />
              Menunggu Konfirmasi
            </span>
          )}
          {invitation.status === "declined" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500">
              <XCircle className="w-3 h-3" />
              Ditolak
            </span>
          )}
        </div>
      </div>

      {/* 2. Date Details Card Box */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col gap-2.5">
        {/* Venue */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Coffee className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">Tempat Kencan</span>
            <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{invitation.venueName}</span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/40 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">
              {formatDateDisplay(invitation.dateSlot)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">
              {invitation.timeSlot}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons according to Role & Status */}
      {invitation.status === "pending_confirmation" && (
        <div>
          {invitation.isInviter ? (
            /* If current user sent the invite */
            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 italic py-1">
              Menunggu konfirmasi kehadiran dari {invitation.partner.fullName} ☕
            </p>
          ) : (
            /* If current user received the invite */
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="md"
                fullWidth
                isLoading={isUpdating}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleConfirm}
              >
                Terima Kencan
              </Button>
              <Button
                variant="outline"
                size="md"
                disabled={isUpdating}
                leftIcon={<XCircle className="w-4 h-4" />}
                onClick={handleDecline}
              >
                Tolak
              </Button>
            </div>
          )}
        </div>
      )}

      {invitation.status === "confirmed" && (
        <div className="flex items-center gap-2 pt-1">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leftIcon={<Navigation className="w-3.5 h-3.5 text-rose-500" />}
            >
              Buka Maps
            </Button>
          </a>

          {invitation.partner.phone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-500" />}
              >
                WhatsApp
              </Button>
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}
