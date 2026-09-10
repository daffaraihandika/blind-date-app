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
 * Fetches all date invitations involving the current user, joined with partner profile details
 */
export async function fetchUserDateInvitations(
  userId: string
): Promise<DateInvitationWithPartner[]> {
  try {
    const supabase = createClient();

    // 1. Fetch invitations
    const { data: invitations, error } = await supabase
      .from("date_invitations")
      .select("*")
      .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error || !invitations || invitations.length === 0) {
      return [];
    }

    // 2. Extract partner IDs
    const partnerIds = invitations.map((inv) =>
      inv.inviter_id === userId ? inv.invitee_id : inv.inviter_id
    );

    // 3. Fetch partner profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, gender, phone, city, bio")
      .in("id", partnerIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // 4. Merge into final format
    return invitations.map((inv) => {
      const isInviter = inv.inviter_id === userId;
      const partnerId = isInviter ? inv.invitee_id : inv.inviter_id;
      const partner = profileMap.get(partnerId);

      return {
        id: inv.id,
        matchId: inv.match_id,
        inviterId: inv.inviter_id,
        inviteeId: inv.invitee_id,
        venueName: inv.venue_name,
        city: inv.city,
        dateSlot: inv.date_slot,
        timeSlot: inv.time_slot,
        status: inv.status as InvitationStatus,
        createdAt: inv.created_at,
        updatedAt: inv.updated_at,
        isInviter,
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

    // If confirmed, update match table
    if (newStatus === "confirmed") {
      await supabase
        .from("matches")
        .update({ status: "date_confirmed", updated_at: new Date().toISOString() })
        .eq("id", matchId);
    }

    return true;
  } catch (err) {
    console.error("updateInvitationStatus unexpected error:", err);
    return false;
  }
}
