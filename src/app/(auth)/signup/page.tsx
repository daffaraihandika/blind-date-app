import React from "react";
import type { Metadata } from "next";
import AuthHeader from "@/components/auth/AuthHeader";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Daftar Akun | BlindDate App",
  description: "Buat akun BlindDate dan temukan pasangan kencan langsung tanpa basa-basi chat.",
};

export default function SignupPage() {
  return (
    <div className="flex flex-col flex-1 w-full h-full min-h-0 overflow-y-auto no-scrollbar">
      <AuthHeader
        title="Buat Akun Baru"
        subtitle="Mulai pengalaman blind date offline yang aman dan terverifikasi."
        badgeText="100% Verified Profiles"
      />
      <SignupForm />
      {/* Bottom breathing space for smooth scrolling */}
      <div className="h-6 shrink-0" />
    </div>
  );
}
