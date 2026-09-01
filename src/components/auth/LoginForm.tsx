"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const router = useRouter();
  const supabase = createClient();

  const validate = () => {
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) {
      newErrors.identifier = "Email akun wajib diisi";
    }
    if (!password) {
      newErrors.password = "Kata sandi wajib diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password: password,
      });

      if (error) {
        setServerError(
          error.message === "Invalid login credentials"
            ? "Email atau kata sandi tidak cocok. Silakan coba lagi."
            : error.message
        );
        setIsLoading(false);
      } else if (authData?.user) {
        setIsSuccess(true);

        // Periksa apakah user sudah menyelesaikan onboarding verifikasi selfie
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_selfie_verified")
          .eq("id", authData.user.id)
          .single();

        // Redirect otomatis
        setTimeout(() => {
          if (!profile || !profile.is_selfie_verified) {
            router.push("/onboarding");
          } else {
            router.push("/");
          }
        }, 800);
      }
    } catch (err: any) {
      setServerError(err.message || "Terjadi kesalahan saat masuk.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-6 pb-8 flex flex-col justify-between flex-1">
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center justify-center py-12 px-4"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Login Berhasil!
          </h2>
          <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
            Mengarahkan ke akunmu...
          </p>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {/* Server Error Alert */}
          {serverError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5 text-red-600 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Email Input */}
          <Input
            label="Email Akun"
            placeholder="nama@email.com"
            type="email"
            autoComplete="email"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errors.identifier) setErrors({ ...errors, identifier: undefined });
            }}
            error={errors.identifier}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          {/* Password Input */}
          <Input
            label="Kata Sandi"
            placeholder="Masukkan kata sandi akunmu"
            isPassword
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md text-rose-500 focus:ring-rose-400 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <span>Ingat saya</span>
            </label>

            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Fitur lupa kata sandi akan mengirimkan email reset resmi dari Supabase.");
              }}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold hover:underline"
            >
              Lupa sandi?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="mt-2"
          >
            Masuk Sekarang
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-zinc-900 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              atau lanjutkan dengan
            </span>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="social"
            size="md"
            fullWidth
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });
            }}
            leftIcon={
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 12s.6 3.6 1.6 5.6l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                />
              </svg>
            }
          >
            Google
          </Button>

          {/* Bottom Switch to Sign Up */}
          <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-4">
            Belum punya akun?{" "}
            <Link
              href="/signup"
              className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
            >
              Daftar Gratis
            </Link>
          </div>
        </motion.form>
      )}
    </div>
  );
}
