import { createClient } from "@/lib/supabase/client";
import { ChatConversation, ChatMessage, SendMessageParams } from "@/types/chat";

/**
 * Fetches all confirmed date conversations for the current user.
 * Chat is strictly available for confirmed dates (Scenario A).
 */
export async function fetchUserChatConversations(
  userId: string
): Promise<ChatConversation[]> {
  try {
    const supabase = createClient();

    // 1. Fetch confirmed date invitations
    const { data: invitations, error: invError } = await supabase
      .from("date_invitations")
      .select("*")
      .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    if (invError || !invitations || invitations.length === 0) {
      return [];
    }

    // 2. Extract partner IDs and match IDs
    const partnerIds = invitations.map((inv) =>
      inv.inviter_id === userId ? inv.invitee_id : inv.inviter_id
    );
    const matchIds = invitations.map((inv) => inv.match_id);

    // 3. Fetch partner profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, city")
      .in("id", partnerIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // 4. Fetch last messages for each match
    let lastMessagesMap = new Map<string, { content: string; createdAt: string; senderId: string }>();
    try {
      const { data: messages } = await supabase
        .from("messages")
        .select("match_id, content, created_at, sender_id")
        .in("match_id", matchIds)
        .order("created_at", { ascending: false });

      if (messages) {
        for (const msg of messages) {
          if (!lastMessagesMap.has(msg.match_id)) {
            lastMessagesMap.set(msg.match_id, {
              content: msg.content,
              createdAt: msg.created_at,
              senderId: msg.sender_id,
            });
          }
        }
      }
    } catch {
      // Table may not have messages yet or is initializing
    }

    // 5. Assemble conversations list
    return invitations.map((inv) => {
      const partnerId = inv.inviter_id === userId ? inv.invitee_id : inv.inviter_id;
      const partner = profileMap.get(partnerId);
      const lastMsg = lastMessagesMap.get(inv.match_id) || null;

      return {
        matchId: inv.match_id,
        invitationId: inv.id,
        partner: {
          id: partnerId,
          fullName: partner?.full_name || "Pasangan Kencan",
          avatarUrl: partner?.avatar_url || "",
          city: partner?.city || inv.city,
        },
        venueName: inv.venue_name,
        city: inv.city,
        dateSlot: inv.date_slot,
        timeSlot: inv.time_slot,
        lastMessage: lastMsg,
      };
    });
  } catch (err) {
    console.error("fetchUserChatConversations unexpected error:", err);
    return [];
  }
}

/**
 * Fetches message history for a specific match
 */
export async function fetchChatMessages(
  matchId: string,
  currentUserId: string
): Promise<ChatMessage[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("fetchChatMessages notice:", error.message);
      return [];
    }

    return (data || []).map((m) => ({
      id: m.id,
      matchId: m.match_id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      content: m.content,
      createdAt: m.created_at,
      isSender: m.sender_id === currentUserId,
    }));
  } catch (err) {
    console.error("fetchChatMessages error:", err);
    return [];
  }
}

/**
 * Sends a new message in Supabase
 */
export async function sendChatMessage(
  params: SendMessageParams
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        match_id: params.matchId,
        sender_id: params.senderId,
        receiver_id: params.receiverId,
        content: params.content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("sendChatMessage error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("sendChatMessage error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Gets coordination details (partner profile & venue info) for a chat room
 */
export async function getChatRoomDetails(
  matchId: string,
  currentUserId: string
): Promise<{
  partner: { id: string; fullName: string; avatarUrl: string };
  venueName: string;
  city: string;
  dateSlot: string;
  timeSlot: string;
  status: string;
} | null> {
  try {
    const supabase = createClient();

    const { data: inv, error } = await supabase
      .from("date_invitations")
      .select("*")
      .eq("match_id", matchId)
      .in("status", ["confirmed", "completed", "canceled"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !inv) {
      return null;
    }

    const partnerId = inv.inviter_id === currentUserId ? inv.invitee_id : inv.inviter_id;

    const { data: partner } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", partnerId)
      .single();

    return {
      partner: {
        id: partnerId,
        fullName: partner?.full_name || "Pasangan Kencan",
        avatarUrl: partner?.avatar_url || "",
      },
      venueName: inv.venue_name,
      city: inv.city,
      dateSlot: inv.date_slot,
      timeSlot: inv.time_slot,
      status: inv.status,
    };
  } catch (err) {
    console.error("getChatRoomDetails error:", err);
    return null;
  }
}
