export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'webchat';
  text: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'failed';
  errorDetails?: string;
}
