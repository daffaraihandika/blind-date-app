import React from "react";
import type { Metadata } from "next";
import AuthHeader from "@/components/auth/AuthHeader";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk | BlindDate App",
  description: "Masuk ke akun BlindDate untuk menemukan kencan offline nyata.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1 w-full h-full min-h-0 overflow-y-auto no-scrollbar">
      <AuthHeader
        title="Selamat Datang Kembali"
        subtitle="Masuk untuk melihat kencan yang tertunda & swipe calon kencanmu."
        badgeText="Real Dates, No Endless Chat"
      />
      <LoginForm />
      {/* Bottom breathing space */}
      <div className="h-6 shrink-0" />
    </div>
  );
}
