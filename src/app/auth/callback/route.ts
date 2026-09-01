import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Periksa apakah user sudah menyelesaikan onboarding verifikasi selfie
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_selfie_verified")
        .eq("id", data.user.id)
        .single();

      // Jika belum verifikasi selfie, otomatis arahkan ke onboarding
      if (!profile || !profile.is_selfie_verified) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // Jika sudah verifikasi selfie, langsung masuk ke beranda/feed
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // Jika otentikasi gagal, kembalikan ke login
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
