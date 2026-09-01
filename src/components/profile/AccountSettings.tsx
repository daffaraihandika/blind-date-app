"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AccountSettingsProps {
  initialPhone: string;
  email: string;
  onPhoneUpdate: (newPhone: string) => Promise<void>;
}

export default function AccountSettings({
  initialPhone,
  email,
  onPhoneUpdate,
}: AccountSettingsProps) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSavePhone = async () => {
    if (!phone.trim()) return;
    setIsSaving(true);
    try {
      await onPhoneUpdate(phone.trim());
      setIsEditingPhone(false);
      setPhoneSuccess(true);
      setTimeout(() => setPhoneSuccess(false), 2500);
    } catch (err) {
      console.error("Phone update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Apakah kamu yakin ingin keluar dari akun BlindDate?")) {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  return (
    <div className="p-5 text-left flex flex-col gap-4 bg-white dark:bg-zinc-900">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        Pengaturan Akun & Notifikasi
      </h3>

      {/* WhatsApp Notification Card */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                Notifikasi WhatsApp Kencan
              </span>
              <span className="text-[10px] text-zinc-400">
                Untuk pengiriman info jadwal kencan resmi
              </span>
            </div>
          </div>

          {!isEditingPhone && (
            <button
              type="button"
              onClick={() => setIsEditingPhone(true)}
              className="text-xs font-semibold text-rose-500 hover:underline"
            >
              Ubah
            </button>
          )}
        </div>

        {isEditingPhone ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              className="flex-1 h-9 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSavePhone}
              className="h-9 px-3.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 disabled:opacity-50"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setIsEditingPhone(false)}
              className="h-9 px-2.5 rounded-xl text-zinc-400 hover:text-zinc-600 text-xs"
            >
              Batal
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
              {phone || "Belum diatur"}
            </span>
            {phoneSuccess && (
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Berhasil disimpan
              </span>
            )}
          </div>
        )}
      </div>

      {/* Account Email & Info */}
      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
        <span className="text-zinc-400">Email Akun Terdaftar</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>
      </div>

      {/* Safety & Help Links */}
      <div className="flex flex-col rounded-2xl border border-zinc-200/60 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        <button
          type="button"
          onClick={() =>
            alert(
              "Panduan Keamanan Kencan:\n1. Selalu bertemu di tempat publik yang ramai (kafe/restoran).\n2. Beritahu teman/keluarga sebelum berangkat kencan.\n3. Jangan membagikan informasi finansial pribadi."
            )
          }
          className="flex items-center justify-between p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-xs text-zinc-700 dark:text-zinc-300 font-medium"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-rose-500" />
            <span>Panduan Keamanan Kencan Offline</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>

        <button
          type="button"
          onClick={() =>
            alert("Syarat & Ketentuan:\nKhusus pengguna berusia 18+ tahun. Menjunjung tinggi rasa hormat dan etika kencan nyata.")
          }
          className="flex items-center justify-between p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-xs text-zinc-700 dark:text-zinc-300 font-medium"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            <span>Syarat, Ketentuan & Privasi</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full h-12 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/60 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  );
}
