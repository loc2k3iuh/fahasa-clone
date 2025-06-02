export interface Message {
  id: string;
  content: string;
  dateSent: string;
  messageType: string;
  messageRoomId: string;
  senderId: number;
  senderUsername: string;
  senderAvatarUrl?: string;
}

export interface MessageRoomMember {
  userId: number;
  username: string;
  avatarUrl?: string;
  isAdmin: boolean;
  lastSeen: string;
}

export interface MessageRoom {
  id: string;
  name: string;
  isGroup: boolean;
  createdDate: string;
  createdBy: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  members: MessageRoomMember[];
  lastMessage?: Message;
}

export interface MessageRequest {
  content: string;
  message_room_id: string;
  message_type?: string;
  sender_id: number;
}

export interface OnlineUser {
  userId: number;
  username: string;
  avatarUrl?: string;
  isAdmin: boolean;
}
