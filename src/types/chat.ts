export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isSender?: boolean;
}

export interface ChatConversation {
  matchId: string;
  invitationId: string;
  partner: {
    id: string;
    fullName: string;
    avatarUrl: string;
    city: string;
  };
  venueName: string;
  city: string;
  dateSlot: string;
  timeSlot: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
}

export interface SendMessageParams {
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
}
