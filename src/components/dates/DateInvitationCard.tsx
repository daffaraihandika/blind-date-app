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
  Navigation,
  Clock3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DateInvitationWithPartner } from "@/types/date";

interface DateInvitationCardProps {
  invitation: DateInvitationWithPartner;
  onConfirm?: (invitationId: string, matchId: string) => Promise<void>;
  onDecline?: (invitationId: string, matchId: string) => Promise<void>;
  onCancel?: (invitationId: string, matchId: string) => Promise<void>;
  onPlanDate?: (invitation: DateInvitationWithPartner) => void;
}

function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateDisplay(dateStr: string): string {
  try {
    const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
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
  onCancel,
  onPlanDate,
}: DateInvitationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const partnerInitials = getInitials(invitation.partner.fullName);

  const handleCancel = async () => {
    if (!onCancel) return;
    setIsUpdating(true);
    try {
      await onCancel(invitation.id, invitation.matchId);
      setShowCancelConfirm(false);
    } finally {
      setIsUpdating(false);
    }
  };

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
          {invitation.status === "needs_venue_selection" && (
            invitation.canPlanDate ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[10px] font-bold text-rose-600 dark:text-rose-300">
                <Sparkles className="w-3 h-3" />
                Atur Kafe
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[10px] font-bold text-amber-600 dark:text-amber-300">
                <Clock3 className="w-3 h-3" />
                Menunggu Kafe ⏳
              </span>
            )
          )}
          {invitation.status === "confirmed" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              Terkonfirmasi
            </span>
          )}
          {invitation.status === "completed" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              Selesai
            </span>
          )}
          {invitation.status === "canceled" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-[10px] font-bold text-red-500 dark:text-red-400">
              <XCircle className="w-3 h-3" />
              Dibatalkan
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
      {invitation.status === "needs_venue_selection" ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-orange-50/50 dark:from-rose-950/30 dark:via-zinc-850 dark:to-orange-950/20 border border-rose-200/60 dark:border-rose-800/40 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                Match Baru! Siap Merencanakan Kencan 🎉
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug block">
                {invitation.canPlanDate
                  ? `Sebagai perempuan, kamu berhak menentukan tempat & waktu kencan pertamamu bersama ${invitation.partner.fullName}.`
                  : `Menunggu ${invitation.partner.fullName} memilih coffee shop dan jadwal kencan pertama kalian.`}
              </span>
            </div>
          </div>
        </div>
      ) : (
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
      )}

      {/* 3. Action Buttons according to Role & Status */}
      {invitation.status === "needs_venue_selection" && (
        <div>
          {invitation.canPlanDate ? (
            <Button
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<Coffee className="w-4 h-4" />}
              onClick={() => onPlanDate && onPlanDate(invitation)}
            >
              Tentukan Tempat Kencan ☕
            </Button>
          ) : (
            <div className="py-1 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                ☕ Undangan akan masuk begitu {invitation.partner.fullName} selesai memilih tempat.
              </p>
            </div>
          )}
        </div>
      )}

      {invitation.status === "pending_confirmation" && (
        <div>
          {invitation.isInviter ? (
            /* If current user sent the invite */
            <div className="flex flex-col gap-1 text-center py-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                Menunggu konfirmasi kehadiran dari {invitation.partner.fullName} ☕
              </p>
              {showCancelConfirm ? (
                <div className="mt-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex flex-col gap-2 text-center">
                  <p className="text-xs text-red-600 dark:text-red-300 font-bold">
                    Batalkan undangan kencan ini?
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      disabled={isUpdating}
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Kembali
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      isLoading={isUpdating}
                      onClick={handleCancel}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold"
                    >
                      Ya, Batalkan
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-[11px] text-zinc-400 hover:text-red-500 transition-colors pt-1"
                >
                  Tarik / Batalkan Undangan
                </button>
              )}
            </div>
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
        <div className="flex flex-col gap-2.5 pt-1">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<Navigation className="w-4 h-4 text-rose-500" />}
            >
              Buka Lokasi di Maps 📍
            </Button>
          </a>

          {/* Batalkan Kencan Action with confirmation */}
          {showCancelConfirm ? (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex flex-col gap-2 text-center">
              <p className="text-xs text-red-600 dark:text-red-300 font-bold">
                Yakin ingin membatalkan kencan ini?
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Kencan akan dibatalkan dan dipindahkan ke tab Riwayat.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  disabled={isUpdating}
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Kembali
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  isLoading={isUpdating}
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold"
                >
                  Ya, Batalkan
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="text-[11px] font-semibold text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1 inline-flex items-center gap-1"
              >
                <XCircle className="w-3 h-3" />
                <span>Batalkan Kencan</span>
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
