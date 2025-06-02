export interface ChatMessage {
  id?: string;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string | null;
  receiverId?: number;
  timestamp: string;
  isRead?: boolean;
}

export interface ChatConversation {
  id: string;
  userId: number;
  userName: string;
  userAvatar?: string | null;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface AdminStatus {
  isOnline: boolean;
  lastSeen?: string;
}
