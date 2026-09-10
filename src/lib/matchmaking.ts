import { createClient } from "@/lib/supabase/client";
import { ProfileFeedCard, SwipeDirection } from "@/types/match";
import { Gender } from "@/types/auth";

/**
 * Fetches feed candidate profiles from Supabase with strict gender, city, and unswiped filtering.
 */
export async function fetchFeedProfiles(
  userId: string,
  userGender: Gender,
  selectedCity: string
): Promise<ProfileFeedCard[]> {
  try {
    const supabase = createClient();
    const targetGender = userGender === "male" ? "female" : "male";

    // 1. Get all user IDs that current user has already swiped on
    let swipedTargetIds: string[] = [];
    if (userId) {
      const { data: swipeRows } = await supabase
        .from("swipes")
        .select("target_id")
        .eq("swiper_id", userId);

      if (swipeRows && swipeRows.length > 0) {
        swipedTargetIds = swipeRows.map((r) => r.target_id);
      }
    }

    // 2. Query target profiles from Supabase
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("gender", targetGender)
      .eq("is_selfie_verified", true);

    // Filter by city if selected
    if (selectedCity && selectedCity !== "Semua Wilayah") {
      query = query.eq("city", selectedCity);
    }

    // Exclude own user ID
    if (userId) {
      query = query.neq("id", userId);
    }

    // Exclude already swiped profiles
    if (swipedTargetIds.length > 0) {
      query = query.not("id", "in", `(${swipedTargetIds.join(",")})`);
    }

    // Prioritize newest accounts on top
    query = query.order("created_at", { ascending: false }).limit(20);

    const { data: profilesData, error } = await query;

    if (error) {
      console.warn("Supabase fetchFeedProfiles error:", error.message);
      return [];
    }

    if (!profilesData || profilesData.length === 0) {
      return [];
    }

    // Map to ProfileFeedCard type
    return profilesData.map((p) => {
      const birthYear = p.birth_date
        ? new Date(p.birth_date).getFullYear()
        : 2000;
      const age = new Date().getFullYear() - birthYear;

      return {
        id: p.id,
        fullName: p.full_name || "Pengguna",
        age: age > 0 ? age : 24,
        gender: p.gender || targetGender,
        city: p.city || selectedCity,
        bio: p.bio || "",
        selfieVerified: Boolean(p.is_selfie_verified),
        avatarUrl: p.avatar_url || "",
        photos: Array.isArray(p.photos) ? p.photos : [],
        interests: Array.isArray(p.interests)
          ? p.interests.map((i: string) => ({
              id: i,
              label: i.charAt(0).toUpperCase() + i.slice(1),
              icon: "✨",
            }))
          : [],
        prompts: Array.isArray(p.prompts) ? p.prompts : [],
      };
    });
  } catch (err) {
    console.error("fetchFeedProfiles unexpected error:", err);
    return [];
  }
}

/**
 * Records a swipe (left / right) to Supabase and checks if a mutual match was created.
 */
export async function recordSwipe(
  swiperId: string,
  targetId: string,
  direction: SwipeDirection
): Promise<{ isMatch: boolean; matchRecord?: any }> {
  try {
    const supabase = createClient();
    const swipeDir = direction === "right" ? "right" : "left";

    // 1. Insert swipe record to 'swipes' table
    const { error: swipeError } = await supabase.from("swipes").insert({
      swiper_id: swiperId,
      target_id: targetId,
      direction: swipeDir,
    });

    if (swipeError) {
      console.warn("Record swipe error:", swipeError.message);
    }

    // 2. If it's a right swipe (LIKE), check if trigger created a match in 'matches' table
    if (swipeDir === "right") {
      const { data: matchData } = await supabase
        .from("matches")
        .select("*")
        .or(
          `and(user1_id.eq.${swiperId},user2_id.eq.${targetId}),and(user1_id.eq.${targetId},user2_id.eq.${swiperId})`
        )
        .maybeSingle();

      if (matchData) {
        return { isMatch: true, matchRecord: matchData };
      }
    }

    return { isMatch: false };
  } catch (err) {
    console.error("recordSwipe unexpected error:", err);
    return { isMatch: false };
  }
}
