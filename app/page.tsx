'use client';

import { useState, useEffect, useCallback } from 'react';
import { LineUserProfile, ChatMessage, MessageType } from '@/lib/types';
import { UserList } from '@/components/user-list';
import { ChatBox } from '@/components/chat-box';

export default function WebchatPage() {
  const [users, setUsers] = useState<LineUserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isRefreshingMessages, setIsRefreshingMessages] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [oaProfile, setOaProfile] = useState<{ displayName: string; pictureUrl: string } | null>(null);

  // Check system config mode (LIVE vs DEMO)
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setIsLiveMode(data.isLiveMode || false);
      }
    } catch (err) {
      console.error('Error fetching system config:', err);
    }
  }, []);

  // Fetch LINE OA Profile Info
  const fetchOaProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/line/oa-info');
      if (res.ok) {
        const data = await res.json();
        setOaProfile({ displayName: data.displayName, pictureUrl: data.pictureUrl });
      }
    } catch (err) {
      console.error('Error fetching LINE OA profile:', err);
    }
  }, []);

  // Fetch all active LINE users
  const fetchUsers = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshingUsers(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        const fetchedUsers: LineUserProfile[] = data.users || [];
        setUsers(fetchedUsers);

        // Auto select first user on desktop view if none selected
        if (!selectedUserId && fetchedUsers.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
          setSelectedUserId(fetchedUsers[0].userId);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
      if (isManualRefresh) setIsRefreshingUsers(false);
    }
  }, [selectedUserId]);

  // Fetch message history for selected user
  const fetchMessages = useCallback(async (userId: string, isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshingMessages(true);
    try {
      const res = await fetch(`/api/messages?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoadingMessages(false);
      if (isManualRefresh) setIsRefreshingMessages(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConfig();
    fetchOaProfile();
    fetchUsers();
  }, [fetchConfig, fetchOaProfile, fetchUsers]);

  // Load messages when selected user changes (with instant skeleton trigger)
  useEffect(() => {
    if (selectedUserId) {
      setMessages([]); // Instant clear to trigger ChatMessageSkeleton on desktop switch
      setIsLoadingMessages(true);
      fetchMessages(selectedUserId);
    } else {
      setMessages([]);
      setIsLoadingMessages(false);
    }
  }, [selectedUserId, fetchMessages]);

  // Polling for live updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConfig();
      fetchUsers();
      if (selectedUserId) {
        fetchMessages(selectedUserId);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedUserId, fetchConfig, fetchUsers, fetchMessages]);

  // Send Rich Message to LINE User (text, sticker, image, file)
  const handleSendMessage = async (
    text: string,
    type: MessageType = 'text',
    mediaUrl?: string,
    packageId?: string,
    stickerId?: string,
    replyTo?: { id: string; text: string; sender: 'user' | 'webchat'; quoteToken?: string }
  ) => {
    if (!selectedUserId) return;

    try {
      const res = await fetch('/api/line/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, text, type, mediaUrl, packageId, stickerId, replyTo }),
      });

      if (res.ok) {
        await fetchMessages(selectedUserId);
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Resend Failed Message
  const handleResendMessage = async (msg: ChatMessage) => {
    if (!selectedUserId) return;
    try {
      await handleSendMessage(msg.text, msg.type, msg.mediaUrl, msg.packageId, msg.stickerId);
      // Delete old failed message entry
      await handleDeleteMessage(msg.id);
    } catch (err) {
      console.error('Error resending message:', err);
    }
  };

  // Delete Failed Message
  const handleDeleteMessage = async (msgId: string) => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`/api/messages?userId=${encodeURIComponent(selectedUserId)}&messageId=${encodeURIComponent(msgId)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchMessages(selectedUserId);
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  // Simulate incoming LINE Message (via Webhook with internal simulation header)
  const handleSimulateIncomingMessage = async (text: string) => {
    if (!selectedUserId) return;

    const mockWebhookBody = {
      destination: 'line_oa_destination',
      events: [
        {
          type: 'message',
          message: {
            id: `msg-sim-${Date.now()}`,
            type: 'text',
            text: text,
          },
          timestamp: Date.now(),
          source: {
            type: 'user',
            userId: selectedUserId,
          },
        },
      ],
    };

    try {
      await fetch('/api/line/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-simulation': 'true',
        },
        body: JSON.stringify(mockWebhookBody),
      });

      await fetchMessages(selectedUserId);
      await fetchUsers();
    } catch (err) {
      console.error('Error simulating incoming message:', err);
    }
  };

  // Add mock user for instant manual testing
  const handleAddMockUser = async () => {
    const randomId = `U${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    const mockWebhookBody = {
      events: [
        {
          type: 'message',
          message: {
            id: `msg-init-${Date.now()}`,
            type: 'text',
            text: 'สวัสดีครับ สนใจสอบถามรายละเอียดสินค้าครับ',
          },
          timestamp: Date.now(),
          source: {
            type: 'user',
            userId: randomId,
          },
        },
      ],
    };

    try {
      await fetch('/api/line/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-simulation': 'true',
        },
        body: JSON.stringify(mockWebhookBody),
      });

      setSelectedUserId(randomId);
      await fetchUsers();
    } catch (err) {
      console.error('Error adding mock user:', err);
    }
  };

  const selectedUser = users.find((u) => u.userId === selectedUserId) || null;

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-100">
      {/* UserList Sidebar: Full width on mobile when no user selected, hidden on mobile when chat selected */}
      <UserList
        users={users}
        selectedUserId={selectedUserId}
        onSelectUser={(userId) => setSelectedUserId(userId)}
        onAddMockUser={handleAddMockUser}
        onRefresh={() => fetchUsers(true)}
        isLoadingUsers={isLoadingUsers}
        isRefreshingUsers={isRefreshingUsers}
        isLiveMode={isLiveMode}
        oaProfile={oaProfile}
        className={selectedUserId ? 'hidden md:flex' : 'flex'}
      />

      {/* ChatBox Main Area: Full width on mobile when user selected, hidden on mobile when no user selected */}
      <ChatBox
        selectedUser={selectedUser}
        messages={messages}
        onSendMessage={handleSendMessage}
        onSimulateIncomingMessage={handleSimulateIncomingMessage}
        onResendMessage={handleResendMessage}
        onDeleteMessage={handleDeleteMessage}
        onBack={() => setSelectedUserId(null)}
        onRefresh={() => selectedUserId && fetchMessages(selectedUserId, true)}
        isLoadingMessages={isLoadingMessages}
        isRefreshingMessages={isRefreshingMessages}
        isLiveMode={isLiveMode}
        className={!selectedUserId ? 'hidden md:flex' : 'flex'}
      />
    </main>
  );
}
