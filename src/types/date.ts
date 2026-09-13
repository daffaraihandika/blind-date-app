import { Gender } from "@/types/auth";

export interface Venue {
  id: string;
  name: string;
  city: string;
  area?: string;
}

export type InvitationStatus =
  | "needs_venue_selection"
  | "pending_confirmation"
  | "confirmed"
  | "completed"
  | "canceled"
  | "declined";

export interface DateInvitation {
  id: string;
  matchId: string;
  inviterId: string;
  inviteeId: string;
  venueName: string;
  city: string;
  dateSlot: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "16:00 WIB"
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DateInvitationWithPartner extends DateInvitation {
  isInviter: boolean;
  canPlanDate?: boolean;
  partner: {
    id: string;
    fullName: string;
    avatarUrl: string;
    gender: Gender;
    phone: string;
    city: string;
    bio: string;
  };
}

export interface CreateInvitationParams {
  matchId: string;
  inviterId: string;
  inviteeId: string;
  venueName: string;
  city: string;
  dateSlot: string;
  timeSlot: string;
}
