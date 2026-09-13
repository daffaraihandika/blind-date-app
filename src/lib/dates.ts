import { createClient } from "@/lib/supabase/client";
import {
  Venue,
  DateInvitationWithPartner,
  CreateInvitationParams,
  InvitationStatus,
} from "@/types/date";

/**
 * Fetches curated venues from Supabase for a given city
 */
export async function fetchVenuesByCity(city: string): Promise<Venue[]> {
  try {
    const supabase = createClient();
    let query = supabase.from("venues").select("*");

    if (city && city !== "Semua Wilayah") {
      query = query.eq("city", city);
    }

    const { data, error } = await query.order("area", { ascending: true }).order("name", { ascending: true });

    if (error) {
      console.warn("fetchVenuesByCity notice:", error.message);
      return [];
    }

    return (data || []).map((v) => ({
      id: v.id,
      name: v.name,
      city: v.city,
      area: v.area || "",
    }));
  } catch (err) {
    console.error("fetchVenuesByCity error:", err);
    return [];
  }
}

/**
 * Creates a new date invitation in Supabase
 */
export async function createDateInvitation(
  params: CreateInvitationParams
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("date_invitations")
      .insert({
        match_id: params.matchId,
        inviter_id: params.inviterId,
        invitee_id: params.inviteeId,
        venue_name: params.venueName,
        city: params.city,
        date_slot: params.dateSlot,
        time_slot: params.timeSlot,
        status: "pending_confirmation",
      })
      .select()
      .single();

    if (error) {
      console.error("createDateInvitation error:", error.message);
      return { success: false, error: error.message };
    }

    // Update match status to 'date_proposed'
    await supabase
      .from("matches")
      .update({ status: "date_proposed", updated_at: new Date().toISOString() })
      .eq("id", params.matchId);

    return { success: true, data };
  } catch (err: any) {
    console.error("createDateInvitation unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Checks if a date and time slot has passed current time (+ buffer in hours)
 */
export function isDateTimePassed(
  dateSlot: string,
  timeSlot: string,
  bufferHours = 2
): boolean {
  try {
    if (!dateSlot) return false;
    const timeMatch = timeSlot ? timeSlot.match(/(\d{1,2}):(\d{2})/) : null;
    let hours = 20; // default evening
    let minutes = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }

    const [year, month, day] = dateSlot.split("-").map((s) => parseInt(s, 10));
    if (!year || !month || !day) return false;

    const targetDate = new Date(year, month - 1, day, hours, minutes, 0);
    const expiryTime = targetDate.getTime() + bufferHours * 60 * 60 * 1000;

    return Date.now() >= expiryTime;
  } catch {
    return false;
  }
}

/**
 * Fetches all date invitations and pending matches involving the current user,
 * joined with partner profile details.
 */
export async function fetchUserDateInvitations(
  userId: string
): Promise<DateInvitationWithPartner[]> {
  try {
    const supabase = createClient();

    // 1. Fetch existing date invitations
    const { data: invitations } = await supabase
      .from("date_invitations")
      .select("*")
      .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    const existingInvitations = invitations || [];
    const invitationMatchIds = new Set(existingInvitations.map((inv) => inv.match_id));

    // 2. Fetch matches that have not yet created a date invitation (status = 'matched')
    const { data: matches } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq("status", "matched")
      .order("created_at", { ascending: false });

    // Filter out matches that already have an invitation
    const pendingMatches = (matches || []).filter(
      (m) => !invitationMatchIds.has(m.id)
    );

    if (existingInvitations.length === 0 && pendingMatches.length === 0) {
      return [];
    }

    // 3. Extract all partner IDs and include current user to check profile/gender
    const partnerIds = new Set<string>();
    for (const inv of existingInvitations) {
      partnerIds.add(inv.inviter_id === userId ? inv.invitee_id : inv.inviter_id);
    }
    for (const m of pendingMatches) {
      partnerIds.add(m.user1_id === userId ? m.user2_id : m.user1_id);
    }
    partnerIds.add(userId);

    // 4. Fetch profiles for partners and current user
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, gender, phone, city, bio")
      .in("id", Array.from(partnerIds));

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    const currentUserProfile = profileMap.get(userId);

    // 5. Map invitations to DateInvitationWithPartner & check for auto-completion
    const passedToComplete: { id: string; matchId: string }[] = [];

    const mappedInvitations: DateInvitationWithPartner[] = existingInvitations.map((inv) => {
      const isInviter = inv.inviter_id === userId;
      const partnerId = isInviter ? inv.invitee_id : inv.inviter_id;
      const partner = profileMap.get(partnerId);

      let currentStatus = inv.status as InvitationStatus;

      // Auto-detect completed date: if date and time slot have passed (+ 2h buffer)
      if (currentStatus === "confirmed" && isDateTimePassed(inv.date_slot, inv.time_slot)) {
        currentStatus = "completed";
        passedToComplete.push({ id: inv.id, matchId: inv.match_id });
      }

      return {
        id: inv.id,
        matchId: inv.match_id,
        inviterId: inv.inviter_id,
        inviteeId: inv.invitee_id,
        venueName: inv.venue_name,
        city: inv.city,
        dateSlot: inv.date_slot,
        timeSlot: inv.time_slot,
        status: currentStatus,
        createdAt: inv.created_at,
        updatedAt: inv.updated_at,
        isInviter,
        canPlanDate: false,
        partner: {
          id: partnerId,
          fullName: partner?.full_name || "Pasangan Kencan",
          avatarUrl: partner?.avatar_url || "",
          gender: partner?.gender || "female",
          phone: partner?.phone || "",
          city: partner?.city || inv.city,
          bio: partner?.bio || "",
        },
      };
    });

    // Asynchronously update status in Supabase for auto-completed dates
    if (passedToComplete.length > 0) {
      Promise.all(
        passedToComplete.map(({ id, matchId }) =>
          updateInvitationStatus(id, matchId, "completed")
        )
      ).catch((err) => console.warn("Auto-completion sync warning:", err));
    }

    // 6. Map pending matches (needs_venue_selection) to DateInvitationWithPartner
    const mappedMatches: DateInvitationWithPartner[] = pendingMatches.map((m) => {
      const partnerId = m.user1_id === userId ? m.user2_id : m.user1_id;
      const partner = profileMap.get(partnerId);

      // Determine whether the current user is female / has authority to pick venue
      const isCurrentUserFemale =
        m.female_id === userId ||
        currentUserProfile?.gender === "female" ||
        partner?.gender === "male";

      const defaultCity =
        (isCurrentUserFemale ? currentUserProfile?.city : partner?.city) ||
        currentUserProfile?.city ||
        partner?.city ||
        "Jakarta Selatan";

      return {
        id: m.id,
        matchId: m.id,
        inviterId: isCurrentUserFemale ? userId : partnerId,
        inviteeId: isCurrentUserFemale ? partnerId : userId,
        venueName: "",
        city: defaultCity,
        dateSlot: "",
        timeSlot: "",
        status: "needs_venue_selection" as InvitationStatus,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
        isInviter: isCurrentUserFemale,
        canPlanDate: isCurrentUserFemale,
        partner: {
          id: partnerId,
          fullName: partner?.full_name || "Pasangan Match",
          avatarUrl: partner?.avatar_url || "",
          gender: partner?.gender || "male",
          phone: partner?.phone || "",
          city: partner?.city || defaultCity,
          bio: partner?.bio || "",
        },
      };
    });

    // 7. Merge and sort by createdAt descending
    const allItems = [...mappedInvitations, ...mappedMatches].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allItems;
  } catch (err) {
    console.error("fetchUserDateInvitations error:", err);
    return [];
  }
}

/**
 * Updates date invitation status (e.g. 'confirmed', 'declined', 'canceled', 'completed')
 */
export async function updateInvitationStatus(
  invitationId: string,
  matchId: string,
  newStatus: InvitationStatus
): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("date_invitations")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId);

    if (error) {
      console.error("updateInvitationStatus error:", error.message);
      return false;
    }

    // Update match table status accordingly
    const matchStatusMap: Record<string, string> = {
      confirmed: "date_confirmed",
      completed: "completed",
      canceled: "date_canceled",
      declined: "date_declined",
    };

    if (matchStatusMap[newStatus]) {
      await supabase
        .from("matches")
        .update({
          status: matchStatusMap[newStatus],
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId);
    }

    return true;
  } catch (err) {
    console.error("updateInvitationStatus unexpected error:", err);
    return false;
  }
}
