'use client';

import { useState } from 'react';
import { LineUserProfile } from '@/lib/types';
import { MessageSquare, User, Search, PlusCircle } from 'lucide-react';

interface UserListProps {
  users: LineUserProfile[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onAddMockUser?: () => void;
}

export function UserList({
  users,
  selectedUserId,
  onSelectUser,
  onAddMockUser,
}: UserListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((u) =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-emerald-700 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-white text-emerald-700 font-bold flex items-center justify-center text-sm shadow-sm">
            LINE
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">LINE OA Webchat</h1>
            <p className="text-xs text-emerald-150 opacity-90">ผู้ใช้งานทั้งหมด ({users.length})</p>
          </div>
        </div>

        {onAddMockUser && (
          <button
            onClick={onAddMockUser}
            title="จำลองสร้าง User ใหม่ (สำหรับทดสอบ)"
            className="p-1.5 hover:bg-emerald-600 rounded-lg transition-colors text-white"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-100 bg-slate-50">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>ไม่พบรายชื่อผู้ใช้งาน</p>
            <p className="text-xs text-slate-400 mt-1">ส่งข้อความจาก LINE OA เข้ามาเพื่อเริ่มแชท</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isSelected = user.userId === selectedUserId;
            return (
              <button
                key={user.userId}
                onClick={() => onSelectUser(user.userId)}
                className={`w-full p-3.5 flex items-start space-x-3 text-left transition-colors relative ${
                  isSelected
                    ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* User Avatar */}
                <div className="relative flex-shrink-0">
                  {user.pictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.pictureUrl}
                      alt={user.displayName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-base border border-emerald-200">
                      {user.displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0 shadow-sm" />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm text-slate-900 truncate">
                      {user.displayName}
                    </h2>
                    <span className="text-[11px] text-slate-400 ml-1 flex-shrink-0">
                      {formatTime(user.lastMessageTimestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate mt-1">
                    {user.lastMessage || 'ไม่มีข้อความล่าสุด'}
                  </p>

                  <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5 opacity-60">
                    ID: {user.userId}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
