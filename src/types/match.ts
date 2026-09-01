import { Gender } from "@/types/auth";

export interface ProfileFeedCard {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  city: string;
  distanceKm?: number;
  bio: string;
  selfieVerified: boolean;
  avatarUrl: string;
  photos: string[];
  interests: { id: string; label: string; icon: string }[];
  prompts: { question: string; answer: string }[];
  isPro?: boolean;
}

export type SwipeDirection = "left" | "right" | "up";

export interface MatchEvent {
  matchedUser: ProfileFeedCard;
  currentUserAvatar?: string;
  currentUserName?: string;
  currentUserGender?: Gender;
}
