export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount?: number;
}

export type MessageType = 'text' | 'image' | 'sticker' | 'location' | 'file';

export interface ChatMessage {
  id: string;
  lineMessageId?: string;
  userId: string;
  sender: 'user' | 'webchat';
  text: string;
  type?: MessageType;
  mediaUrl?: string;
  packageId?: string;
  stickerId?: string;
  quoteToken?: string;
  markAsReadToken?: string;
  replyTo?: {
    id: string;
    text: string;
    sender: 'user' | 'webchat';
    quoteToken?: string;
  };
  timestamp: number;
  status?: 'sending' | 'sent' | 'failed' | 'read';
  errorDetails?: string;
}
