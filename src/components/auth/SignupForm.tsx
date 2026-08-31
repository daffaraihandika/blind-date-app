"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Camera,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Gender } from "@/types/auth";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const supabase = createClient();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Nama lengkap wajib diisi";
    if (!email.trim() || !email.includes("@"))
      newErrors.email = "Format email tidak valid";
    if (!phone.trim()) newErrors.phone = "Nomor WhatsApp wajib diisi";
    if (!birthDate) {
      newErrors.birthDate = "Tanggal lahir wajib diisi";
    } else {
      const birthYear = new Date(birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 18) {
        newErrors.birthDate = "Minimal usia 18 tahun untuk menggunakan aplikasi";
      }
    }
    if (!password || password.length < 6)
      newErrors.password = "Kata sandi minimal 6 karakter";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok";
    if (!agreeTerms)
      newErrors.agreeTerms = "Kamu harus menyetujui syarat & ketentuan";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            gender: gender,
            birth_date: birthDate,
          },
        },
      });

      if (error) {
        setServerError(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setServerError(err.message || "Terjadi kesalahan pada koneksi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-6 pb-8 flex flex-col justify-between flex-1">
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center justify-center py-10 px-2"
        >
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center text-rose-500 mb-4 animate-bounce">
            <Camera className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Pendaftaran Berhasil!
          </h2>
          <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
            Akunmu telah terdaftar di database. Langkah selanjutnya adalah{" "}
            <strong>Verifikasi Selfie Langsung</strong> untuk mengaktifkan kartu
            swipe.
          </p>

          <div className="w-full bg-rose-50/80 dark:bg-zinc-800/80 border border-rose-200/60 dark:border-zinc-700 rounded-2xl p-4 mt-5 text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-600 dark:text-zinc-300">
              <span className="font-semibold text-rose-600 dark:text-rose-400 block">
                Keamanan Terjamin
              </span>
              Data profilmu telah tersimpan dengan aman di database.
            </div>
          </div>

          <Link href="/login" className="w-full mt-6">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Masuk ke Akun
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3.5"
        >
          {/* Server Error Alert */}
          {serverError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5 text-red-600 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Full Name */}
          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Sarah Angelina"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors({ ...errors, fullName: "" });
            }}
            error={errors.fullName}
            leftIcon={<User className="w-4 h-4" />}
          />

          {/* Email */}
          <Input
            label="Email"
            placeholder="nama@email.com"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          {/* WhatsApp Phone Number */}
          <Input
            label="Nomor WhatsApp"
            placeholder="08123456789"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            helperText="Digunakan untuk notifikasi kencan via WhatsApp"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            error={errors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          {/* Gender Selector */}
          <div className="flex flex-col gap-1.5 text-left pt-1">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
              Jenis Kelamin
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                  gender === "female"
                    ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 ring-2 ring-rose-500/20"
                    : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">👩</span>
                  {gender === "female" && (
                    <CheckCircle2 className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold">Wanita</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                    Menentukan tempat kencan
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGender("male")}
                className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                  gender === "male"
                    ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 ring-2 ring-rose-500/20"
                    : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">👨</span>
                  {gender === "male" && (
                    <CheckCircle2 className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold">Pria</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                    Menerima undangan kencan
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Date of Birth */}
          <Input
            label="Tanggal Lahir"
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              if (errors.birthDate) setErrors({ ...errors, birthDate: "" });
            }}
            error={errors.birthDate}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          {/* Password */}
          <Input
            label="Kata Sandi"
            placeholder="Minimal 6 karakter"
            isPassword
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          {/* Confirm Password */}
          <Input
            label="Konfirmasi Kata Sandi"
            placeholder="Ulangi kata sandi"
            isPassword
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors({ ...errors, confirmPassword: "" });
            }}
            error={errors.confirmPassword}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          {/* Safety Notice Banner */}
          <div className="bg-rose-50/70 dark:bg-zinc-800/80 border border-rose-200/50 dark:border-zinc-700/80 rounded-2xl p-3 flex items-start gap-2.5 my-1">
            <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
              <strong>Anti-Catfishing:</strong> Setiap pengguna wajib mengambil
              foto selfie langsung untuk memastikan kencan nyata yang aman.
            </p>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-1 text-left">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded-md text-rose-500 focus:ring-rose-400 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <label
              htmlFor="agreeTerms"
              className="text-[11px] text-zinc-500 dark:text-zinc-400 select-none cursor-pointer"
            >
              Saya berusia 18+ tahun dan menyetujui{" "}
              <span className="text-rose-600 font-semibold hover:underline">
                Syarat & Ketentuan
              </span>{" "}
              serta Panduan Keamanan Kencan.
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-red-500 font-medium ml-1">
              {errors.agreeTerms}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="mt-3"
          >
            Daftar Akun Baru
          </Button>

          {/* Bottom Switch to Login */}
          <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-3">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </motion.form>
      )}
    </div>
  );
}
