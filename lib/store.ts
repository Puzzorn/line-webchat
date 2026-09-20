import { LineUserProfile, ChatMessage } from './types';

// In-Memory Global Store fallback for local Node runtime
const globalStore = globalThis as unknown as {
  usersMap: Map<string, LineUserProfile>;
  messagesMap: Map<string, ChatMessage[]>;
  isInitialized: boolean;
};

if (!globalStore.usersMap) {
  globalStore.usersMap = new Map<string, LineUserProfile>();
}

if (!globalStore.messagesMap) {
  globalStore.messagesMap = new Map<string, ChatMessage[]>();
}

// Support for Upstash Redis / Vercel KV REST API Persistence (supporting all Vercel environment variable prefixes)
const kvUrl =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.STORAGE_REST_API_URL ||
  process.env.STORAGE_URL ||
  process.env.KV_URL ||
  '';

const kvToken =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.STORAGE_REST_API_TOKEN ||
  process.env.STORAGE_TOKEN ||
  process.env.KV_TOKEN ||
  '';

const hasKV = Boolean(kvUrl && kvToken);

async function kvFetch(command: string, ...args: string[]) {
  if (!hasKV) return null;
  try {
    const baseUrl = kvUrl.replace(/\/$/, '');
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([command.toUpperCase(), ...args]),
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return data.result;
    }

    // Fallback to path-based GET if endpoint expects URI parameters
    const getUrl = `${baseUrl}/${command}/${args.map(encodeURIComponent).join('/')}`;
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
      cache: 'no-store',
    });
    if (getRes.ok) {
      const data = await getRes.json();
      return data.result;
    }
  } catch (err) {
    console.error('KV Storage Fetch Error:', err);
  }
  return null;
}

// Seed demo data ONLY if NOT in Live Mode and store has not been initialized yet
const secret = process.env.LINE_CHANNEL_SECRET || '';
const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const isLiveConfigured = Boolean(
  secret &&
  secret !== 'your_line_channel_secret_here' &&
  token &&
  token !== 'your_line_channel_access_token_here'
);

if (!isLiveConfigured && !globalStore.isInitialized) {
  globalStore.isInitialized = true;
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
  getUsers: async (): Promise<LineUserProfile[]> => {
    if (hasKV) {
      const result = await kvFetch('get', 'line_webchat_users');
      if (result) {
        try {
          const users: LineUserProfile[] = typeof result === 'string' ? JSON.parse(result) : result;
          return users.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
        } catch (e) {
          console.error('Parse KV Users error:', e);
        }
      }
    }
    return Array.from(globalStore.usersMap.values()).sort(
      (a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
    );
  },

  getUser: async (userId: string): Promise<LineUserProfile | undefined> => {
    const users = await db.getUsers();
    return users.find((u) => u.userId === userId);
  },

  saveUser: async (user: LineUserProfile): Promise<LineUserProfile> => {
    const users = await db.getUsers();
    const existingIndex = users.findIndex((u) => u.userId === user.userId);
    const updatedUser = {
      ...(existingIndex >= 0 ? users[existingIndex] : {}),
      ...user,
      lastMessageTimestamp: user.lastMessageTimestamp || Date.now(),
    };

    if (existingIndex >= 0) {
      users[existingIndex] = updatedUser;
    } else {
      users.push(updatedUser);
    }

    // In-memory update
    globalStore.usersMap.set(user.userId, updatedUser);

    // KV storage update
    if (hasKV) {
      await kvFetch('set', 'line_webchat_users', JSON.stringify(users));
    }

    return updatedUser;
  },

  getMessages: async (userId: string): Promise<ChatMessage[]> => {
    if (hasKV) {
      const result = await kvFetch('get', `line_webchat_msgs_${userId}`);
      if (result) {
        try {
          return typeof result === 'string' ? JSON.parse(result) : result;
        } catch (e) {
          console.error('Parse KV Messages error:', e);
        }
      }
    }
    return globalStore.messagesMap.get(userId) || [];
  },

  addMessage: async (message: ChatMessage): Promise<ChatMessage> => {
    const userMessages = await db.getMessages(message.userId);

    // Replace if message ID exists (e.g. resend) or append new
    const existingIndex = userMessages.findIndex((m) => m.id === message.id);
    if (existingIndex >= 0) {
      userMessages[existingIndex] = message;
    } else {
      userMessages.push(message);
    }

    // In-memory update
    globalStore.messagesMap.set(message.userId, userMessages);

    // KV storage update
    if (hasKV) {
      await kvFetch('set', `line_webchat_msgs_${message.userId}`, JSON.stringify(userMessages));
    }

    // Update user's last message and unread count
    const existingUser = await db.getUser(message.userId);
    const isUserSender = message.sender === 'user';
    const currentUnread = existingUser?.unreadCount || 0;

    await db.saveUser({
      userId: message.userId,
      displayName: existingUser?.displayName || `LINE User (${message.userId.slice(0, 6)})`,
      pictureUrl: existingUser?.pictureUrl,
      lastMessage: message.text,
      lastMessageTimestamp: message.timestamp,
      unreadCount: isUserSender ? currentUnread + 1 : currentUnread,
    });

    return message;
  },

  clearUnreadCount: async (userId: string): Promise<void> => {
    const existingUser = await db.getUser(userId);
    if (existingUser && (existingUser.unreadCount || 0) > 0) {
      await db.saveUser({
        ...existingUser,
        unreadCount: 0,
      });
    }
  },

  deleteMessage: async (userId: string, messageId: string): Promise<boolean> => {
    const userMessages = await db.getMessages(userId);
    const filtered = userMessages.filter((m) => m.id !== messageId);

    // In-memory update
    globalStore.messagesMap.set(userId, filtered);

    // KV storage update
    if (hasKV) {
      await kvFetch('set', `line_webchat_msgs_${userId}`, JSON.stringify(filtered));
    }

    // Update user's last message if needed
    const lastMsg = filtered[filtered.length - 1];
    const existingUser = await db.getUser(userId);
    if (existingUser) {
      await db.saveUser({
        userId,
        displayName: existingUser.displayName,
        pictureUrl: existingUser.pictureUrl,
        lastMessage: lastMsg ? lastMsg.text : 'ไม่มีข้อความล่าสุด',
        lastMessageTimestamp: lastMsg ? lastMsg.timestamp : Date.now(),
      });
    }

    return true;
  },

  clearDemoUsers: async () => {
    const demoUserId = 'U1234567890abcdef1234567890abcdef';
    globalStore.usersMap.delete(demoUserId);
    globalStore.messagesMap.delete(demoUserId);
  },
};
