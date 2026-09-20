'use client';

import { useState } from 'react';
import { LineUserProfile } from '@/lib/types';
import { User, Search, PlusCircle, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface UserListProps {
  users: LineUserProfile[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onAddMockUser?: () => void;
  onRefresh?: () => void;
  isLoadingUsers?: boolean;
  isRefreshingUsers?: boolean;
  isLiveMode?: boolean;
  oaProfile?: { displayName: string; pictureUrl: string } | null;
  className?: string;
}

function UserSkeletonItem() {
  return (
    <div className="p-3.5 flex items-center space-x-3 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-3 bg-slate-200 rounded w-1/5" />
        </div>
        <div className="h-3 bg-slate-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export function UserList({
  users,
  selectedUserId,
  onSelectUser,
  onAddMockUser,
  onRefresh,
  isLoadingUsers = false,
  isRefreshingUsers = false,
  isLiveMode = false,
  oaProfile = null,
  className = '',
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
    <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full ${className}`}>
      {/* Header with LINE OA Profile & Name */}
      <div className="p-4 border-b border-slate-100 bg-emerald-700 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          {oaProfile?.pictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={oaProfile.pictureUrl}
              alt={oaProfile.displayName || 'LINE OA'}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/80 shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white text-emerald-700 font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
              LINE
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-base leading-tight truncate">
              {oaProfile?.displayName || 'LINE OA Webchat'}
            </h1>
            <p className="text-xs text-emerald-100 opacity-90">ผู้ใช้งานทั้งหมด ({users.length})</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshingUsers}
              title="รีเฟรชรายชื่อผู้ใช้"
              className="p-1.5 hover:bg-emerald-600 rounded-lg transition-colors text-white disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingUsers ? 'animate-spin' : ''}`} />
            </button>
          )}

          {!isLiveMode && onAddMockUser && (
            <button
              onClick={onAddMockUser}
              title="จำลองสร้าง User ใหม่ (สำหรับทดสอบ)"
              className="p-1.5 hover:bg-emerald-600 rounded-lg transition-colors text-white"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Mode vs Demo Mode Status Indicator */}
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-100 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">สถานะระบบ:</span>
        {isLiveMode ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            LIVE (เชื่อมต่อ LINE API)
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            DEMO (โหมดจำลอง)
          </span>
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

      {/* Users List / Skeleton Loading */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isLoadingUsers ? (
          <>
            <UserSkeletonItem />
            <UserSkeletonItem />
            <UserSkeletonItem />
            <UserSkeletonItem />
          </>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>ไม่พบรายชื่อผู้ใช้งาน</p>
            <p className="text-xs text-slate-400 mt-1">
              {isLiveMode
                ? 'ส่งข้อความจาก LINE OA เข้ามาเพื่อเริ่มแชทจริง'
                : 'คลิกปุ่ม (+) เพื่อสร้าง User จำลอง'}
            </p>
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
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm text-slate-900 truncate">
                      {user.displayName}
                    </h2>
                    <div className="flex items-center space-x-1.5 flex-shrink-0 ml-1">
                      {Boolean(user.unreadCount && user.unreadCount > 0) && (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[18px] h-4 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
                          {user.unreadCount! > 99 ? '99+' : user.unreadCount}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {formatTime(user.lastMessageTimestamp)}
                      </span>
                    </div>
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
