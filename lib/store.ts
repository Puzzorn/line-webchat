import { LineUserProfile, ChatMessage } from './types';

// In-Memory Global Store to preserve data across API requests in Node runtime
const globalStore = globalThis as unknown as {
  usersMap: Map<string, LineUserProfile>;
  messagesMap: Map<string, ChatMessage[]>;
};

if (!globalStore.usersMap) {
  globalStore.usersMap = new Map<string, LineUserProfile>();
}

if (!globalStore.messagesMap) {
  globalStore.messagesMap = new Map<string, ChatMessage[]>();
  
  // Seed demo data for testing UI out of the box
  const demoUserId = 'U1234567890abcdef1234567890abcdef';
  const now = Date.now();
  
  globalStore.usersMap.set(demoUserId, {
    userId: demoUserId,
    displayName: 'Somchai (LINE User Demo)',
    pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Somchai',
    statusMessage: 'Hello from LINE!',
    lastMessage: 'สวัสดีครับ สนใจสอบถามบริการครับ',
    lastMessageTimestamp: now - 300000,
    unreadCount: 1,
  });

  globalStore.messagesMap.set(demoUserId, [
    {
      id: 'msg-1',
      userId: demoUserId,
      sender: 'user',
      text: 'สวัสดีครับ สนใจสอบถามบริการครับ',
      timestamp: now - 300000,
      status: 'sent',
    },
  ]);
}

export const db = {
  getUsers: (): LineUserProfile[] => {
    return Array.from(globalStore.usersMap.values()).sort(
      (a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
    );
  },

  getUser: (userId: string): LineUserProfile | undefined => {
    return globalStore.usersMap.get(userId);
  },

  saveUser: (user: LineUserProfile): LineUserProfile => {
    const existing = globalStore.usersMap.get(user.userId);
    const updated = {
      ...existing,
      ...user,
      lastMessageTimestamp: user.lastMessageTimestamp || Date.now(),
    };
    globalStore.usersMap.set(user.userId, updated);
    return updated;
  },

  getMessages: (userId: string): ChatMessage[] => {
    return globalStore.messagesMap.get(userId) || [];
  },

  addMessage: (message: ChatMessage): ChatMessage => {
    const userMessages = globalStore.messagesMap.get(message.userId) || [];
    userMessages.push(message);
    globalStore.messagesMap.set(message.userId, userMessages);

    // Update user's last message
    const user = globalStore.usersMap.get(message.userId);
    if (user) {
      user.lastMessage = message.text;
      user.lastMessageTimestamp = message.timestamp;
      globalStore.usersMap.set(message.userId, user);
    }

    return message;
  }
};
